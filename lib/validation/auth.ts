/**
 * Admin auth + Settings request schemas (Zod). Client-safe.
 *
 * Route Handlers parse every body with these (authoritative); Settings forms reuse the
 * same rules for instant feedback. Messages are user-facing.
 */

import { z } from "zod";
import { CONTROL_CHARS, emailSchema } from "./common";

/* Passwords --------------------------------------------------------------------------- */

export const PASSWORD_MIN = 8;
/** Upper bound for NEW passwords (bounds Argon2 work). Longer input is rejected, never truncated. */
export const PASSWORD_MAX = 128;
/** Upper bound for passwords being CHECKED (login, current password). */
export const PASSWORD_CHECK_MAX = 256;

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

/** A new password: rules + max length. Never trimmed (spaces are significant). */
export const newPasswordSchema = z
  .string({ error: "Enter a new password." })
  .min(1, "Enter a new password.")
  .max(PASSWORD_MAX, `Use at most ${PASSWORD_MAX} characters.`)
  .superRefine((value, ctx) => {
    const missing = PASSWORD_RULES.filter((r) => !r.test(value));
    if (missing.length) ctx.addIssue({ code: "custom", message: `Add: ${missing.map((r) => r.label.toLowerCase()).join(", ")}.` });
  });

const passwordToCheck = (required: string) => z.string({ error: required }).min(1, required).max(PASSWORD_CHECK_MAX, required);

/* Login ----------------------------------------------------------------------------------- */

/** Unknown keys are ignored (as before). Messages stay generic: the route returns one message. */
export const loginSchema = z.object({
  email: emailSchema(),
  password: passwordToCheck("Enter your password."),
});
export type LoginInput = z.output<typeof loginSchema>;

/* Profile ---------------------------------------------------------------------------------- */

export const NAME_MIN = 2;
export const NAME_MAX = 80;

export const normalizeName = (value: string) => value.replace(/\s+/g, " ").trim();

export const nameSchema = z
  .string({ error: "Enter your full name." })
  .refine((v) => !CONTROL_CHARS.test(v), "The name contains characters that aren't allowed.")
  .transform(normalizeName)
  .pipe(
    z
      .string()
      .min(1, "Enter your full name.")
      .min(NAME_MIN, `Use at least ${NAME_MIN} characters.`)
      .max(NAME_MAX, `Keep the name under ${NAME_MAX} characters.`),
  );

export const updateProfileSchema = z.strictObject({
  name: nameSchema,
  email: emailSchema(),
  /** Required (by the route) only when the email changes. */
  currentPassword: z.string().max(PASSWORD_CHECK_MAX, "Enter your current password.").optional(),
  /** updatedAt the client loaded; the write is rejected (409) if the record changed since. */
  updatedAt: z.iso.datetime({ offset: true, error: "Reload the page and try again." }).transform((v) => new Date(v)),
});
export type UpdateProfileInput = z.output<typeof updateProfileSchema>;

/* Password change ---------------------------------------------------------------------------- */

export const changePasswordSchema = z
  .strictObject({
    currentPassword: passwordToCheck("Enter your current password."),
    newPassword: newPasswordSchema,
    confirmPassword: z.string({ error: "Confirm your new password." }).min(1, "Confirm your new password.").max(PASSWORD_CHECK_MAX, "Passwords do not match."),
  })
  .superRefine((d, ctx) => {
    if (d.confirmPassword !== d.newPassword) ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match." });
    if (d.newPassword === d.currentPassword) ctx.addIssue({ code: "custom", path: ["newPassword"], message: "Choose a password different from your current one." });
  });
export type ChangePasswordInput = z.output<typeof changePasswordSchema>;

/* Login activity query ------------------------------------------------------------------------- */

export const ACTIVITY_DEFAULT_LIMIT = 5;
export const ACTIVITY_MAX_LIMIT = 20;

export const loginActivityQuerySchema = z.strictObject({
  limit: z
    .string()
    .regex(/^\d{1,3}$/, "limit must be a whole number.")
    .transform(Number)
    .pipe(z.number().int().min(1, `limit must be between 1 and ${ACTIVITY_MAX_LIMIT}.`).max(ACTIVITY_MAX_LIMIT, `limit must be between 1 and ${ACTIVITY_MAX_LIMIT}.`))
    .optional()
    .transform((v) => v ?? ACTIVITY_DEFAULT_LIMIT),
});
