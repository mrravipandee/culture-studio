import type { NextRequest } from "next/server";
import { toProfileData, updateAdminProfile } from "@/lib/auth/admin-store";
import { assertCurrentPassword } from "@/lib/auth/password-check";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { updateProfileSchema } from "@/lib/validation/auth";

/** GET /api/admin/settings/profile — the signed-in admin's profile. */
export const GET = apiHandler(async () => {
  const { admin } = await requireAdminApi();
  return apiOk(toProfileData(admin));
}, "admin-settings");

/**
 * PATCH /api/admin/settings/profile — update name and/or email.
 * Changing the email also requires the current password (rate limited per admin).
 * 200 updated · 401 signed out · 403 cross-site · 404 admin missing · 409 duplicate email /
 * changed elsewhere · 422 validation · 429 too many wrong passwords · 503 database unavailable.
 */
export const PATCH = apiHandler(async (request: NextRequest) => {
  const body = await readJsonMutation(request);
  const { admin } = await requireAdminApi();

  const parsed = parseWith(updateProfileSchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields);
  const input = parsed.data;

  // Nothing changed: no write (and the session stays as it is).
  if (input.name === admin.name && input.email === admin.email) return apiOk(toProfileData(admin));

  if (input.email !== admin.email) {
    if (!input.currentPassword) {
      throw new ValidationError({ currentPassword: "Enter your current password to change your email." }, "Confirm your current password to change your email.", "PASSWORD_REQUIRED");
    }
    await assertCurrentPassword(admin.id, input.currentPassword);
  }

  // The session is keyed by adminId + session token (not email), so it stays valid after an email change.
  const profile = await updateAdminProfile(admin.id, input.updatedAt, { name: input.name, email: input.email });
  return apiOk(toProfileData(profile));
}, "admin-settings");
