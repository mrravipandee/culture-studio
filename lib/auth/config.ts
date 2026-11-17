/**
 * Admin auth configuration. SERVER-ONLY: never import from a client component.
 *
 * Reads the single admin's credentials from server-side environment variables:
 *   ADMIN_EMAIL          the admin's email address
 *   ADMIN_PASSWORD_HASH  an Argon2id hash (generate with `npm run admin:hash`)
 *   SESSION_SECRET       at least 32 random characters (seals the session cookie)
 *
 * Missing or malformed values throw AuthConfigError, so login fails closed. Error
 * messages name the variable only, never its value.
 */

export class AuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigError";
  }
}

export interface AuthConfig {
  email: string;
  passwordHash: string;
  sessionSecret: string;
}

const MIN_SECRET_LENGTH = 32;
/** $argon2id$v=19$m=…,t=…,p=…$<salt>$<hash> */
const ARGON2ID_PATTERN = /^\$argon2id\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/;

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

/** Session secret alone (used by proxy.ts, which never needs the password hash). */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET ?? "";
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new AuthConfigError(`SESSION_SECRET is missing or shorter than ${MIN_SECRET_LENGTH} characters.`);
  }
  return secret;
}

export function getAdminEmail(): string {
  const email = normalizeEmail(process.env.ADMIN_EMAIL ?? "");
  if (!email || !email.includes("@")) throw new AuthConfigError("ADMIN_EMAIL is missing or invalid.");
  return email;
}

export function getAuthConfig(): AuthConfig {
  const passwordHash = (process.env.ADMIN_PASSWORD_HASH ?? "").trim();
  if (!passwordHash) throw new AuthConfigError("ADMIN_PASSWORD_HASH is missing.");
  if (!passwordHash.includes("$")) {
    throw new AuthConfigError(
      "ADMIN_PASSWORD_HASH contains a plain value, not an Argon2id hash. Run `npm run admin:hash -- --write`, then restart.",
    );
  }
  if (!ARGON2ID_PATTERN.test(passwordHash)) {
    throw new AuthConfigError(
      "ADMIN_PASSWORD_HASH is not a complete Argon2id hash. In .env files, escape every $ as \\$ (see .env.example).",
    );
  }
  return { email: getAdminEmail(), passwordHash, sessionSecret: getSessionSecret() };
}
