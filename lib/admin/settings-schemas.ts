/**
 * Settings data shapes and form helpers. Client-safe.
 *
 * Validation rules live in lib/validation/* (Zod) and are shared by the Route Handlers
 * (authoritative) and the Settings forms (instant feedback). This module only adapts them
 * for the UI and defines the data the Settings API returns.
 */

import { emailSchema, normalizeEmail } from "@/lib/validation/common";
import { nameSchema, newPasswordSchema, normalizeName } from "@/lib/validation/auth";

export type { ApiErrorBody, ApiResponse } from "@/lib/api/response";
export { isApiResponse } from "@/lib/api/response";
export { normalizeEmail, normalizeName };
export { PASSWORD_MAX, PASSWORD_MIN, PASSWORD_RULES, checkPasswordRules, passwordStrength, ACTIVITY_DEFAULT_LIMIT, ACTIVITY_MAX_LIMIT } from "@/lib/validation/auth";

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
  /** Every session that existed before the change was revoked. */
  otherSessionsSignedOut: true;
  /** This browser got a fresh session. False only if that could not be created (the user must sign in again). */
  currentSessionKept: boolean;
}

/* Form helpers (first message or undefined) ------------------------------------------------ */

const firstMessage = (result: { success: boolean; error?: { issues: { message: string }[] } }) => (result.success ? undefined : result.error?.issues[0]?.message);

export const validateName = (raw: string) => firstMessage(nameSchema.safeParse(raw));
export const validateEmail = (raw: string) => firstMessage(emailSchema().safeParse(raw));
export const validateNewPassword = (password: string) => firstMessage(newPasswordSchema.safeParse(password));
