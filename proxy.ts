import { NextResponse, type NextRequest } from "next/server";
import { caseStudiesEnabled } from "@/lib/content/case-studies-publishing";
import { SESSION_COOKIE_NAME, verifySessionCookie } from "@/lib/auth/session";

/**
 * 1. Admin gate (/admin/*, /api/admin/*)
 *    - Signed-out visitors to admin pages are redirected to /admin/login.
 *    - Signed-out calls to admin APIs get 401 (login and logout handle themselves).
 *    - Signed-in visitors to /admin/login (or /admin) go to /admin/dashboard.
 *    Pages and handlers re-check the session themselves (lib/auth/require-admin.ts),
 *    so this is the first line of defence, not the only one.
 *
 * 3. Blog articles: decided by MongoDB on the page itself (lib/blog/public.ts; the page is
 *    ensureStatic = "navigation", so unknown / draft / deleted slugs get a real 404 and old
 *    slugs a 308 before any HTML is sent). The proxy never queries the database.
 *
 * 2. Case Studies section switch: while it is off (lib/content/case-studies-publishing.ts),
 *    /case-studies and every /case-studies/<slug> get the standard 404. While it is on,
 *    per-project visibility is decided by MongoDB on the pages themselves: only PUBLISHED
 *    records render; unknown, draft, archived and deleted slugs get a real HTTP 404 and old
 *    slugs a 308 (the detail page is ensureStatic = "navigation", so both are decided before
 *    any HTML is sent). The proxy never queries the database.
 */

const PUBLIC_ADMIN_APIS = new Set(["/api/admin/login", "/api/admin/logout", "/api/admin/session/ended"]);

function adminHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

async function adminGate(request: NextRequest, pathname: string) {
  if (PUBLIC_ADMIN_APIS.has(pathname)) return adminHeaders(NextResponse.next());

  // Seal + expiry only (no database). Pages and handlers also check MongoDB (revocation).
  const signedIn = await verifySessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname.startsWith("/api/admin")) {
    if (signedIn) return adminHeaders(NextResponse.next());
    return adminHeaders(
      NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED", message: "Your session has ended. Please sign in again." } }, { status: 401 }),
    );
  }

  const isLogin = pathname === "/admin/login";
  if (pathname === "/admin" || (isLogin && signedIn)) {
    return adminHeaders(NextResponse.redirect(new URL(signedIn ? "/admin/dashboard" : "/admin/login", request.url)));
  }
  if (isLogin || signedIn) return adminHeaders(NextResponse.next());
  return adminHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin")) {
    return adminGate(request, pathname);
  }

  const [, section] = pathname.split("/");

  // Case Studies: section switch only (see 2).
  if (section === "case-studies" && caseStudiesEnabled) return NextResponse.next();
  return NextResponse.rewrite(new URL("/404-not-found", request.url));
}

export const config = {
  matcher: ["/case-studies", "/case-studies/:slug", "/admin", "/admin/:path*", "/api/admin/:path*"],
};
