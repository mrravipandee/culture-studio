/**
 * Admin auth configuration. SERVER-ONLY: never import from a client component.
 *
 * Server-side environment variables:
 *   SESSION_SECRET       at least 32 random characters (seals the session cookie). Required.
 *   ADMIN_EMAIL          BOOTSTRAP ONLY: email for the first admin record in MongoDB.
 *   ADMIN_PASSWORD_HASH  BOOTSTRAP ONLY: Argon2id hash (generate with `npm run admin:hash`).
 *
 * ADMIN_EMAIL / ADMIN_PASSWORD_HASH are read only when the `admins` collection has no admin
 * yet (lib/auth/admin-store.ts). After that MongoDB is the source of truth: changing the
 * password in Settings updates MongoDB, and these variables are ignored (editing them does
 * NOT reset the password). Error messages name the variable only, never its value.
 */

import { ARGON2ID_PATTERN } from "./password";

export class AuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigError";
  }
}

const MIN_SECRET_LENGTH = 32;

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

/** Session secret (used by the session layer and proxy.ts). */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET ?? "";
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new AuthConfigError(`SESSION_SECRET is missing or shorter than ${MIN_SECRET_LENGTH} characters.`);
  }
  return secret;
}

/** Initial admin credentials from the environment. Only called when no admin exists in MongoDB. */
export function getBootstrapCredentials(): { email: string; passwordHash: string } {
  const email = normalizeEmail(process.env.ADMIN_EMAIL ?? "");
  if (!email || !email.includes("@")) throw new AuthConfigError("ADMIN_EMAIL is missing or invalid (needed to create the first admin).");

  const passwordHash = (process.env.ADMIN_PASSWORD_HASH ?? "").trim();
  if (!passwordHash) throw new AuthConfigError("ADMIN_PASSWORD_HASH is missing (needed to create the first admin).");
  if (!passwordHash.includes("$")) {
    throw new AuthConfigError(
      "ADMIN_PASSWORD_HASH contains a plain value, not an Argon2id hash. Run `npm run admin:hash -- --write`, then restart.",
    );
  }
  if (!ARGON2ID_PATTERN.test(passwordHash)) {
    throw new AuthConfigError("ADMIN_PASSWORD_HASH is not a complete Argon2id hash. In .env files, escape every $ as \\$ (see .env.example).");
  }
  return { email, passwordHash };
}
