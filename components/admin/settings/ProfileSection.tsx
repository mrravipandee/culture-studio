"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle, Mail, PencilLine, RotateCcw, ShieldCheck, UserRound, X } from "lucide-react";
import { normalizeEmail, normalizeName, validateEmail, validateName, type ProfileData } from "@/lib/admin/settings-schemas";
import { useUpdateAdminProfile } from "../AdminProfileContext";
import { settingsRequest } from "./settings-api";
import { FieldError, FormNotice, LocalTime, PasswordField, SettingsCard, inputClass, primaryButton, secondaryButton } from "./SettingsParts";

const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

type Fields = Partial<Record<"name" | "email" | "currentPassword", string>>;
type Notice = { tone: "success" | "error"; text: string; action?: React.ReactNode } | null;

const initials = (name: string, email: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const value = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? email).slice(0, 2);
  return value.toUpperCase();
};

export default function ProfileSection({
  profile,
  onProfile,
  serifClassName,
}: {
  /** Owned by the workspace so the password section's updates (updatedAt) reach this form. */
  profile: ProfileData;
  onProfile: (profile: ProfileData) => void;
  serifClassName: string;
}) {
  const router = useRouter();
  const updateAdminProfile = useUpdateAdminProfile();
  const setProfile = (next: ProfileData) => {
    onProfile(next);
    updateAdminProfile({ name: next.name, email: next.email }); // header updates instantly
  };
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: profile.name, email: profile.email });
  const [errors, setErrors] = useState<Fields>({});
  const [notice, setNotice] = useState<Notice>(null);
  const [pending, setPending] = useState(false);
  const lock = useRef(false);

  // Avatar: local preview only (no image storage is configured; nothing is uploaded or saved).
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  // Email change confirmation
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (confirming && !d.open) {
      d.showModal();
      requestAnimationFrame(() => passwordRef.current?.focus());
    }
    if (!confirming && d.open) d.close();
  }, [confirming]);

  const startEditing = () => {
    setDraft({ name: profile.name, email: profile.email });
    setErrors({});
    setNotice(null);
    setEditing(true);
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const clearPreview = () => {
    setPreview(null);
    setAvatarError(undefined);
    if (fileRef.current) fileRef.current.value = "";
  };

  const cancel = () => {
    setDraft({ name: profile.name, email: profile.email });
    setErrors({});
    setNotice(null);
    clearPreview();
    setEditing(false);
  };

  const pickAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatarError(undefined);
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Use a PNG, JPG or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError("Use an image under 2 MB.");
      event.target.value = "";
      return;
    }
    try {
      const bitmap = await createImageBitmap(file); // rejects files that aren't real images
      bitmap.close();
    } catch {
      setAvatarError("That file couldn't be read as an image.");
      event.target.value = "";
      return;
    }
    setPreview(URL.createObjectURL(file));
  };

  const reload = async () => {
    const result = await settingsRequest<ProfileData>("/api/admin/settings/profile");
    if (result.ok) {
      setProfile(result.data);
      setDraft({ name: result.data.name, email: result.data.email });
      setErrors({});
      setNotice({ tone: "success", text: "Loaded the latest profile. Make your changes again." });
    } else {
      setNotice({ tone: "error", text: result.error.message });
    }
  };

  const submit = async (currentPassword?: string) => {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setNotice(null);
    const result = await settingsRequest<ProfileData>("/api/admin/settings/profile", {
      method: "PATCH",
      body: { name: draft.name, email: draft.email, updatedAt: profile.updatedAt, ...(currentPassword ? { currentPassword } : {}) },
    });
    lock.current = false;
    setPending(false);

    if (result.ok) {
      const emailChanged = result.data.email !== profile.email;
      setProfile(result.data);
      setDraft({ name: result.data.name, email: result.data.email });
      setErrors({});
      setConfirming(false);
      setPassword("");
      setEditing(false);
      clearPreview();
      setNotice({ tone: "success", text: emailChanged ? "Profile updated. Use your new email the next time you sign in." : "Profile updated." });
      router.refresh(); // header + menu show the new details
      return;
    }

    const { error, status } = result;
    if (status === 401) return;
    const fields = (error.fields ?? {}) as Fields;
    if (fields.currentPassword || status === 429) {
      // Stay in the confirmation dialog; keep everything typed.
      setErrors({ currentPassword: fields.currentPassword ?? error.message });
      requestAnimationFrame(() => passwordRef.current?.focus());
      return;
    }
    setConfirming(false);
    setPassword("");
    if (fields.name || fields.email) {
      setErrors({ name: fields.name, email: fields.email });
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`#${CSS.escape(fields.name ? `${id}-name` : `${id}-email`)}`)?.focus());
    }
    setNotice({
      tone: "error",
      text: error.message,
      action:
        error.code === "CONFLICT" ? (
          <button type="button" onClick={reload} className="inline-flex items-center gap-1 font-medium underline underline-offset-2">
            <RotateCcw aria-hidden="true" size={14} /> Reload profile
          </button>
        ) : undefined,
    });
  };

  const save = () => {
    const next: Fields = { name: validateName(draft.name), email: validateEmail(draft.email) };
    setErrors(next);
    if (next.name || next.email) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`#${CSS.escape(next.name ? `${id}-name` : `${id}-email`)}`)?.focus());
      return;
    }
    const unchanged = normalizeName(draft.name) === profile.name && normalizeEmail(draft.email) === profile.email;
    if (unchanged) {
      setEditing(false);
      clearPreview();
      setNotice({ tone: "success", text: preview ? "No profile changes to save. Photo upload isn't connected yet, so the photo wasn't saved." : "No changes to save." });
      return;
    }
    if (normalizeEmail(draft.email) !== profile.email) {
      setErrors({});
      setPassword("");
      setConfirming(true);
      return;
    }
    void submit();
  };

  const avatar = preview ? (
    // eslint-disable-next-line @next/next/no-img-element -- local blob preview, never optimised or uploaded
    <img src={preview} alt="Selected photo preview" className="size-20 shrink-0 rounded-full object-cover ring-1 ring-black/10 sm:size-24" />
  ) : (
    <span aria-hidden="true" className={`${serifClassName} grid size-20 shrink-0 place-items-center rounded-full bg-[#4a121a] text-[1.75rem] text-[#F8F5F0] sm:size-24 sm:text-[2rem]`}>
      {initials(profile.name, profile.email)}
    </span>
  );

  return (
    <SettingsCard
      id="settings-profile"
      title="Profile"
      description="Your name and the email you sign in with."
      icon={<UserRound size={19} strokeWidth={1.7} />}
      serifClassName={serifClassName}
      actions={
        !editing && (
          <button type="button" onClick={startEditing} className={`${secondaryButton} w-full sm:w-auto`}>
            <PencilLine aria-hidden="true" size={16} /> Edit Profile
          </button>
        )
      }
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className="flex items-center gap-4 lg:w-56 lg:shrink-0 lg:flex-col lg:items-start">
          {avatar}
          <div className="min-w-0">
            {editing ? (
              <>
                <input ref={fileRef} id={`${id}-avatar`} type="file" accept={AVATAR_TYPES.join(",")} onChange={pickAvatar} className="sr-only" aria-describedby={`${id}-avatar-note`} />
                <div className="flex flex-wrap gap-2">
                  <label htmlFor={`${id}-avatar`} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-black/15 bg-white px-3 text-[0.8125rem] font-medium text-ink hover:border-black/30 has-[:focus-visible]:outline-2">
                    <ImagePlus aria-hidden="true" size={15} /> Choose photo
                  </label>
                  {preview && (
                    <button type="button" onClick={clearPreview} className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-[0.8125rem] text-ink-2 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-burgundy">
                      <X aria-hidden="true" size={14} /> Remove
                    </button>
                  )}
                </div>
                <p id={`${id}-avatar-note`} className="mt-2 max-w-[15rem] text-xs leading-relaxed text-ink-3">
                  Optional. PNG, JPG or WebP, up to 2 MB. Photo upload isn&rsquo;t connected yet, so the preview isn&rsquo;t saved.
                </p>
                <FieldError id={`${id}-avatar-error`} message={avatarError} />
              </>
            ) : (
              <>
                <p className="truncate text-base font-semibold text-[#1a0a0c]">{profile.name}</p>
                <p className="break-all text-sm text-ink-2">{profile.email}</p>
                <p className="mt-1 text-xs text-ink-3">Administrator</p>
              </>
            )}
          </div>
        </div>

        <form
          noValidate
          className="min-w-0 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor={`${id}-name`} className="block text-sm font-medium text-ink">
                Full name
              </label>
              <input
                ref={nameRef}
                id={`${id}-name`}
                value={editing ? draft.name : profile.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                readOnly={!editing}
                disabled={pending}
                autoComplete="name"
                maxLength={120}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? `${id}-name-error` : undefined}
                className={`${inputClass(Boolean(errors.name))} ${editing ? "" : "border-transparent bg-black/[0.025] hover:border-transparent"}`}
              />
              <FieldError id={`${id}-name-error`} message={errors.name} />
            </div>
            <div>
              <label htmlFor={`${id}-email`} className="block text-sm font-medium text-ink">
                Email address
              </label>
              <input
                id={`${id}-email`}
                type="email"
                inputMode="email"
                value={editing ? draft.email : profile.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                readOnly={!editing}
                disabled={pending}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={260}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={[errors.email ? `${id}-email-error` : "", editing ? `${id}-email-hint` : ""].filter(Boolean).join(" ") || undefined}
                className={`${inputClass(Boolean(errors.email))} ${editing ? "" : "border-transparent bg-black/[0.025] hover:border-transparent"}`}
              />
              <FieldError id={`${id}-email-error`} message={errors.email} />
              {editing && (
                <p id={`${id}-email-hint`} className="mt-1.5 text-xs text-ink-3">
                  You sign in with this email. Changing it asks for your password.
                </p>
              )}
            </div>
          </div>

          <dl className="mt-6 grid gap-3 border-t border-black/[0.06] pt-5 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2.5 text-ink-2">
              <ShieldCheck aria-hidden="true" size={16} className="shrink-0" />
              <dt>Password changed</dt>
              <dd className="ml-auto text-right text-ink sm:ml-0">
                <LocalTime iso={profile.passwordChangedAt} fallback="Not changed yet" />
              </dd>
            </div>
            <div className="flex items-center gap-2.5 text-ink-2">
              <Mail aria-hidden="true" size={16} className="shrink-0" />
              <dt>Profile updated</dt>
              <dd className="ml-auto text-right text-ink sm:ml-0">
                <LocalTime iso={profile.updatedAt} />
              </dd>
            </div>
          </dl>

          <div className="mt-5 empty:hidden">
            <FormNotice notice={notice} />
          </div>

          {editing && (
            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button type="button" onClick={cancel} disabled={pending} className={secondaryButton}>
                Cancel
              </button>
              <button type="submit" disabled={pending} className={primaryButton}>
                {pending && !confirming ? <LoaderCircle aria-hidden="true" size={16} className="animate-spin motion-reduce:animate-none" /> : null}
                {pending && !confirming ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>

      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          if (!pending) setConfirming(false);
        }}
        aria-labelledby={`${id}-confirm-title`}
        aria-describedby={`${id}-confirm-desc`}
        className="admin-dialog m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-black/10 bg-white p-0 text-ink shadow-[0_24px_60px_-20px_rgba(36,12,14,0.45)] backdrop:bg-black/40"
      >
        {confirming && (
          <form
            noValidate
            className="p-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!password) {
                setErrors({ currentPassword: "Enter your current password." });
                return;
              }
              void submit(password);
            }}
          >
            <h2 id={`${id}-confirm-title`} className={`${serifClassName} text-2xl font-medium text-[#1a0a0c]`}>
              Confirm email change
            </h2>
            <p id={`${id}-confirm-desc`} className="mt-2 text-sm leading-relaxed text-ink-2">
              You&rsquo;ll sign in with <strong className="break-all font-medium text-ink">{normalizeEmail(draft.email)}</strong> from now on. Enter your current password to confirm.
            </p>
            <div className="mt-5">
              <PasswordField label="Current password" value={password} onChange={setPassword} error={errors.currentPassword} autoComplete="current-password" disabled={pending} inputRef={passwordRef} />
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirming(false)} disabled={pending} className={secondaryButton}>
                Cancel
              </button>
              <button type="submit" disabled={pending} className={primaryButton}>
                {pending && <LoaderCircle aria-hidden="true" size={16} className="animate-spin motion-reduce:animate-none" />}
                {pending ? "Saving…" : "Confirm & Save"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </SettingsCard>
  );
}
