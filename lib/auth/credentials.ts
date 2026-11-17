/**
 * Credential check. SERVER-ONLY.
 *
 * The Argon2id verification always runs, even when the email does not match, so the
 * response time does not reveal which of the two was wrong.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { verify } from "@node-rs/argon2";
import { getAuthConfig, normalizeEmail } from "./config";

const digest = (value: string) => createHash("sha256").update(value).digest();

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const config = getAuthConfig(); // throws AuthConfigError when misconfigured (fail closed)
  const emailMatches = timingSafeEqual(digest(normalizeEmail(email)), digest(config.email));

  let passwordMatches = false;
  try {
    passwordMatches = await verify(config.passwordHash, password);
  } catch {
    passwordMatches = false;
  }
  return emailMatches && passwordMatches;
}
