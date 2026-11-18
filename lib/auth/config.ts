import "server-only";

/**
 * Admin auth configuration. SERVER-ONLY: never import from a client component.
 *
 * Server-side environment variables:
 *   SESSION_SECRET  at least 32 random characters (seals the session cookie). Required.
 *
 * ADMIN_EMAIL / ADMIN_PASSWORD_HASH are no longer read by the running app. They are used
 * only by the manual bootstrap script (scripts/admin-account.mjs) to create the FIRST admin
 * record, and only with an explicit --confirm. MongoDB is the source of truth for the
 * admin's email and password. Error messages name the variable only, never its value.
 */

export { normalizeEmail } from "@/lib/validation/common";

export class AuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigError";
  }
}

const MIN_SECRET_LENGTH = 32;

/** Session secret (used by the session layer and proxy.ts). */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET ?? "";
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new AuthConfigError(`SESSION_SECRET is missing or shorter than ${MIN_SECRET_LENGTH} characters.`);
  }
  return secret;
}
