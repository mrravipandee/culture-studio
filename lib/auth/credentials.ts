/**
 * Credential check against MongoDB. SERVER-ONLY.
 *
 * The admin record (and its Argon2id hash) lives in the `admins` collection; it is created
 * once from ADMIN_EMAIL / ADMIN_PASSWORD_HASH if missing (see admin-store.ts).
 *
 * The Argon2id verification always runs, even when the email does not match, so the
 * response time does not reveal which of the two was wrong.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { normalizeEmail } from "./config";
import { getAdminCredentials } from "./admin-store";
import { verifyPassword } from "./password";

const digest = (value: string) => createHash("sha256").update(value).digest();

export type CredentialResult =
  | { ok: true; adminId: string; sessionVersion: number }
  /** emailMatched: the admin's email was right but the password wasn't (logged as FAILED). */
  | { ok: false; adminId: string; emailMatched: boolean };

/** Throws AuthConfigError (bootstrap env invalid) or DatabaseUnavailableError. */
export async function verifyAdminCredentials(email: string, password: string): Promise<CredentialResult> {
  const admin = await getAdminCredentials();
  const emailMatched = timingSafeEqual(digest(normalizeEmail(email)), digest(admin.email));
  const passwordMatches = await verifyPassword(admin.passwordHash, password);
  const adminId = admin._id.toString();
  if (emailMatched && passwordMatches) return { ok: true, adminId, sessionVersion: admin.sessionVersion };
  return { ok: false, adminId, emailMatched };
}
