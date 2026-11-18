import type { NextRequest } from "next/server";
import { replacePasswordHash, toProfileData } from "@/lib/auth/admin-store";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { assertCurrentPassword } from "@/lib/auth/password-check";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { SESSION_TTL_SECONDS, getAdminSession } from "@/lib/auth/session";
import { createSession, newSessionToken, revokeAllSessions } from "@/lib/auth/sessions";
import { ConflictError, ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { changePasswordSchema } from "@/lib/validation/auth";
import type { PasswordChangeData } from "@/lib/admin/settings-schemas";

/**
 * PATCH /api/admin/settings/password — change the signed-in admin's password.
 *
 * 1. same-origin JSON body (CSRF)          2. session checked against MongoDB
 * 3. body validated (rules, confirmation, max length, new ≠ current)
 * 4. current password verified (rate limited per admin)
 * 5. new password not equal to the stored one
 * 6. Argon2id hash stored only if the old hash is unchanged; passwordChangedAt set;
 *    sessionVersion incremented
 * 7. EVERY existing session of the admin is revoked (including this browser's token)
 * 8. this browser gets a fresh session token with the SAME absolute 8-hour deadline
 *
 * Passwords and hashes are never logged or returned.
 */
export const PATCH = apiHandler(async (request: NextRequest) => {
  const body = await readJsonMutation(request);
  const { admin, session } = await requireAdminApi();

  const parsed = parseWith(changePasswordSchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields);
  const { currentPassword, newPassword } = parsed.data;

  const currentHash = await assertCurrentPassword(admin.id, currentPassword);

  // Catches a "new" password equal to the stored one even if it differs from what was typed as current.
  if (await verifyPassword(currentHash, newPassword)) {
    throw new ValidationError({ newPassword: "Choose a password different from your current one." }, "Choose a password different from your current one.", "PASSWORD_REUSED");
  }

  const updated = await replacePasswordHash(admin.id, currentHash, await hashPassword(newPassword));
  if (!updated) throw new ConflictError("Your password was changed somewhere else. Reload the page and try again.");

  await revokeAllSessions(admin.id, "password_change");

  // New session for this browser; keeps the original sign-in time (absolute lifetime unchanged).
  const cookie = await getAdminSession();
  let currentSessionKept = false;
  try {
    const token = newSessionToken();
    await createSession({ adminId: admin.id, token, loginId: session.loginId, issuedAt: session.issuedAt, ttlSeconds: SESSION_TTL_SECONDS });
    cookie.sid = token;
    cookie.sessionVersion = updated.sessionVersion;
    await cookie.save();
    currentSessionKept = true;
  } catch {
    // Password is changed and every old session revoked; this browser must sign in again.
    console.error("[admin-settings] Password changed, but a new session could not be created; the browser must sign in again.");
    cookie.destroy();
  }

  const data: PasswordChangeData = {
    passwordChangedAt: updated.passwordChangedAt ?? new Date().toISOString(),
    profile: toProfileData(updated),
    otherSessionsSignedOut: true,
    currentSessionKept,
  };
  return apiOk(data);
}, "admin-settings");
