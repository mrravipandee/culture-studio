import "server-only";

/**
 * Credential check against MongoDB. SERVER-ONLY.
 *
 * Constant-shape work: the Argon2id verification always runs (against a throwaway hash
 * when no admin exists), and the email comparison is constant-time, so response timing
 * doesn't reveal which part was wrong or whether an admin exists.
 */

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { normalizeEmail } from "@/lib/validation/common";
import type { AdminCredentials } from "./admin-store";
import { hashPassword, verifyPassword } from "./password";

const digest = (value: string) => createHash("sha256").update(value).digest();

let dummyHash: Promise<string> | null = null;
const throwawayHash = () => (dummyHash ??= hashPassword(randomBytes(24).toString("base64url")));

export type CredentialCheck =
  | { ok: true }
  /** emailMatched: the admin's email was right but the password wasn't (logged as FAILED). */
  | { ok: false; emailMatched: boolean };

export async function checkCredentials(admin: AdminCredentials | null, email: string, password: string): Promise<CredentialCheck> {
  if (!admin) {
    await verifyPassword(await throwawayHash(), password); // same cost as a real check
    return { ok: false, emailMatched: false };
  }
  const emailMatched = timingSafeEqual(digest(normalizeEmail(email)), digest(admin.email));
  const passwordMatches = await verifyPassword(admin.passwordHash, password);
  return emailMatched && passwordMatches ? { ok: true } : { ok: false, emailMatched };
}
