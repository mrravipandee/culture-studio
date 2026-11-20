"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, Info, UserPlus } from "lucide-react";
import { SUBSCRIBER_SOURCES, subscriberSourceLabels, subscriberStatusLabels, type SubscriberStatus } from "@/lib/admin/types";
import { normaliseEmail, validateNewSubscriber, type NewSubscriberErrors, type NewSubscriberValues } from "@/lib/admin/subscriber-utils";

interface Props {
  open: boolean;
  existingEmails: string[];
  /** Saves the subscriber; resolves with server field errors on failure (dialog stays open). */
  onSubmit: (values: NewSubscriberValues) => Promise<{ ok: true } | { ok: false; message: string; fields?: NewSubscriberErrors }>;
  onClose: () => void;
}

const initial: NewSubscriberValues = { name: "", email: "", source: "MANUAL", status: "ACTIVE" };

/** Add a subscriber by hand (saved to MongoDB; no email is sent, no consent recorded). */
export default function AddSubscriberDialog({ open, existingEmails, onSubmit, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const lock = useRef(false);
  const [values, setValues] = useState<NewSubscriberValues>(initial);
  const [errors, setErrors] = useState<NewSubscriberErrors>({});
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const id = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      lock.current = false;
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);

  const update = (patch: Partial<NewSubscriberValues>) => {
    const next = { ...values, ...patch };
    setValues(next);
    if (tried) setErrors(validateNewSubscriber(next, existingEmails));
  };

  const submit = async () => {
    if (lock.current) return;
    setTried(true);
    const found = validateNewSubscriber(values, existingEmails);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    lock.current = true;
    setSaving(true);
    setFormError(null);
    const result = await onSubmit({ ...values, name: values.name.replace(/\s+/g, " ").trim(), email: normaliseEmail(values.email) });
    lock.current = false;
    setSaving(false);
    if (!result.ok) {
      setErrors(result.fields ?? {});
      setFormError(result.fields && Object.keys(result.fields).length ? null : result.message);
    }
  };

  const field = "mt-1.5 h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-burgundy";

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby={`${id}-title`}
      className="admin-dialog m-auto w-[min(30rem,calc(100vw-2rem))] rounded-xl border border-black/10 bg-white p-0 text-ink shadow-[0_24px_60px_-20px_rgba(36,12,14,0.45)] backdrop:bg-black/40"
    >
      {open && (
        <form
          noValidate
          className="max-h-[88vh] overflow-y-auto p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <h2 id={`${id}-title`} className="flex items-center gap-2 text-lg font-semibold text-[#1a0a0c]">
            <UserPlus aria-hidden="true" size={19} /> Add Subscriber
          </h2>
          <p className="mt-3 flex gap-2 rounded-lg border border-[#c08a2d]/25 bg-[#c08a2d]/[0.07] p-3 text-xs leading-relaxed text-[#6b4a12]">
            <Info aria-hidden="true" size={15} className="mt-px shrink-0" />
            Saved to the subscriber list. No confirmation email is sent and no consent or verification is recorded, so only add people who asked to subscribe.
          </p>

          <label htmlFor={`${id}-email`} className="mt-5 block text-sm font-medium text-ink">
            Email <span className="font-normal text-ink-3">(required)</span>
          </label>
          <input
            id={`${id}-email`}
            type="email"
            inputMode="email"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
            value={values.email}
            maxLength={260}
            onChange={(e) => update({ email: e.target.value })}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
            className={`${field} ${errors.email ? "border-[#a3242f]" : "border-black/15"}`}
            placeholder="name@example.com"
          />
          {errors.email && (
            <p id={`${id}-email-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-[#a3242f]">
              <AlertCircle aria-hidden="true" size={13} /> {errors.email}
            </p>
          )}

          <label htmlFor={`${id}-name`} className="mt-4 block text-sm font-medium text-ink">
            Name <span className="font-normal text-ink-3">(optional)</span>
          </label>
          <input
            id={`${id}-name`}
            value={values.name}
            maxLength={100}
            onChange={(e) => update({ name: e.target.value })}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            className={`${field} ${errors.name ? "border-[#a3242f]" : "border-black/15"}`}
          />
          {errors.name && (
            <p id={`${id}-name-error`} className="mt-1.5 text-xs text-[#a3242f]">
              {errors.name}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${id}-source`} className="block text-sm font-medium text-ink">
                Source
              </label>
              <select
                id={`${id}-source`}
                value={values.source}
                onChange={(e) => update({ source: e.target.value as NewSubscriberValues["source"] })}
                aria-invalid={errors.source ? true : undefined}
                className={`${field} ${errors.source ? "border-[#a3242f]" : "border-black/15"}`}
              >
                {SUBSCRIBER_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {subscriberSourceLabels[src]}
                  </option>
                ))}
              </select>
              {errors.source && <p className="mt-1.5 text-xs text-[#a3242f]">{errors.source}</p>}
            </div>
            <div>
              <label htmlFor={`${id}-status`} className="block text-sm font-medium text-ink">
                Status
              </label>
              <select id={`${id}-status`} value={values.status} onChange={(e) => update({ status: e.target.value as SubscriberStatus })} className={`${field} border-black/15`}>
                {(Object.keys(subscriberStatusLabels) as SubscriberStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {subscriberStatusLabels[st]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formError && (
            <p role="alert" className="mt-4 flex items-center gap-1.5 text-sm text-[#a3242f]">
              <AlertCircle aria-hidden="true" size={15} /> {formError}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2.5">
            <button type="button" onClick={onClose} disabled={saving} className="h-11 rounded-md border border-black/20 px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="h-11 rounded-md bg-[#5a0c14] px-4 text-sm font-medium text-white hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:opacity-60">
              {saving ? "Adding…" : "Add Subscriber"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
