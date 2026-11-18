/**
 * Request helpers for admin Route Handlers. SERVER-ONLY.
 */

import { NextResponse, type NextRequest } from "next/server";

/**
 * CSRF guard for state-changing requests: the browser-supplied Origin must be this site.
 * (The session cookie is also SameSite=Lax, and mutations require a JSON body, which a
 * cross-site HTML form cannot send.)
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  return origin === request.nextUrl.origin;
}

/**
 * Proxy headers (X-Forwarded-For, X-Real-IP, x-vercel-ip-*) can be set by anyone unless a
 * trusted proxy overwrites them. They are trusted only on Vercel (which overwrites them) or
 * when TRUST_PROXY_HEADERS=true is set for another proxy that does the same.
 */
export const trustProxyHeaders = () => process.env.VERCEL === "1" || process.env.TRUST_PROXY_HEADERS === "true";

/** Client IP from trusted proxy headers, or null when it can't be known reliably. */
export function trustedClientIp(request: NextRequest): string | null {
  if (!trustProxyHeaders()) return null;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip")?.trim();
  return ip && ip.length <= 64 ? ip : null;
}

/** Key for rate limiting: the trusted IP, or one shared bucket when the IP is unknown. */
export const clientIp = (request: NextRequest) => trustedClientIp(request) ?? "unknown";

/** "City, Region, Country" from Vercel's geo headers (only when trusted), else null. */
export function trustedLocation(request: NextRequest): string | null {
  if (process.env.VERCEL !== "1") return null;
  const read = (name: string) => {
    const v = request.headers.get(name);
    if (!v) return "";
    try {
      return decodeURIComponent(v).trim();
    } catch {
      return "";
    }
  };
  const parts = [read("x-vercel-ip-city"), read("x-vercel-ip-country-region"), read("x-vercel-ip-country")].filter((p) => p && /^[\p{L}\p{M}\s.'-]{1,60}$/u.test(p));
  return parts.length ? parts.join(", ").slice(0, 120) : null;
}

/** JSON response that is never cached. */
export function json(body: Record<string, unknown>, status: number, headers: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", ...headers },
  });
}
