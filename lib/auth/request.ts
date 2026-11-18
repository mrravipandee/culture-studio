import "server-only";

/**
 * Client network details for admin Route Handlers. SERVER-ONLY.
 * (Same-origin/CSRF checks and JSON responses live in lib/server/http.ts.)
 */

import type { NextRequest } from "next/server";

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
