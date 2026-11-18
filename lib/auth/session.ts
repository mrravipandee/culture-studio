import "server-only";

/**
 * Admin session cookie (iron-session). SERVER-ONLY: never import from a client component.
 *
 * The session is sealed (encrypted + authenticated) into an HTTP-only cookie with
 * SESSION_SECRET. Nothing is stored in localStorage or sessionStorage.
 *
 * Contents: adminId, sessionVersion, issuedAt, loginId and sid (random session token whose
 * SHA-256 hash is stored in admin_sessions). The email is NOT stored, so changing it in
 * Settings keeps the session valid.
 *
 * Two levels of checking:
 *  - hasValidSessionShape(): seal + shape + 8-hour expiry, no database. Used by proxy.ts as
 *    a cheap first gate.
 *  - lib/auth/require-admin.ts: also requires the admin to exist with the same
 *    sessionVersion AND the sid's session record to be active (not revoked, not expired).
 *
 * Cookies sealed before server-side sessions existed have no sid: they fail the shape
 * check, so the admin signs in once more after this upgrade.
 */

import { getIronSession, unsealData, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { getSessionSecret } from "./config";

export interface AdminSession {
  adminId?: string;
  sessionVersion?: number;
  /** Epoch milliseconds when the admin signed in. */
  issuedAt?: number;
  /** _id of this sign-in's admin_login_activity record. */
  loginId?: string;
  /** Random session token; MongoDB stores only its SHA-256 hash. */
  sid?: string;
}

export type LiveSession = Required<Pick<AdminSession, "adminId" | "sessionVersion" | "issuedAt" | "sid">> & Pick<AdminSession, "loginId">;

/** 8 hours, absolute (no sliding renewal). */
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

const OBJECT_ID = /^[a-f0-9]{24}$/;
const SID = /^[A-Za-z0-9_-]{43}$/;

/** True when the unsealed data has the current shape and has not expired (no database check). */
export function hasValidSessionShape(data: AdminSession): data is LiveSession {
  if (typeof data.adminId !== "string" || !OBJECT_ID.test(data.adminId)) return false;
  if (typeof data.sid !== "string" || !SID.test(data.sid)) return false;
  if (typeof data.sessionVersion !== "number" || !Number.isInteger(data.sessionVersion) || data.sessionVersion < 1) return false;
  if (typeof data.issuedAt !== "number" || Date.now() - data.issuedAt > SESSION_TTL_SECONDS * 1000 || data.issuedAt > Date.now() + 60_000) return false;
  if (data.loginId !== undefined && (typeof data.loginId !== "string" || !OBJECT_ID.test(data.loginId))) return false;
  return true;
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
    return hasValidSessionShape(data);
  } catch {
    return false;
  }
}
