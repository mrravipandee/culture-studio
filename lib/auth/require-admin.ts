/**
 * Server-side guards. SERVER-ONLY.
 *
 * proxy.ts already redirects or rejects requests without a well-formed session; these
 * guards re-check every protected page and API handler against MongoDB:
 *  - the admin in the session still exists, and
 *  - the session's sessionVersion equals the admin's (a password change increments it,
 *    which revokes every older session).
 */

import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AuthConfigError } from "./config";
import { DatabaseUnavailableError, findAdminProfile, type AdminProfile } from "./admin-store";
import { getAdminSession, hasValidSessionShape, type LiveSession } from "./session";
import { apiError } from "./api";

export interface AuthenticatedAdmin {
  admin: AdminProfile;
  session: LiveSession;
}

/** Signed-out users with a stale cookie go here: it clears the cookie, then shows the login page. */
export const SESSION_ENDED_PATH = "/api/admin/session/ended";

/**
 * Resolves the signed-in admin, or null when signed out / revoked.
 * Throws DatabaseUnavailableError when MongoDB can't be reached (callers decide how to fail).
 * Cached per request, so a page and its children share one lookup.
 */
export const getAuthenticatedAdmin = cache(async (): Promise<AuthenticatedAdmin | null> => {
  let data;
  try {
    data = await getAdminSession();
  } catch (error) {
    if (error instanceof AuthConfigError) return null; // misconfigured: fail closed
    return null;
  }
  if (!hasValidSessionShape(data)) return null;
  const admin = await findAdminProfile(data.adminId);
  if (!admin || admin.sessionVersion !== data.sessionVersion) return null;
  return { admin, session: { adminId: data.adminId, sessionVersion: data.sessionVersion, issuedAt: data.issuedAt, loginId: data.loginId } };
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

/** For protected Route Handlers: the admin, or a ready-made error response (401 / 503). */
export async function requireAdminApi(): Promise<{ ok: true; auth: AuthenticatedAdmin } | { ok: false; response: Response }> {
  await connection();
  try {
    const auth = await getAuthenticatedAdmin();
    if (auth) return { ok: true, auth };
    return { ok: false, response: apiError(401, "UNAUTHENTICATED", "Your session has ended. Please sign in again.") };
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return { ok: false, response: apiError(503, "DATABASE_UNAVAILABLE", "The database is unavailable right now. Please try again shortly.") };
    }
    return { ok: false, response: apiError(500, "SERVER_ERROR", "Something went wrong. Please try again.") };
  }
}
