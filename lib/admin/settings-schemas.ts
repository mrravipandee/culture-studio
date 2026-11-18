/**
 * Settings request schemas, password rules and API types.
 *
 * Pure and client-safe: the same functions validate on the server (authoritative) and give
 * instant feedback in the browser. Hand-written parsers keep this dependency-free (Zod is
 * not installed in this project); each returns field-level messages for the UI.
 */

/* API envelope ------------------------------------------------------------------------ */

export interface ApiErrorBody {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: ApiErrorBody };

/** Loose runtime check for responses read in the browser. */
export function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (typeof value !== "object" || value === null || !("success" in value)) return false;
  const v = value as { success: unknown; error?: unknown };
  if (v.success === true) return "data" in v;
  return v.success === false && typeof v.error === "object" && v.error !== null && typeof (v.error as { message?: unknown }).message === "string";
}

/* Data shapes ----------------------------------------------------------------------------- */

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginActivityItem {
  id: string;
  status: "SUCCESS" | "FAILED";
  loggedInAt: string;
  device: string;
  browser: string;
  os: string;
  location: string | null;
  isCurrent: boolean;
}

export interface LoginActivityData {
  current: LoginActivityItem | null;
  lastLogin: LoginActivityItem | null;
  recent: LoginActivityItem[];
  failedLast30Days: number;
}

export interface PasswordChangeData {
  passwordChangedAt: string;
  profile: ProfileData;
  otherSessionsSignedOut: true;
}

/* Helpers ---------------------------------------------------------------------------------- */

type Parsed<T> = { ok: true; data: T } | { ok: false; fields: Record<string, string> };

export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export const normalizeName = (value: string) => value.replace(/\s+/g, " ").trim();

export const EMAIL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/* Profile ----------------------------------------------------------------------------------- */

export const NAME_MIN = 2;
export const NAME_MAX = 80;
export const EMAIL_MAX = 254;

export function validateName(raw: string): string | undefined {
  const name = normalizeName(raw);
  if (!name) return "Enter your full name.";
  if (name.length < NAME_MIN) return `Use at least ${NAME_MIN} characters.`;
  if (name.length > NAME_MAX) return `Keep the name under ${NAME_MAX} characters.`;
  if (CONTROL_CHARS.test(raw)) return "The name contains characters that aren't allowed.";
  return undefined;
}

export function validateEmail(raw: string): string | undefined {
  const email = normalizeEmail(raw);
  if (!email) return "Enter your email address.";
  if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email) || email.includes("..")) return "Enter a valid email address, e.g. name@studioculture.in.";
  return undefined;
}

export interface UpdateProfileInput {
  name: string;
  email: string;
  /** Required only when the email changes. */
  currentPassword?: string;
  /** updatedAt the client loaded; the write is rejected (409) if the record changed since. */
  updatedAt: Date;
}

export function parseUpdateProfile(body: unknown): Parsed<UpdateProfileInput> {
  if (!isRecord(body)) return { ok: false, fields: { form: "The request could not be read." } };
  const fields: Record<string, string> = {};
  const { name, email, currentPassword, updatedAt } = body;

  if (typeof name !== "string") fields.name = "Enter your full name.";
  else {
    const e = validateName(name);
    if (e) fields.name = e;
  }
  if (typeof email !== "string") fields.email = "Enter your email address.";
  else {
    const e = validateEmail(email);
    if (e) fields.email = e;
  }
  if (currentPassword !== undefined && (typeof currentPassword !== "string" || currentPassword.length > PASSWORD_MAX)) {
    fields.currentPassword = "Enter your current password.";
  }
  const stamp = typeof updatedAt === "string" ? new Date(updatedAt) : null;
  if (!stamp || Number.isNaN(stamp.getTime())) fields.form = "Reload the page and try again.";

  const extra = Object.keys(body).filter((k) => !["name", "email", "currentPassword", "updatedAt"].includes(k));
  if (extra.length) fields.form = "The request contains fields that can't be changed.";

  if (Object.keys(fields).length || !stamp) return { ok: false, fields };
  return {
    ok: true,
    data: {
      name: normalizeName(name as string),
      email: normalizeEmail(email as string),
      ...(typeof currentPassword === "string" && currentPassword ? { currentPassword } : {}),
      updatedAt: stamp,
    },
  };
}

/* Password ---------------------------------------------------------------------------------- */

export const PASSWORD_MIN = 8;
/** Upper bound (bounds Argon2 work). Longer input is rejected, never truncated. */
export const PASSWORD_MAX = 128;

export const PASSWORD_RULES = [
  { id: "length", label: `At least ${PASSWORD_MIN} characters`, test: (p: string) => p.length >= PASSWORD_MIN },
  { id: "upper", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
] as const;

export const checkPasswordRules = (password: string) => PASSWORD_RULES.map((r) => ({ id: r.id, label: r.label, met: r.test(password) }));

/** 0–4 for the strength meter: rules met, with a bonus for length ≥ 12 or a symbol. */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  const met = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (met < PASSWORD_RULES.length) return Math.max(1, met - 1) as 1 | 2 | 3;
  return password.length >= 12 || /[^A-Za-z0-9]/.test(password) ? 4 : 3;
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return "Enter a new password.";
  if (password.length > PASSWORD_MAX) return `Use at most ${PASSWORD_MAX} characters.`;
  const missing = PASSWORD_RULES.filter((r) => !r.test(password));
  if (missing.length) return `Add: ${missing.map((r) => r.label.toLowerCase()).join(", ")}.`;
  return undefined;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function parseChangePassword(body: unknown): Parsed<ChangePasswordInput> {
  if (!isRecord(body)) return { ok: false, fields: { form: "The request could not be read." } };
  const fields: Record<string, string> = {};
  const { currentPassword, newPassword, confirmPassword } = body;

  if (typeof currentPassword !== "string" || !currentPassword) fields.currentPassword = "Enter your current password.";
  else if (currentPassword.length > PASSWORD_MAX) fields.currentPassword = "Current password is incorrect.";

  if (typeof newPassword !== "string") fields.newPassword = "Enter a new password.";
  else {
    const e = validateNewPassword(newPassword);
    if (e) fields.newPassword = e;
  }
  if (typeof confirmPassword !== "string" || !confirmPassword) fields.confirmPassword = "Confirm your new password.";
  else if (typeof newPassword === "string" && confirmPassword !== newPassword) fields.confirmPassword = "Passwords do not match.";

  if (!fields.newPassword && !fields.currentPassword && newPassword === currentPassword) {
    fields.newPassword = "Choose a password different from your current one.";
  }
  const extra = Object.keys(body).filter((k) => !["currentPassword", "newPassword", "confirmPassword"].includes(k));
  if (extra.length) fields.form = "The request contains unexpected fields.";

  if (Object.keys(fields).length) return { ok: false, fields };
  return { ok: true, data: { currentPassword: currentPassword as string, newPassword: newPassword as string, confirmPassword: confirmPassword as string } };
}

/* Login activity query ---------------------------------------------------------------------- */

export const ACTIVITY_DEFAULT_LIMIT = 5;
export const ACTIVITY_MAX_LIMIT = 20;

export function parseActivityQuery(params: URLSearchParams): Parsed<{ limit: number }> {
  const extra = [...params.keys()].filter((k) => k !== "limit");
  if (extra.length) return { ok: false, fields: { form: `Unknown parameter: ${extra[0].slice(0, 30)}` } };
  const raw = params.get("limit");
  if (raw === null) return { ok: true, data: { limit: ACTIVITY_DEFAULT_LIMIT } };
  if (!/^\d{1,3}$/.test(raw)) return { ok: false, fields: { limit: "limit must be a whole number." } };
  const limit = Number(raw);
  if (limit < 1 || limit > ACTIVITY_MAX_LIMIT) return { ok: false, fields: { limit: `limit must be between 1 and ${ACTIVITY_MAX_LIMIT}.` } };
  return { ok: true, data: { limit } };
}
