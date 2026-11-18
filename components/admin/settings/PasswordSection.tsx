"use client";

import { useId, useRef, useState } from "react";
import { Check, Circle, KeyRound, LoaderCircle } from "lucide-react";
import { PASSWORD_MAX, checkPasswordRules, passwordStrength, type PasswordChangeData, type ProfileData } from "@/lib/admin/settings-schemas";
import { settingsRequest } from "./settings-api";
import { FormNotice, LocalTime, PasswordField, SettingsCard, primaryButton } from "./SettingsParts";

type Fields = Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>>;
const STRENGTH = ["", "Weak", "Fair", "Good", "Strong"] as const;
const STRENGTH_COLOUR = ["bg-black/10", "bg-[#b3261e]", "bg-[#c08a2d]", "bg-[#4f7f5f]", "bg-[#2f6b47]"];

export default function PasswordSection({
  passwordChangedAt,
  onChanged,
  serifClassName,
}: {
  passwordChangedAt: string | null;
  onChanged: (profile: ProfileData) => void;
  serifClassName: string;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  /** Errors returned by the server; cleared per field as soon as that field is edited. */
  const [serverErrors, setServerErrors] = useState<Fields>({});
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [changedAt, setChangedAt] = useState(passwordChangedAt);
  const [touched, setTouched] = useState(false);
  const lock = useRef(false);
  const rulesId = useId();
  const currentRef = useRef<HTMLInputElement>(null);
  const newRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const rules = checkPasswordRules(next);
  const strength = passwordStrength(next);
  const tooLong = next.length > PASSWORD_MAX;
  const matches = confirm.length > 0 && confirm === next;

  const validate = (): Fields => {
    const f: Fields = {};
    if (!current) f.currentPassword = "Enter your current password.";
    if (!next) f.newPassword = "Enter a new password.";
    else if (tooLong) f.newPassword = `Use at most ${PASSWORD_MAX} characters.`;
    else if (rules.some((r) => !r.met)) f.newPassword = "Meet all the requirements below.";
    else if (next === current) f.newPassword = "Choose a password different from your current one.";
    if (!confirm) f.confirmPassword = "Confirm your new password.";
    else if (confirm !== next) f.confirmPassword = "Passwords do not match.";
    return f;
  };

  const focusFirst = (f: Fields) => {
    const key = (["currentPassword", "newPassword", "confirmPassword"] as const).find((k) => f[k]);
    const ref = key === "currentPassword" ? currentRef : key === "newPassword" ? newRef : key === "confirmPassword" ? confirmRef : null;
    if (ref) requestAnimationFrame(() => ref.current?.focus());
  };

  const submit = async () => {
    if (lock.current) return;
    setTouched(true);
    setNotice(null);
    setServerErrors({});
    const f = validate();
    if (Object.keys(f).length) {
      focusFirst(f);
      return;
    }
    lock.current = true;
    setPending(true);
    const result = await settingsRequest<PasswordChangeData>("/api/admin/settings/password", {
      method: "PATCH",
      body: { currentPassword: current, newPassword: next, confirmPassword: confirm },
    });
    lock.current = false;
    setPending(false);

    if (result.ok) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setServerErrors({});
      setTouched(false);
      setChangedAt(result.data.passwordChangedAt);
      onChanged(result.data.profile);
      setNotice({ tone: "success", text: "Password changed. You're still signed in here; any other signed-in browsers have been signed out." });
      return;
    }
    if (result.status === 401) return;
    const fields = (result.error.fields ?? {}) as Fields;
    if (Object.keys(fields).length) {
      setServerErrors(fields);
      focusFirst(fields);
    }
    setNotice({ tone: "error", text: result.error.message });
  };

  // Client errors are derived live once the user has tried to submit; server errors win.
  const errors: Fields = { ...(touched ? validate() : {}), ...serverErrors };
  const edit = (key: keyof Fields, setter: (v: string) => void) => (v: string) => {
    setter(v);
    setServerErrors((prev) => {
      if (!prev[key]) return prev;
      const rest = { ...prev };
      delete rest[key];
      return rest;
    });
  };

  return (
    <SettingsCard
      id="settings-password"
      title="Password & Security"
      description="Change the password you use to sign in."
      icon={<KeyRound size={19} strokeWidth={1.7} />}
      serifClassName={serifClassName}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,17rem)] lg:gap-10"
      >
        {/* Hidden username helps password managers update the right entry. */}
        <input type="text" name="username" autoComplete="username" hidden readOnly value="" />
        <div className="flex min-w-0 flex-col gap-5">
          <PasswordField label="Current password" value={current} onChange={edit("currentPassword", setCurrent)} error={errors.currentPassword} autoComplete="current-password" disabled={pending} inputRef={currentRef} />
          <PasswordField label="New password" value={next} onChange={edit("newPassword", setNext)} error={errors.newPassword} autoComplete="new-password" describedBy={rulesId} disabled={pending} inputRef={newRef} />
          <div>
            <div className="flex items-center gap-3" aria-hidden="true">
              <div className="grid flex-1 grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={`h-1.5 rounded-full transition-colors duration-300 ${n <= strength ? STRENGTH_COLOUR[strength] : "bg-black/10"}`} />
                ))}
              </div>
              <span className="w-14 text-right text-xs font-medium text-ink-2">{STRENGTH[strength]}</span>
            </div>
            <p className="sr-only" aria-live="polite">
              {next ? `Password strength: ${STRENGTH[strength]}` : ""}
            </p>
          </div>
          <PasswordField label="Confirm new password" value={confirm} onChange={edit("confirmPassword", setConfirm)} error={errors.confirmPassword} autoComplete="new-password" disabled={pending} inputRef={confirmRef} />
          {!errors.confirmPassword && confirm && (
            <p className={`-mt-3 text-xs ${matches ? "text-[#245a3a]" : "text-ink-3"}`}>{matches ? "Passwords match." : "Passwords don’t match yet."}</p>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div id={rulesId} className="rounded-lg border border-black/[0.07] bg-[var(--cream)] p-4">
            <p className="text-sm font-medium text-ink">Your new password needs</p>
            <ul className="mt-3 space-y-2">
              {rules.map((r) => (
                <li key={r.id} className={`flex items-center gap-2 text-sm transition-colors duration-200 ${r.met ? "text-[#245a3a]" : "text-ink-2"}`}>
                  {r.met ? <Check aria-hidden="true" size={15} strokeWidth={2.4} className="shrink-0" /> : <Circle aria-hidden="true" size={13} className="ml-px mr-px shrink-0 text-ink-3" />}
                  {r.label}
                  <span className="sr-only">{r.met ? "(met)" : "(not met)"}</span>
                </li>
              ))}
            </ul>
            {tooLong && <p className="mt-3 text-xs text-[#a3242f]">Use at most {PASSWORD_MAX} characters.</p>}
          </div>
          <p className="text-xs leading-relaxed text-ink-3">
            Last changed: <LocalTime iso={changedAt} fallback="not changed since the account was created" />. Changing your password signs out every other browser.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <FormNotice notice={notice} />
          <div className="flex sm:justify-end">
            <button type="submit" disabled={pending} className={`${primaryButton} w-full sm:w-auto`}>
              {pending && <LoaderCircle aria-hidden="true" size={16} className="animate-spin motion-reduce:animate-none" />}
              {pending ? "Changing password…" : "Change Password"}
            </button>
          </div>
        </div>
      </form>
    </SettingsCard>
  );
}
