"use client";

import { useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { EASE } from "@/lib/motion";
import { formatDateTime } from "./settings-api";

/** Section card with a serif heading. */
export function SettingsCard({ id, title, description, icon, serifClassName, actions, children }: {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  serifClassName: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 rounded-xl border border-black/[0.08] bg-white/85 shadow-[0_1px_2px_rgba(36,12,14,0.04)] md:scroll-mt-20 xl:scroll-mt-8">
      <header className="flex flex-col gap-4 border-b border-black/[0.06] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
        <div className="flex items-start gap-3.5">
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f7e7e6] text-[#7a1f2b]">
            {icon}
          </span>
          <div>
            <h2 id={`${id}-title`} className={`${serifClassName} text-[1.625rem] font-medium leading-tight text-[#1a0a0c]`}>
              {title}
            </h2>
            <p className="mt-1 text-sm text-ink-2">{description}</p>
          </div>
        </div>
        {actions}
      </header>
      <div className="p-5 sm:p-7">{children}</div>
    </section>
  );
}

const emptySubscribe = () => () => {};

/** Viewer-local date/time, rendered after hydration (the server can't know the viewer's time zone). */
export function LocalTime({ iso, fallback = "—" }: { iso: string | null | undefined; fallback?: string }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  if (!iso) return <>{fallback}</>;
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {mounted ? formatDateTime(iso) : " "}
    </time>
  );
}

/** Inline success / error message with a subtle entrance (none under reduced motion). */
export function FormNotice({ notice }: { notice: { tone: "success" | "error"; text: string; action?: ReactNode } | null }) {
  const reduce = useReducedMotion();
  return (
    <div aria-live="polite" role="status">
      <AnimatePresence initial={false}>
        {notice && (
          <motion.p
            key={notice.text}
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={`flex flex-wrap items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm ${
              notice.tone === "success" ? "border-[#2f6b47]/20 bg-[#e5f1e8] text-[#245a3a]" : "border-[#a3242f]/20 bg-[#fbeeee] text-[#8a1d27]"
            }`}
          >
            {notice.tone === "success" ? <CheckCircle2 aria-hidden="true" size={17} className="mt-px shrink-0" /> : <AlertCircle aria-hidden="true" size={17} className="mt-px shrink-0" />}
            <span className="min-w-0 flex-1">{notice.text}</span>
            {notice.action}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export const inputClass = (invalid: boolean) =>
  `mt-1.5 h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-ink placeholder:text-ink-3 transition-colors hover:border-black/30 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-burgundy disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-ink-2 ${
    invalid ? "border-[#a3242f]" : "border-black/15"
  }`;

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-xs text-[#a3242f]">
      <AlertCircle aria-hidden="true" size={13} className="mt-px shrink-0" /> {message}
    </p>
  );
}

/** Password input with a show/hide toggle. Not animated. */
export function PasswordField({
  label,
  value,
  onChange,
  error,
  autoComplete,
  describedBy,
  disabled,
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete: "current-password" | "new-password";
  describedBy?: string;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={256}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={[error ? errorId : "", describedBy ?? ""].filter(Boolean).join(" ") || undefined}
          className={`${inputClass(Boolean(error))} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          disabled={disabled}
          className="absolute right-1 top-[calc(50%+3px)] grid size-9 -translate-y-1/2 place-items-center rounded-md text-ink-2 hover:bg-black/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-50"
        >
          {visible ? <EyeOff aria-hidden="true" size={17} /> : <Eye aria-hidden="true" size={17} />}
        </button>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export const primaryButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5a0c14] px-5 text-sm font-medium text-white transition-colors hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-black/15 bg-white px-5 text-sm font-medium text-ink transition-colors hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy disabled:cursor-not-allowed disabled:opacity-60";
