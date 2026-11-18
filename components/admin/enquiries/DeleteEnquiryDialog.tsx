"use client";

import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

interface Props {
  /** Number of enquiries to delete; null keeps the dialog closed. */
  count: number | null;
  /** Name shown for a single delete. */
  name?: string;
  /** A delete is in progress: both buttons are disabled. */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation before deleting. Uses the native <dialog> element: modal, focus-trapped
 * by the browser, Escape cancels.
 */
export default function DeleteEnquiryDialog({ count, name, busy = false, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = count !== null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const title = count === 1 ? `Delete enquiry${name ? ` from ${name}` : ""}?` : `Delete ${count ?? 0} enquiries?`;

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      className="admin-dialog m-auto w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-black/10 bg-white p-0 text-ink shadow-[0_24px_60px_-20px_rgba(36,12,14,0.45)] backdrop:bg-black/40"
    >
      <div className="p-6">
        <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-[#a3242f]/10 text-[#a3242f]">
          <Trash2 size={20} strokeWidth={1.75} />
        </span>
        <h2 id="delete-dialog-title" className="mt-4 text-lg font-semibold text-[#1a0a0c]">
          {title}
        </h2>
        <p id="delete-dialog-desc" className="mt-2 text-sm leading-relaxed text-ink-2">
          {count === 1 ? "It" : "They"} will be removed from the Enquiries list and dashboard. The record is kept in the database as deleted, so it can be recovered if needed.
        </p>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            autoFocus
            className="h-11 rounded-md border border-black/20 px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="h-11 rounded-md bg-[#a3242f] px-4 text-sm font-medium text-white hover:bg-[#8e1d27] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3242f] disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
