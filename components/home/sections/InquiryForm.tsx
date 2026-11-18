"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { disciplineById, disciplines, legacyServiceDiscipline } from "@/lib/content/disciplines";
import { contact } from "@/lib/content/home";
import type { ServiceId as LegacyServiceId } from "@/lib/content/service-catalog";
import { isApiResponse } from "@/lib/api/response";
import type { EnquirySource } from "@/lib/admin/types";
import type { EnquiryReceipt } from "@/lib/enquiries/types";
import { MESSAGE_MAX, MESSAGE_MIN, NOT_SURE, normalizeWebsite } from "@/lib/enquiries/constants";
import { isValidEmail } from "@/lib/validation/email";

const ENDPOINT = "/api/enquiries";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; reference: string } | { kind: "error"; message: string };
type FieldName = "name" | "email" | "company" | "website" | "services" | "message";
type Errors = Partial<Record<FieldName, string>>;
const FIELD_ORDER: FieldName[] = ["name", "email", "company", "website", "services", "message"];

/**
 * Selectable service pill. The native checkbox stays in the DOM (visually hidden),
 * so keyboard, screen readers, FormData and the DOM preselect all work unchanged;
 * the pill styles itself from the checkbox state with :has().
 */
function ServiceChip({
  value,
  label,
  onChange,
  dashed = false,
}: {
  value: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dashed?: boolean;
}) {
  return (
    <label
      className={`group body-6 inline-flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-full border py-2 pr-5 pl-3 text-paper-2 transition-colors duration-300 ease-editorial hover:border-paper-3 hover:text-paper has-[:checked]:border-paper has-[:checked]:bg-paper has-[:checked]:text-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-paper has-[:focus-visible]:outline-solid ${
        dashed ? "border-dashed border-paper-4" : "border-line"
      }`}
    >
      <input type="checkbox" name="services" value={value} onChange={onChange} className="sr-only" />
      <span
        aria-hidden="true"
        className="grid size-5 shrink-0 place-items-center rounded-full border border-paper-4 transition-colors duration-300 ease-editorial group-hover:border-paper-3 group-has-[:checked]:border-ink group-has-[:checked]:bg-ink"
      >
        <svg viewBox="0 0 12 12" className="size-2.5 text-paper opacity-0 transition-opacity duration-300 ease-editorial group-has-[:checked]:opacity-100">
          <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label}
    </label>
  );
}

/**
 * Enquiry form (fields and services of interest from the client copy deck):
 * Name, Work email, Company / Organisation, Website (optional), the four service
 * disciplines (one, several, or "Not sure yet") and what the visitor wants to achieve.
 *
 * Submits to POST /api/enquiries, which validates again on the server, applies rate limits
 * and spam checks, and stores the enquiry in MongoDB. No email is sent (none is claimed).
 * `source` records where the form was used. `?service=<id>` preselects a discipline.
 */
export default function InquiryForm({ email, source }: { email: string | null; source: EnquirySource }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const sendingLock = useRef(false);
  const shownAt = useRef(0);

  // Preselect from ?service= (DOM only) and note when the form became usable (spam timing).
  useEffect(() => {
    shownAt.current = Date.now();
    const param = new URLSearchParams(window.location.search).get("service");
    if (!param) return;
    const id = disciplineById(param)?.id ?? legacyServiceDiscipline[param as LegacyServiceId];
    if (!id) return;
    const box = formRef.current?.querySelector<HTMLInputElement>(`input[name="services"][value="${id}"]`);
    if (box) box.checked = true;
  }, []);

  // "Not sure yet" is exclusive with specific services.
  const onServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const boxes = formRef.current?.querySelectorAll<HTMLInputElement>('input[name="services"]') ?? [];
    if (!e.target.checked) return;
    boxes.forEach((b) => {
      if (e.target.value === NOT_SURE ? b.value !== NOT_SURE : b.value === NOT_SURE) b.checked = false;
    });
  };

  const focusFirst = (found: Errors) => {
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(first === "services" ? 'input[name="services"]' : `#inquiry-${first}`)?.focus();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sendingLock.current) return; // no double submissions
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const mail = String(data.get("email") || "").trim();
    const company = String(data.get("company") || "").trim();
    const website = String(data.get("website") || "").trim();
    const message = String(data.get("message") || "").trim();
    const picked = data.getAll("services").map(String);
    const honeypot = String(data.get("company_url") || "");

    // Instant feedback; the server validates everything again.
    const next: Errors = {};
    if (name.length < 2) next.name = "Please enter your name.";
    if (!mail) next.email = "Please enter your email address.";
    else if (!isValidEmail(mail)) next.email = "Please enter a valid email address, for example name@company.com.";
    if (website && normalizeWebsite(website) === null) next.website = "Please enter a valid website, for example company.com.";
    if (picked.length === 0) next.services = "Choose at least one service, or select “Not sure yet”.";
    if (!message) next.message = "Please tell us what you're looking to achieve.";
    else if (message.length < MESSAGE_MIN) next.message = `Please add a little more detail (at least ${MESSAGE_MIN} characters).`;
    else if (message.length > MESSAGE_MAX) next.message = `Please keep your message under ${MESSAGE_MAX} characters.`;
    setErrors(next);
    if (Object.keys(next).length) {
      focusFirst(next);
      return;
    }

    sendingLock.current = true;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name,
          email: mail,
          ...(company ? { company } : {}),
          ...(website ? { website } : {}),
          services: picked,
          message,
          source,
          ...(honeypot ? { company_url: honeypot } : {}),
          elapsedMs: shownAt.current ? Date.now() - shownAt.current : undefined,
        }),
      });
      const body: unknown = await res.json().catch(() => null);
      if (res.ok && isApiResponse(body) && body.success) {
        setStatus({ kind: "sent", reference: (body.data as EnquiryReceipt).reference });
        setErrors({});
        formRef.current?.reset(); // only after success
        return;
      }
      if (isApiResponse(body) && !body.success) {
        const fields = (body.error.fields ?? {}) as Errors;
        const known = Object.fromEntries(FIELD_ORDER.filter((k) => fields[k]).map((k) => [k, fields[k]])) as Errors;
        if (Object.keys(known).length) {
          setErrors(known);
          focusFirst(known);
        }
        setStatus({
          kind: "error",
          message:
            res.status === 429
              ? "You've sent several enquiries in a short time. Please try again a little later."
              : res.status >= 500
                ? "Enquiries can't be received right now. Please try again shortly, or use the contact details on this page."
                : body.error.message,
        });
        return;
      }
      setStatus({ kind: "error", message: "Your enquiry could not be sent. Please try again in a moment." });
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server. Check your connection and try again; your details are still here." });
    } finally {
      sendingLock.current = false;
    }
  };

  const clearError = (key: FieldName) => () => setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const field = "w-full rounded-lg border border-line bg-transparent px-4 py-3 body-3 text-paper placeholder:text-paper-4 transition-colors duration-300 ease-editorial focus:border-paper-3";
  const error = (id: FieldName) =>
    errors[id] ? (
      <p id={`inquiry-${id}-error`} className="caption-2 mt-2 text-paper">
        {errors[id]}
      </p>
    ) : null;
  const sending = status.kind === "sending";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby="inquiry-note" aria-busy={sending} className="grid gap-6">
      {/* Honeypot: invisible to people and assistive tech; bots that fill every field reveal themselves. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="inquiry-company-url">Company URL (leave empty)</label>
        <input id="inquiry-company-url" name="company_url" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="inquiry-name" className="eyebrow text-paper-3">Name *</label>
          <input id="inquiry-name" name="name" autoComplete="name" maxLength={120} onInput={clearError("name")} className={`${field} mt-2`} aria-invalid={!!errors.name} aria-describedby={errors.name ? "inquiry-name-error" : undefined} />
          {error("name")}
        </div>
        <div>
          <label htmlFor="inquiry-email" className="eyebrow text-paper-3">Work email *</label>
          <input id="inquiry-email" name="email" type="email" autoComplete="email" maxLength={254} onInput={clearError("email")} className={`${field} mt-2`} aria-invalid={!!errors.email} aria-describedby={errors.email ? "inquiry-email-error" : undefined} />
          {error("email")}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="inquiry-company" className="eyebrow text-paper-3">Company / Organisation</label>
          <input id="inquiry-company" name="company" autoComplete="organization" maxLength={160} onInput={clearError("company")} className={`${field} mt-2`} aria-invalid={!!errors.company} aria-describedby={errors.company ? "inquiry-company-error" : undefined} />
          {error("company")}
        </div>
        <div>
          <label htmlFor="inquiry-website" className="eyebrow text-paper-3">Website (optional)</label>
          <input id="inquiry-website" name="website" type="url" inputMode="url" autoComplete="url" maxLength={300} onInput={clearError("website")} className={`${field} mt-2`} aria-invalid={!!errors.website} aria-describedby={errors.website ? "inquiry-website-error" : undefined} />
          {error("website")}
        </div>
      </div>

      <fieldset aria-describedby={errors.services ? "inquiry-services-error" : undefined} onChange={clearError("services")}>
        <legend className="eyebrow text-paper-3">Services of interest *</legend>
        <p className="caption-5 mt-1 text-paper-3">Choose one or several.</p>
        <ul className={`mt-6 flex flex-wrap gap-2 border-y py-5 ${errors.services ? "border-paper-3" : "border-line"}`}>
          {disciplines.map((discipline) => (
            <li key={discipline.id}>
              <ServiceChip value={discipline.id} label={discipline.name} onChange={onServiceChange} />
            </li>
          ))}
          <li>
            <ServiceChip value={NOT_SURE} label="Not sure yet" onChange={onServiceChange} dashed />
          </li>
        </ul>
        {error("services")}
      </fieldset>

      <div>
        <label htmlFor="inquiry-message" className="eyebrow text-paper-3">What are you looking to achieve? *</label>
        <textarea
          id="inquiry-message"
          name="message"
          rows={4}
          maxLength={MESSAGE_MAX}
          onInput={clearError("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "inquiry-message-error inquiry-message-hint" : "inquiry-message-hint"}
          className={`${field} mt-2 resize-y`}
        />
        {error("message")}
        <p id="inquiry-message-hint" className="caption-5 mt-2 text-paper-3">
          Please share enough context to help CULT.URE understand the requirement. A response can then be directed towards the right next step.
        </p>
      </div>

      <div className="flex flex-col items-start gap-4">
        <button type="submit" disabled={sending} className="btn btn-inverse btn-lg">
          {sending ? "Sending…" : "Submit enquiry"}
        </button>
        <p id="inquiry-note" role="status" aria-live="polite" className="caption-2 text-paper-3">
          {status.kind === "sent" && (
            <>
              Thank you. Your enquiry has been received (reference {status.reference}).
            </>
          )}
          {status.kind === "error" && (
            <>
              {status.message}
              {email && (
                <>
                  {" "}
                  You can also email{" "}
                  <a href={`mailto:${email}`} className="link text-paper">
                    {email}
                  </a>{" "}
                  or call{" "}
                  <a href={contact.phone.href} className="link text-paper">
                    {contact.phone.display}
                  </a>
                  .
                </>
              )}
            </>
          )}
        </p>
      </div>
    </form>
  );
}
