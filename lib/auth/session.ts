/**
 * Admin session. SERVER-ONLY: never import from a client component.
 *
 * Uses iron-session: the session is sealed (encrypted + authenticated) into an
 * HTTP-only cookie with SESSION_SECRET. Nothing secret reaches the browser in readable
 * form, and nothing is stored in localStorage or sessionStorage.
 *
 * Validity: the seal itself expires after SESSION_TTL_SECONDS, and the stored email must
 * still match ADMIN_EMAIL. Rotating SESSION_SECRET signs every session out at once.
 */

import { getIronSession, unsealData, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { getAdminEmail, getSessionSecret } from "./config";

export interface AdminSession {
  email?: string;
  /** Epoch milliseconds when the admin signed in. */
  issuedAt?: number;
}

/** 8 hours. */
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

const isProduction = process.env.NODE_ENV === "production";

/**
 * __Host- prefix in production: the browser then only accepts the cookie over HTTPS,
 * for this exact host and path "/" (no Domain attribute).
 */
export const SESSION_COOKIE_NAME = isProduction ? "__Host-culture_admin" : "culture_admin";

export function sessionOptions(): SessionOptions {
  return {
    password: getSessionSecret(),
    cookieName: SESSION_COOKIE_NAME,
    ttl: SESSION_TTL_SECONDS,
    cookieOptions: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    },
  };
}

/** True when the unsealed data is a live session for the configured admin. */
export function isValidAdminSession(data: AdminSession): data is Required<AdminSession> {
  if (typeof data.email !== "string" || typeof data.issuedAt !== "number") return false;
  if (Date.now() - data.issuedAt > SESSION_TTL_SECONDS * 1000) return false;
  try {
    return data.email === getAdminEmail();
  } catch {
    return false; // misconfigured: fail closed
  }
}

/** Mutable session bound to the request cookies (Route Handlers and Server Components). */
export async function getAdminSession() {
  return getIronSession<AdminSession>(await cookies(), sessionOptions());
}

/** Read-only check of a raw cookie value (used by proxy.ts). Never throws. */
export async function verifySessionCookie(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  try {
    const data = await unsealData<AdminSession>(value, { password: getSessionSecret(), ttl: SESSION_TTL_SECONDS });
    return isValidAdminSession(data);
  } catch {
    return false;
  }
}
