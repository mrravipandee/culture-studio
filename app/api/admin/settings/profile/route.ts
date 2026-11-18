import type { NextRequest } from "next/server";
import { apiError, apiOk, readJsonMutation } from "@/lib/auth/api";
import { DatabaseUnavailableError, findPasswordHash, toProfileData, updateAdminProfile } from "@/lib/auth/admin-store";
import { verifyPassword } from "@/lib/auth/password";
import { passwordCheckRetryAfter, recordPasswordCheckFailure, recordPasswordCheckSuccess } from "@/lib/auth/rate-limit";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { parseUpdateProfile } from "@/lib/admin/settings-schemas";

/** GET /api/admin/settings/profile — the signed-in admin's profile. */
export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;
  return apiOk(toProfileData(guard.auth.admin));
}

/**
 * PATCH /api/admin/settings/profile — update name and/or email.
 * Changing the email also requires the current password (rate limited per admin).
 * 200 updated · 401 signed out · 403 cross-site · 409 duplicate email / changed elsewhere ·
 * 422 validation · 429 too many wrong passwords · 503 database unavailable.
 */
export async function PATCH(request: NextRequest) {
  const read = await readJsonMutation(request);
  if (!read.ok) return read.response;
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;
  const { admin } = guard.auth;

  const parsed = parseUpdateProfile(read.body);
  if (!parsed.ok) return apiError(422, "VALIDATION_ERROR", "Please check the highlighted fields.", parsed.fields);
  const input = parsed.data;

  // Nothing changed: no write (and the session stays as it is).
  if (input.name === admin.name && input.email === admin.email) return apiOk(toProfileData(admin));

  try {
    if (input.email !== admin.email) {
      const wait = passwordCheckRetryAfter(admin.id);
      if (wait > 0) {
        return apiError(429, "RATE_LIMITED", "Too many incorrect password attempts. Please wait and try again.", undefined, { "Retry-After": String(wait) });
      }
      if (!input.currentPassword) {
        return apiError(422, "PASSWORD_REQUIRED", "Confirm your current password to change your email.", { currentPassword: "Enter your current password to change your email." });
      }
      const hash = await findPasswordHash(admin.id);
      if (!hash) return apiError(404, "ADMIN_NOT_FOUND", "Your admin account could not be found.");
      if (!(await verifyPassword(hash, input.currentPassword))) {
        recordPasswordCheckFailure(admin.id);
        return apiError(422, "INVALID_CURRENT_PASSWORD", "Your current password is incorrect.", { currentPassword: "Current password is incorrect." });
      }
      recordPasswordCheckSuccess(admin.id);
    }

    const result = await updateAdminProfile(admin.id, input.updatedAt, { name: input.name, email: input.email });
    switch (result.kind) {
      case "ok":
        // The session is keyed by adminId (not email), so it stays valid after an email change.
        return apiOk(toProfileData(result.profile));
      case "duplicate":
        return apiError(409, "EMAIL_IN_USE", "That email is already used by another admin account.", { email: "This email is already in use." });
      case "conflict":
        return apiError(409, "CONFLICT", "Your profile was changed somewhere else. Reload to see the latest version, then try again.");
      case "missing":
        return apiError(404, "ADMIN_NOT_FOUND", "Your admin account could not be found.");
    }
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) return apiError(503, "DATABASE_UNAVAILABLE", "The database is unavailable right now. Your changes weren't saved.");
    console.error("[admin-settings] Unexpected error while updating the profile.");
    return apiError(500, "SERVER_ERROR", "Something went wrong. Your changes weren't saved.");
  }
}
