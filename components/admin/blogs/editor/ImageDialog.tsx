"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, ImageIcon } from "lucide-react";
import CaseStudyCover from "../../case-studies/CaseStudyCover";
import ImagePicker, { type LibraryImage } from "../ImagePicker";

export interface ArticleImageAttrs {
  src: string;
  alt: string;
  caption: string;
  align: "center" | "wide";
}

interface Props {
  open: boolean;
  /** Present when editing the selected image. */
  initial: ArticleImageAttrs | null;
  library: LibraryImage[];
  onPreviewUrl: (url: string) => void;
  onApply: (attrs: ArticleImageAttrs) => void;
  onRemove: () => void;
  onClose: () => void;
}

/** Insert or edit an image in the article: source, required alt text, caption, alignment. */
export default function ImageDialog({ open, initial, library, onPreviewUrl, onApply, onRemove, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [attrs, setAttrs] = useState<ArticleImageAttrs>(initial ?? { src: "", alt: "", caption: "", align: "center" });
  const [errors, setErrors] = useState<{ src?: string; alt?: string }>({});
  const id = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const apply = () => {
    const next = { ...attrs, alt: attrs.alt.trim(), caption: attrs.caption.trim() };
    const e: typeof errors = {};
    if (!next.src) e.src = "Choose an image.";
    if (!next.alt) e.alt = "Describe the image for screen readers.";
    else if (next.alt.length > 160) e.alt = "Keep the description under 160 characters.";
    setErrors(e);
    if (Object.keys(e).length === 0) onApply(next);
  };

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby={`${id}-title`}
      className="admin-dialog m-auto w-[min(34rem,calc(100vw-2rem))] rounded-xl border border-black/10 bg-white p-0 text-ink shadow-[0_24px_60px_-20px_rgba(36,12,14,0.45)] backdrop:bg-black/40"
    >
      {open && (
        <form
          className="max-h-[85vh] overflow-y-auto p-6"
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <h2 id={`${id}-title`} className="flex items-center gap-2 text-lg font-semibold text-[#1a0a0c]">
            <ImageIcon aria-hidden="true" size={18} /> {initial ? "Edit image" : "Insert image"}
          </h2>
          <CaseStudyCover src={attrs.src || null} alt={attrs.alt} label="Image" sizes="34rem" className="mt-4 aspect-[16/9] rounded-lg" />
          <div className="mt-4">
            <ImagePicker library={library} selected={attrs.src || null} onPreviewUrl={onPreviewUrl} label={attrs.src ? "Replace image" : "Choose a file"} onPick={(src, alt) => setAttrs((a) => ({ ...a, src, alt: a.alt || alt }))} />
            {errors.src && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-[#a3242f]">
                <AlertCircle aria-hidden="true" size={13} /> {errors.src}
              </p>
            )}
          </div>
          <label htmlFor={`${id}-alt`} className="mt-5 block text-sm font-medium text-ink">
            Alt text <span className="font-normal text-ink-3">(required)</span>
          </label>
          <input
            id={`${id}-alt`}
            value={attrs.alt}
            maxLength={200}
            onChange={(e) => setAttrs((a) => ({ ...a, alt: e.target.value }))}
            aria-invalid={errors.alt ? true : undefined}
            aria-describedby={errors.alt ? `${id}-alt-error` : undefined}
            className={`mt-1.5 h-11 w-full rounded-lg border bg-white px-3.5 text-sm focus-visible:outline-2 focus-visible:outline-burgundy ${errors.alt ? "border-[#a3242f]" : "border-black/15"}`}
          />
          {errors.alt && (
            <p id={`${id}-alt-error`} className="mt-1.5 text-xs text-[#a3242f]">
              {errors.alt}
            </p>
          )}
          <label htmlFor={`${id}-caption`} className="mt-4 block text-sm font-medium text-ink">
            Caption <span className="font-normal text-ink-3">(optional)</span>
          </label>
          <input
            id={`${id}-caption`}
            value={attrs.caption}
            maxLength={200}
            onChange={(e) => setAttrs((a) => ({ ...a, caption: e.target.value }))}
            className="mt-1.5 h-11 w-full rounded-lg border border-black/15 bg-white px-3.5 text-sm focus-visible:outline-2 focus-visible:outline-burgundy"
          />
          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-ink">Width</legend>
            <div className="mt-2 flex gap-2">
              {(["center", "wide"] as const).map((align) => (
                <label
                  key={align}
                  className={`inline-flex h-10 cursor-pointer items-center rounded-full border px-4 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-burgundy ${
                    attrs.align === align ? "border-[#5a0c14] bg-[#5a0c14] text-white" : "border-black/15 text-ink"
                  }`}
                >
                  <input type="radio" name={`${id}-align`} value={align} checked={attrs.align === align} onChange={() => setAttrs((a) => ({ ...a, align }))} className="sr-only" />
                  {align === "center" ? "Centred (text width)" : "Full width"}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
            {initial && (
              <button type="button" onClick={onRemove} className="mr-auto h-10 rounded-md px-3 text-sm font-medium text-[#a3242f] hover:bg-[#a3242f]/5 focus-visible:outline-2 focus-visible:outline-burgundy">
                Remove image
              </button>
            )}
            <button type="button" onClick={onClose} className="h-10 rounded-md border border-black/20 px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
              Cancel
            </button>
            <button type="submit" className="h-10 rounded-md bg-[#5a0c14] px-4 text-sm font-medium text-white hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy">
              {initial ? "Update image" : "Insert image"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
