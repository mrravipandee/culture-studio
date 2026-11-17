"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";

/**
 * Admin sign-in form. Holds only what the user types; it never sees a token or secret.
 * The server sets the HTTP-only session cookie; on success it navigates to the dashboard,
 * where the proxy and the page re-check the session on the server.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
  "h-[3.75rem] w-full rounded-[3px] border bg-white/70 pl-[4.25rem] text-base text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] duration-200 focus:border-burgundy focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/25 disabled:opacity-60";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!validate()) return;

    setPending(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data: { ok?: boolean; redirect?: string; error?: string } = await response.json().catch(() => ({}));

      if (response.ok && data.ok) {
        setPassword("");
        router.replace("/admin/dashboard");
        router.refresh();
        return;
      }
      setError(data.error ?? "Invalid email or password.");
      setPassword("");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    }
    setPending(false);
  };

  return (
    <form onSubmit={onSubmit} noValidate aria-describedby={error ? errorId : undefined} className="mt-12 space-y-6">
      {/* Email */}
      <div>
        <label htmlFor={emailId} className="sr-only">
          Email address
        </label>
        <div className="relative">
          <Mail aria-hidden="true" size={22} strokeWidth={1.5} className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-ink-2" />
          <input
            id={emailId}
            type="email"
            name="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
            className={`${fieldClass} pr-5 ${fieldErrors.email ? "border-burgundy" : "border-black/25"}`}
          />
        </div>
        {fieldErrors.email && (
          <p id={`${emailId}-error`} className="mt-2 text-sm text-burgundy">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor={passwordId} className="sr-only">
          Password
        </label>
        <div className="relative">
          <LockKeyhole aria-hidden="true" size={22} strokeWidth={1.5} className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-ink-2" />
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={fieldErrors.password ? `${passwordId}-error` : undefined}
            className={`${fieldClass} pr-16 ${fieldErrors.password ? "border-burgundy" : "border-black/25"}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            aria-controls={passwordId}
            className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-ink-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-burgundy"
          >
            {showPassword ? <EyeOff size={22} strokeWidth={1.5} aria-hidden="true" /> : <Eye size={22} strokeWidth={1.5} aria-hidden="true" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p id={`${passwordId}-error`} className="mt-2 text-sm text-burgundy">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <p id={errorId} role="alert" className={error ? "rounded-[3px] border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm text-burgundy" : "sr-only"}>
        {error ?? ""}
      </p>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="group mt-3 flex h-[3.75rem] w-full items-center justify-center gap-3 rounded-[3px] bg-[#5a0c14] text-lg font-medium text-white transition-colors duration-300 hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:cursor-wait disabled:opacity-85"
      >
        {pending ? (
          <>
            <LoaderCircle aria-hidden="true" size={20} className="motion-safe:animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Sign In
            <ArrowRight aria-hidden="true" size={22} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}
