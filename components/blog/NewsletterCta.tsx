"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, ArrowUpRight, Loader2, Mail } from "lucide-react";
import { isApiResponse } from "@/lib/api/response";
import { isValidEmail, normalizeEmail } from "@/lib/validation/email";

type Source = "WEBSITE" | "BLOG" | "CASE_STUDY";

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  placeholder: string;
  button: string;
  success: { title: string; body: string };
  headingClassName: string;
  /** Where the form is shown (stored with the subscriber). */
  source?: Source;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Newsletter sign-up. Posts to /api/subscribers (stored once per email in MongoDB; a repeat
 * sign-up updates the same record). On success the form gives way to an animated thank-you
 * (a drawn check mark and a soft rise); reduced motion gets a simple fade. Includes a hidden
 * honeypot and a fill-time signal for spam, and never sends any email.
 */
export default function NewsletterCta({ eyebrow, title, description, placeholder, button, success, headingClassName, source = "BLOG" }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const shownAt = useRef(0);
  const inFlight = useRef(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const thanks = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inputId = useId();
  const errorId = useId();

  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  // Move focus to the thank-you so screen-reader and keyboard users land on it.
  useEffect(() => {
    if (state === "done") thanks.current?.focus();
  }, [state]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    const value = normalizeEmail(email);
    if (!value) return setError("Please enter your email address.");
    if (!isValidEmail(value)) return setError("Please enter a valid email address, for example name@company.com.");

    inFlight.current = true;
    setError(null);
    setState("submitting");
    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: value, source, company_url: honeypot.current?.value ?? "", elapsedMs: Math.max(0, Date.now() - shownAt.current) }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (response.ok && isApiResponse(body) && body.success) {
        setState("done");
        return;
      }
      const message = isApiResponse(body) && !body.success ? (body.error.fields?.email ?? body.error.message) : "Something went wrong. Please try again.";
      setError(message);
      setState("idle");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setState("idle");
    } finally {
      inFlight.current = false;
    }
  };

  const submitting = state === "submitting";

  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-[#2a0a0f] px-6 py-9 text-white sm:px-10 md:px-12 md:py-10">
      <div aria-hidden="true" className="cs-cta-sheen absolute inset-0 -z-10" />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/85">{eyebrow}</p>
          <h2 className={`${headingClassName} mt-3 text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[2.5rem]`}>{title}</h2>
          <p className="mt-2 text-[0.9375rem] text-white/80">{description}</p>
        </div>

        <div className="relative w-full lg:max-w-[27rem]">
          <AnimatePresence mode="wait" initial={false}>
            {state !== "done" ? (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                noValidate
                aria-busy={submitting}
                initial={false}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: reduce ? 0.15 : 0.35, ease: EASE }}
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label htmlFor={inputId} className="sr-only">
                    Email address
                  </label>
                  <div className="relative flex-1">
                    <Mail aria-hidden="true" size={16} strokeWidth={1.5} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
                    <input
                      id={inputId}
                      type="email"
                      name="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={submitting}
                      placeholder={placeholder}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? errorId : undefined}
                      className={`h-12 w-full rounded-md border bg-transparent pl-11 pr-4 text-sm text-white placeholder:text-white/70 focus:border-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-70 ${
                        error ? "border-[#ffb4b4]" : "border-white/40"
                      }`}
                    />
                  </div>
                  {/* Honeypot: invisible to people, often filled by bots. */}
                  <input ref={honeypot} type="text" name="company_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-[#faf7f2] px-6 text-sm font-medium text-burgundy transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-80"
                  >
                    {submitting ? <Loader2 aria-hidden="true" size={16} className="animate-spin motion-reduce:animate-none" /> : null}
                    {submitting ? "Subscribing…" : button}
                    {!submitting && <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.p
                      key="error"
                      id={errorId}
                      role="alert"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 flex items-center gap-1.5 text-xs text-[#ffd2d2]"
                    >
                      <AlertCircle aria-hidden="true" size={14} className="shrink-0" />
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.form>
            ) : (
              <motion.div
                key="thanks"
                ref={thanks}
                tabIndex={-1}
                role="status"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: reduce ? 0.2 : 0.55, ease: EASE }}
                className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-4 outline-none backdrop-blur-sm"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#faf7f2] text-burgundy">
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      initial={reduce ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: reduce ? 0 : 0.25, ease: EASE }}
                    />
                  </svg>
                </span>
                <div>
                  <motion.p
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: reduce ? 0 : 0.2, ease: EASE }}
                    className="text-base font-medium text-white"
                  >
                    {success.title}
                  </motion.p>
                  <motion.p
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: reduce ? 0 : 0.32, ease: EASE }}
                    className="mt-0.5 text-sm text-white/75"
                  >
                    {success.body}
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
