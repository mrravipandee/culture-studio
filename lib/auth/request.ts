/**
 * Request helpers for admin Route Handlers. SERVER-ONLY.
 */

import { NextResponse, type NextRequest } from "next/server";

/**
 * CSRF guard for state-changing requests: the browser-supplied Origin must be this site.
 * (The session cookie is also SameSite=Lax, and login requires a JSON body, which a
 * cross-site HTML form cannot send.)
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  return origin === request.nextUrl.origin;
}

/** Best-effort client IP for rate limiting (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

/** JSON response that is never cached. */
export function json(body: Record<string, unknown>, status: number, headers: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", ...headers },
  });
}
