"use client";

import { useId, useRef, useState } from "react";
import { AlertCircle, ImagePlus } from "lucide-react";
import { IMAGE_TYPES, validateImageFile } from "@/lib/admin/case-study-utils";

export interface LibraryImage {
  src: string;
  alt: string;
}

interface Props {
  library: LibraryImage[];
  selected: string | null;
  onPick: (src: string, suggestedAlt: string) => void;
  /** Called with each new local preview URL so it can be released later. */
  onPreviewUrl: (url: string) => void;
  label?: string;
}

/**
 * Choose a site image (already in /public) or a local file. Local files become a browser
 * preview (blob:) only: nothing is uploaded, and they disappear on reload.
 */
export default function ImagePicker({ library, selected, onPick, onPreviewUrl, label = "Choose a file" }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const groupId = useId();

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-black/20 bg-white px-3.5 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy"
        >
          <ImagePlus aria-hidden="true" size={16} /> {label}
        </button>
        <span className="text-xs text-ink-3">PNG, JPG or WebP, up to 2 MB. Preview only, not uploaded.</span>
      </div>
      <input
        ref={input}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const problem = validateImageFile(file);
          if (problem) return setError(problem);
          setError(null);
          const url = URL.createObjectURL(file);
          onPreviewUrl(url);
          onPick(url, "");
        }}
      />
      {error && (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-[#a3242f]">
          <AlertCircle aria-hidden="true" size={13} /> {error}
        </p>
      )}
      {library.length > 0 && (
        <fieldset className="mt-3">
          <legend id={groupId} className="text-xs text-ink-3">
            Or use a site image
          </legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {library.map((img) => (
              <button
                key={img.src}
                type="button"
                onClick={() => {
                  setError(null);
                  onPick(img.src, img.alt);
                }}
                aria-pressed={selected === img.src}
                aria-label={img.alt || img.src}
                title={img.alt || img.src}
                className={`relative h-12 w-[4.5rem] overflow-hidden rounded-md border-2 bg-black/5 bg-cover bg-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${
                  selected === img.src ? "border-[#5a0c14]" : "border-transparent hover:border-black/20"
                }`}
                style={{ backgroundImage: `url("${img.src}")` }}
              />
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
