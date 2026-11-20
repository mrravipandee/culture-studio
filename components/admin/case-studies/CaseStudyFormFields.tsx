"use client";

import { useId, type ReactNode } from "react";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import type { FormErrors } from "@/lib/admin/case-study-utils";

/** Form primitives for the case study editor (labels, hints, errors, repeatable rows). */

export const inputClass = (error?: string) =>
  `w-full rounded-lg border bg-white px-3.5 text-sm text-ink placeholder:text-ink-3 transition-colors focus-visible:outline-2 focus-visible:outline-burgundy disabled:bg-black/[0.03] ${
    error ? "border-[#a3242f]" : "border-black/15 hover:border-black/30"
  }`;

export function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-[#a3242f]">
      <AlertCircle aria-hidden="true" size={13} className="shrink-0" />
      {error}
    </p>
  );
}

export const describedBy = (id: string, error?: string, hint?: boolean) => [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;

export function Field({ id, label, hint, error, count, children }: { id: string; label: string; hint?: ReactNode; error?: string; count?: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {count && <span className="text-xs tabular-nums text-ink-3">{count}</span>}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-xs text-ink-3">
          {hint}
        </p>
      )}
      <div className="mt-1.5">{children}</div>
      <ErrorText id={id} error={error} />
    </div>
  );
}

export function SectionTitle({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">{children}</h3>
      {note && <p className="mt-1 text-xs text-ink-3">{note}</p>}
    </div>
  );
}

/** Errors for row `i` of a group: { "<field>": message } from keys like "results.1.value". */
export const rowErrors = (errors: FormErrors, group: string, i: number) =>
  Object.fromEntries(
    Object.entries(errors)
      .filter(([k]) => k.startsWith(`${group}.${i}.`))
      .map(([k, v]) => [k.slice(`${group}.${i}.`.length), v]),
  ) as Record<string, string>;

/**
 * Repeatable rows with add / remove. `render(item, i, ids)` draws the row's inputs; the
 * group-level error (e.g. "results" or "results.2") is shown under the list.
 */
export function Repeater<T>({
  legend,
  items,
  max,
  addLabel,
  empty,
  onAdd,
  onRemove,
  render,
  groupError,
}: {
  legend: string;
  items: T[];
  max: number;
  addLabel: string;
  empty?: string;
  onAdd: () => void;
  onRemove: (i: number) => void;
  render: (item: T, i: number, idBase: string) => ReactNode;
  groupError?: string;
}) {
  const base = useId();
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      {items.length === 0 && empty && <p className="mt-1.5 text-xs text-ink-3">{empty}</p>}
      <ul className="mt-2 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 rounded-lg border border-black/[0.07] bg-white/60 p-2.5">
            <div className="min-w-0 flex-1">{render(item, i, `${base}-${i}`)}</div>
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove ${legend.toLowerCase()} item ${i + 1}`}
              className="grid size-11 shrink-0 place-items-center rounded-lg border border-black/15 text-ink-2 hover:border-[#a3242f]/40 hover:text-[#a3242f] focus-visible:outline-2 focus-visible:outline-burgundy"
            >
              <Trash2 aria-hidden="true" size={16} />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onAdd}
        disabled={items.length >= max}
        className="mt-2 inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-burgundy hover:bg-burgundy/5 focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-40"
      >
        <Plus aria-hidden="true" size={16} /> {addLabel}
      </button>
      {groupError && (
        <p role="alert" className="mt-1 flex items-center gap-1.5 text-xs text-[#a3242f]">
          <AlertCircle aria-hidden="true" size={13} />
          {groupError}
        </p>
      )}
    </fieldset>
  );
}
