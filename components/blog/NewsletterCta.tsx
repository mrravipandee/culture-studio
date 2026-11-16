"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowUpRight, Mail } from "lucide-react";

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  placeholder: string;
  button: string;
  notConnected: string;
  headingClassName: string;
}

/**
 * Newsletter banner (visual only). Submitting never sends data anywhere; it shows a
 * message that sign-up is not connected yet.
 */
export default function NewsletterCta({ eyebrow, title, description, placeholder, button, notConnected, headingClassName }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const inputId = useId();
  const noteId = useId();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // UI only: no request is made.
    setSubmitted(true);
  };

  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-[#2a0a0f] px-6 py-9 text-white sm:px-10 md:px-12 md:py-10">
      <div aria-hidden="true" className="cs-cta-sheen absolute inset-0 -z-10" />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/85">{eyebrow}</p>
          <h2 className={`${headingClassName} mt-3 text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[2.5rem]`}>{title}</h2>
          <p className="mt-2 text-[0.9375rem] text-white/80">{description}</p>
        </div>

        <div className="w-full lg:max-w-[27rem]">
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row" aria-describedby={submitted ? noteId : undefined}>
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>
            <div className="relative flex-1">
              <Mail aria-hidden="true" size={16} strokeWidth={1.5} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
              <input
                id={inputId}
                type="email"
                name="email"
                autoComplete="email"
                placeholder={placeholder}
                className="h-12 w-full rounded-md border border-white/40 bg-transparent pl-11 pr-4 text-sm text-white placeholder:text-white/70 focus:border-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              />
            </div>
            <button
              type="submit"
              className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-[#faf7f2] px-6 text-sm font-medium text-burgundy transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {button}
              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </form>
          <p id={noteId} role="status" className={`mt-3 text-xs text-white/80 ${submitted ? "" : "sr-only"}`}>
            {submitted ? notConnected : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
