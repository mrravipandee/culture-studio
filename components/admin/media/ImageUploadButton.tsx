"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { MEDIA_UPLOAD } from "@/lib/case-studies/constants";
import { uploadImageToCloudinary } from "./cloudinary-upload";

interface Props {
  /** Accessible name, e.g. "Upload cover image". */
  label: string;
  onUploaded: (image: { url: string; publicId: string }) => void;
  /** Disables the button (e.g. while the form is saving). */
  disabled?: boolean;
}

/**
 * Picks one image and uploads it to Cloudinary (signed, admin-only). Shows progress and a
 * friendly error; cancels the upload if the editor closes. Only JPG, PNG or WebP up to 5 MB.
 */
export default function ImageUploadButton({ label, onUploaded, disabled = false }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploading = progress !== null;

  useEffect(() => () => controller.current?.abort(), []);

  const onFile = async (file: File) => {
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    setError(null);
    setProgress(0);
    try {
      const result = await uploadImageToCloudinary(file, { signal: ctrl.signal, onProgress: setProgress });
      if (result.ok) onUploaded({ url: result.url, publicId: result.publicId });
      else setError(result.message);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setError("The upload failed. Please try again.");
    } finally {
      if (controller.current === ctrl) {
        controller.current = null;
        setProgress(null);
      }
    }
  };

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={MEDIA_UPLOAD.mimeTypes.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void onFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={disabled || uploading}
        aria-label={label}
        className="inline-flex h-11 items-center gap-2 rounded-md border border-black/20 bg-white px-3.5 text-sm font-medium text-ink transition-colors hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-60"
      >
        {uploading ? <Loader2 aria-hidden="true" size={16} className="animate-spin motion-reduce:animate-none" /> : <Upload aria-hidden="true" size={16} />}
        {uploading ? `Uploading… ${Math.round((progress ?? 0) * 100)}%` : "Upload image"}
      </button>
      <span className="ml-2 text-xs text-ink-3">JPG, PNG or WebP, up to {MEDIA_UPLOAD.maxBytes / 1024 / 1024} MB.</span>
      <p aria-live="polite" className="sr-only">
        {uploading ? "Uploading image" : ""}
      </p>
      {error && (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-[#a3242f]">
          <AlertCircle aria-hidden="true" size={13} />
          {error}
        </p>
      )}
    </div>
  );
}
