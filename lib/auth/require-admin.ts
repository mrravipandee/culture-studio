/**
 * Server-side guards. SERVER-ONLY.
 *
 * proxy.ts already redirects or rejects unauthenticated admin requests; these guards
 * re-check the session inside every protected page and API handler, so protection never
 * depends on the proxy alone.
 */

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { json } from "./request";
import { getAdminSession, isValidAdminSession } from "./session";

/** For protected Server Components: returns the admin email or redirects to login. */
export async function requireAdmin(): Promise<{ email: string }> {
  // Session checks read the clock (seal expiry, issuedAt). With cacheComponents that must
  // happen at request time, never during prerendering: connection() marks this point.
  await connection();
  try {
    const session = await getAdminSession();
    if (isValidAdminSession(session)) return { email: session.email };
  } catch {
    // misconfigured or unreadable session: fall through (fail closed)
  }
  redirect("/admin/login");
}

/** For protected Route Handlers: null when authorised, otherwise a 401 response. */
export async function requireAdminApi() {
  await connection();
  try {
    const session = await getAdminSession();
    if (isValidAdminSession(session)) return null;
  } catch {
    // fail closed
  }
  return json({ error: "Unauthorised." }, 401);
}
