"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  icon?: ReactNode;
  /** Disables both buttons while an action runs (prevents double submission). */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation for destructive or important actions. Native <dialog>: modal, focus kept
 * inside by the browser, Escape cancels. Focus starts on Cancel (the safe choice).
 */
export default function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = "Cancel", tone = "primary", icon, busy = false, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const confirmClass =
    tone === "danger"
      ? "bg-[#a3242f] hover:bg-[#8e1d27] focus-visible:outline-[#a3242f]"
      : "bg-[#5a0c14] hover:bg-[#6b111b] focus-visible:outline-burgundy";

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      className="admin-dialog m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-black/10 bg-white p-0 text-ink shadow-[0_24px_60px_-20px_rgba(36,12,14,0.45)] backdrop:bg-black/40"
    >
      {open && (
        <div className="p-6">
          {icon && (
            <span aria-hidden="true" className={`grid size-11 place-items-center rounded-full ${tone === "danger" ? "bg-[#a3242f]/10 text-[#a3242f]" : "bg-[#5a0c14]/10 text-[#5a0c14]"}`}>
              {icon}
            </span>
          )}
          <h2 id="confirm-dialog-title" className="mt-4 text-lg font-semibold text-[#1a0a0c]">
            {title}
          </h2>
          <div id="confirm-dialog-desc" className="mt-2 text-sm leading-relaxed text-ink-2">
            {description}
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              autoFocus
              className="h-11 rounded-md border border-black/20 px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={`h-11 rounded-md px-4 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 ${confirmClass}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
