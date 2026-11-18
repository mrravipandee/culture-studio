import type { NextRequest } from "next/server";
import { apiError, apiOk, readJsonMutation } from "@/lib/auth/api";
import { DatabaseUnavailableError, findPasswordHash, replacePasswordHash, toProfileData } from "@/lib/auth/admin-store";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { passwordCheckRetryAfter, recordPasswordCheckFailure, recordPasswordCheckSuccess } from "@/lib/auth/rate-limit";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { getAdminSession } from "@/lib/auth/session";
import { parseChangePassword, type PasswordChangeData } from "@/lib/admin/settings-schemas";

/**
 * PATCH /api/admin/settings/password — change the signed-in admin's password.
 *
 * 1. same-origin JSON body (CSRF)   2. session checked against MongoDB
 * 3. rate limit per admin           4. body validated (rules, confirmation, max length)
 * 5. current password verified      6. new ≠ current
 * 7. Argon2id hash stored, passwordChangedAt set, sessionVersion incremented
 *    (every other session is revoked)
 * 8. this browser's session is re-sealed with the new version, so it stays signed in.
 *
 * Passwords and hashes are never logged or returned.
 */
export async function PATCH(request: NextRequest) {
  const read = await readJsonMutation(request);
  if (!read.ok) return read.response;
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;
  const { admin } = guard.auth;

  const wait = passwordCheckRetryAfter(admin.id);
  if (wait > 0) {
    return apiError(429, "RATE_LIMITED", "Too many incorrect password attempts. Please wait 15 minutes and try again.", undefined, { "Retry-After": String(wait) });
  }

  const parsed = parseChangePassword(read.body);
  if (!parsed.ok) return apiError(422, "VALIDATION_ERROR", "Please check the highlighted fields.", parsed.fields);
  const { currentPassword, newPassword } = parsed.data;

  try {
    const currentHash = await findPasswordHash(admin.id);
    if (!currentHash) return apiError(404, "ADMIN_NOT_FOUND", "Your admin account could not be found.");

    if (!(await verifyPassword(currentHash, currentPassword))) {
      recordPasswordCheckFailure(admin.id);
      return apiError(422, "INVALID_CURRENT_PASSWORD", "Your current password is incorrect.", { currentPassword: "Current password is incorrect." });
    }
    recordPasswordCheckSuccess(admin.id);

    // Also catches a "new" password that only differs from the stored one in ways the
    // client comparison can't see (it compares against what was typed, not the hash).
    if (await verifyPassword(currentHash, newPassword)) {
      return apiError(422, "PASSWORD_REUSED", "Choose a password different from your current one.", { newPassword: "Choose a password different from your current one." });
    }

    const nextHash = await hashPassword(newPassword);
    const updated = await replacePasswordHash(admin.id, currentHash, nextHash);
    if (!updated) return apiError(409, "CONFLICT", "Your password was changed somewhere else. Reload the page and try again.");

    // Rotate this browser's session to the new version (other sessions are now revoked).
    const session = await getAdminSession();
    session.sessionVersion = updated.sessionVersion;
    await session.save();

    const data: PasswordChangeData = {
      passwordChangedAt: updated.passwordChangedAt ?? new Date().toISOString(),
      profile: toProfileData(updated),
      otherSessionsSignedOut: true,
    };
    return apiOk(data);
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) return apiError(503, "DATABASE_UNAVAILABLE", "The database is unavailable right now. Your password was not changed.");
    console.error("[admin-settings] Unexpected error while changing the password.");
    return apiError(500, "SERVER_ERROR", "Something went wrong. Your password was not changed.");
  }
}
