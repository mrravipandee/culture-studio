"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, Link2 } from "lucide-react";
import { normaliseHref } from "@/lib/rich-text";

interface Props {
  open: boolean;
  initialHref: string;
  /** Text that will be linked (shown for context). Empty = the URL is inserted as text. */
  selectionText: string;
  onApply: (href: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

/** Add, edit or remove a hyperlink. Only safe addresses are accepted (see lib/rich-text.ts). */
export default function LinkDialog({ open, initialHref, selectionText, onApply, onRemove, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(initialHref);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const apply = () => {
    const href = normaliseHref(value);
    if (!href) {
      setError("Enter a valid address, e.g. https://example.com, /services or mailto:hello@example.com.");
      return;
    }
    onApply(href);
  };

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby={`${inputId}-title`}
      className="admin-dialog m-auto w-[min(30rem,calc(100vw-2rem))] rounded-xl border border-black/10 bg-white p-0 text-ink shadow-[0_24px_60px_-20px_rgba(36,12,14,0.45)] backdrop:bg-black/40"
    >
      {open && (
        <form
          className="p-6"
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <h2 id={`${inputId}-title`} className="flex items-center gap-2 text-lg font-semibold text-[#1a0a0c]">
            <Link2 aria-hidden="true" size={18} /> {initialHref ? "Edit link" : "Add link"}
          </h2>
          {selectionText && <p className="mt-1 truncate text-sm text-ink-2">Linking: &ldquo;{selectionText}&rdquo;</p>}
          <label htmlFor={inputId} className="mt-5 block text-sm font-medium text-ink">
            Address
          </label>
          <input
            id={inputId}
            value={value}
            autoFocus
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder="https://… or /services"
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={`${inputId}-help${error ? ` ${inputId}-error` : ""}`}
            className={`mt-1.5 h-11 w-full rounded-lg border bg-white px-3.5 text-sm focus-visible:outline-2 focus-visible:outline-burgundy ${error ? "border-[#a3242f]" : "border-black/15"}`}
          />
          <p id={`${inputId}-help`} className="mt-1.5 text-xs text-ink-3">
            Links to other websites open in a new tab. Site pages (e.g. /contact) open in the same tab.
          </p>
          {error && (
            <p id={`${inputId}-error`} className="mt-1.5 flex items-start gap-1.5 text-xs text-[#a3242f]">
              <AlertCircle aria-hidden="true" size={13} className="mt-px shrink-0" />
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
            {initialHref && (
              <button type="button" onClick={onRemove} className="mr-auto h-10 rounded-md px-3 text-sm font-medium text-[#a3242f] hover:bg-[#a3242f]/5 focus-visible:outline-2 focus-visible:outline-burgundy">
                Remove link
              </button>
            )}
            <button type="button" onClick={onClose} className="h-10 rounded-md border border-black/20 px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
              Cancel
            </button>
            <button type="submit" className="h-10 rounded-md bg-[#5a0c14] px-4 text-sm font-medium text-white hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy">
              {initialHref ? "Update link" : "Add link"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
