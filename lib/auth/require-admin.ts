import "server-only";

/**
 * Server-side guards. SERVER-ONLY.
 *
 * proxy.ts already redirects or rejects requests without a well-formed session; these
 * guards re-check every protected page and API handler against MongoDB:
 *  - the session record for the cookie's token is active (not revoked by logout or a
 *    password change, not expired), and
 *  - the admin still exists with the same sessionVersion (defence in depth).
 */

import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AuthConfigError } from "./config";
import { findAdminProfile, type AdminProfile } from "./admin-store";
import { getAdminSession, hasValidSessionShape, type LiveSession } from "./session";
import { isSessionActive } from "./sessions";
import { UnauthorizedError } from "@/lib/server/errors";

export interface AuthenticatedAdmin {
  admin: AdminProfile;
  session: LiveSession;
}

/** Signed-out users with a stale cookie go here: it clears the cookie, then shows the login page. */
export const SESSION_ENDED_PATH = "/api/admin/session/ended";

/**
 * Resolves the signed-in admin, or null when signed out / revoked / expired.
 * Throws DatabaseUnavailableError when MongoDB can't be reached (callers decide how to fail).
 * Cached per request, so a page and its children share one lookup.
 */
export const getAuthenticatedAdmin = cache(async (): Promise<AuthenticatedAdmin | null> => {
  let data;
  try {
    data = await getAdminSession();
  } catch (error) {
    if (error instanceof AuthConfigError) console.error(`[admin-auth] ${error.message}`);
    return null; // misconfigured or unreadable: fail closed
  }
  if (!hasValidSessionShape(data)) return null;
  const [admin, active] = await Promise.all([findAdminProfile(data.adminId), isSessionActive(data.adminId, data.sid)]);
  if (!admin || !active || admin.sessionVersion !== data.sessionVersion) return null;
  return {
    admin,
    session: { adminId: data.adminId, sessionVersion: data.sessionVersion, issuedAt: data.issuedAt, sid: data.sid, loginId: data.loginId },
  };
});

/** For protected Server Components: returns the admin or redirects to login. */
export async function requireAdmin(): Promise<{ email: string; name: string; adminId: string }> {
  // Session checks read the clock (seal expiry, issuedAt). With cacheComponents that must
  // happen at request time, never during prerendering: connection() marks this point.
  await connection();
  const auth = await getAuthenticatedAdmin(); // DatabaseUnavailableError → nearest error boundary
  if (!auth) redirect(SESSION_ENDED_PATH);
  return { email: auth.admin.email, name: auth.admin.name, adminId: auth.admin.id };
}

/** For protected Route Handlers: the signed-in admin, or throws UnauthorizedError (401). */
export async function requireAdminApi(): Promise<AuthenticatedAdmin> {
  await connection();
  const auth = await getAuthenticatedAdmin();
  if (!auth) throw new UnauthorizedError();
  return auth;
}
