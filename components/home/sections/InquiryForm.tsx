"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { serviceCategories, services, type ServiceId } from "@/lib/content/service-catalog";

const NOT_SURE = "not-sure";

/** Optional real endpoint (e.g. a form service URL). Set NEXT_PUBLIC_INQUIRY_ENDPOINT to enable. */
const ENDPOINT = process.env.NEXT_PUBLIC_INQUIRY_ENDPOINT || "";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; via: "endpoint" | "email" } | { kind: "error"; message: string };
type Errors = Partial<Record<"name" | "email" | "services", string>>;

/**
 * Inquiry form with service selection (one, several, or "Not sure yet").
 * Submission is never simulated:
 *  1. NEXT_PUBLIC_INQUIRY_ENDPOINT set → POST JSON to it.
 *  2. else contact email set → open the visitor's email app with the inquiry prefilled.
 *  3. else → submitting is disabled and the visitor is told why.
 * `?service=<id>` in the URL preselects that service.
 */
export default function InquiryForm({ email }: { email: string | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const canSend = Boolean(ENDPOINT || email);

  // Preselect from ?service= (DOM only; no state update needed).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("service");
    if (!id || !(id in services)) return;
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

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const mail = String(data.get("email") || "").trim();
    const company = String(data.get("company") || "").trim();
    const message = String(data.get("message") || "").trim();
    const picked = data.getAll("services").map(String);

    const next: Errors = {};
    if (!name) next.name = "Please enter your name.";
    if (!mail) next.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) next.email = "Please enter a valid email address, for example name@company.com.";
    if (picked.length === 0) next.services = "Choose at least one service, or select “Not sure yet”.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      formRef.current?.querySelector<HTMLElement>(first === "services" ? 'input[name="services"]' : `#inquiry-${first}`)?.focus();
      return;
    }

    const serviceNames = picked.map((id) => (id === NOT_SURE ? "Not sure yet" : services[id as ServiceId].name));

    if (ENDPOINT) {
      setStatus({ kind: "sending" });
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ name, email: mail, company, services: serviceNames, message }),
        });
        if (!res.ok) throw new Error(String(res.status));
        setStatus({ kind: "sent", via: "endpoint" });
        e.currentTarget?.reset();
      } catch {
        setStatus({ kind: "error", message: "Your inquiry could not be sent. Please try again in a moment." });
      }
      return;
    }

    if (email) {
      const lines = [`Name: ${name}`, `Email: ${mail}`];
      if (company) lines.push(`Company: ${company}`);
      lines.push(`Services: ${serviceNames.join(", ")}`);
      if (message) lines.push("", message);
      const body = lines.join("\n");
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Inquiry: ${serviceNames.join(", ")}`)}&body=${encodeURIComponent(body)}`;
      setStatus({ kind: "sent", via: "email" });
    }
  };

  const field = "w-full rounded-lg border border-line bg-transparent px-4 py-3 body-3 text-paper placeholder:text-paper-4 transition-colors duration-300 ease-editorial focus:border-paper-3 focus:outline-none";
  const error = (id: keyof Errors) =>
    errors[id] ? (
      <p id={`inquiry-${id}-error`} className="caption-2 mt-2 text-paper">
        {errors[id]}
      </p>
    ) : null;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby="inquiry-note" className="grid gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="inquiry-name" className="eyebrow text-paper-3">Name *</label>
          <input id="inquiry-name" name="name" autoComplete="name" className={`${field} mt-2`} aria-invalid={!!errors.name} aria-describedby={errors.name ? "inquiry-name-error" : undefined} />
          {error("name")}
        </div>
        <div>
          <label htmlFor="inquiry-email" className="eyebrow text-paper-3">Email *</label>
          <input id="inquiry-email" name="email" type="email" autoComplete="email" className={`${field} mt-2`} aria-invalid={!!errors.email} aria-describedby={errors.email ? "inquiry-email-error" : undefined} />
          {error("email")}
        </div>
      </div>

      <div>
        <label htmlFor="inquiry-company" className="eyebrow text-paper-3">Company or brand</label>
        <input id="inquiry-company" name="company" autoComplete="organization" className={`${field} mt-2`} />
      </div>

      <fieldset aria-describedby={errors.services ? "inquiry-services-error" : undefined}>
        <legend className="eyebrow text-paper-3">Services you are interested in *</legend>
        <p className="caption-5 mt-1 text-paper-4">Choose one or several.</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {serviceCategories.map((cat) => (
            <div key={cat.id}>
              <p className="caption-4 text-paper-3">{cat.name}</p>
              <ul className="mt-2 grid gap-2">
                {cat.services.map((id) => (
                  <li key={id}>
                    <label className="body-6 flex cursor-pointer items-start gap-3 text-paper-2 hover:text-paper">
                      <input type="checkbox" name="services" value={id} onChange={onServiceChange} className="mt-1 size-4 shrink-0 accent-[#FFFFFF]" />
                      {services[id].name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <label className="body-6 mt-4 flex cursor-pointer items-center gap-3 border-t border-line pt-4 text-paper-2 hover:text-paper">
          <input type="checkbox" name="services" value={NOT_SURE} onChange={onServiceChange} className="size-4 shrink-0 accent-[#FFFFFF]" />
          Not sure yet
        </label>
        {error("services")}
      </fieldset>

      <div>
        <label htmlFor="inquiry-message" className="eyebrow text-paper-3">What would you like to achieve?</label>
        <textarea id="inquiry-message" name="message" rows={4} className={`${field} mt-2 resize-y`} />
      </div>

      <div className="flex flex-col items-start gap-4">
        <button type="submit" disabled={!canSend || status.kind === "sending"} className="btn btn-inverse btn-lg">
          {status.kind === "sending" ? "Sending…" : ENDPOINT ? "Send inquiry" : "Send inquiry by email"}
        </button>
        <p id="inquiry-note" role="status" aria-live="polite" className="caption-2 text-paper-3">
          {status.kind === "sent" && status.via === "endpoint" && "Thank you. Your inquiry has been sent."}
          {status.kind === "sent" && status.via === "email" && "Your email app should open with the inquiry prefilled. Send it from there to complete your inquiry."}
          {status.kind === "error" && status.message}
          {status.kind === "idle" && !canSend && "Online inquiries are not connected yet. The inbox is being set up; this form will be enabled once it is."}
          {status.kind === "idle" && canSend && !ENDPOINT && "Sending opens your email app with your answers filled in."}
        </p>
      </div>
    </form>
  );
}
