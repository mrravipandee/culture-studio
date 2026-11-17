import { NextResponse, type NextRequest } from "next/server";
import { caseStudiesEnabled, isCaseStudyPublished } from "@/lib/content/case-studies-publishing";
import { SESSION_COOKIE_NAME, verifySessionCookie } from "@/lib/auth/session";

/**
 * 1. Admin gate (/admin/*, /api/admin/*)
 *    - Signed-out visitors to admin pages are redirected to /admin/login.
 *    - Signed-out calls to admin APIs get 401 (login and logout handle themselves).
 *    - Signed-in visitors to /admin/login (or /admin) go to /admin/dashboard.
 *    Pages and handlers re-check the session themselves (lib/auth/require-admin.ts),
 *    so this is the first line of defence, not the only one.
 *
 * 2. Case Studies visibility and real HTTP 404s.
 *    - /case-studies: 404 while no case study is explicitly published.
 *    - /case-studies/<slug>: 404 unless that slug is explicitly published
 *      (lib/content/case-studies-publishing.ts). Unknown and unpublished sample slugs
 *      are treated the same way.
 *    With cacheComponents, `dynamicParams = false` is unavailable and the detail page reads
 *    params inside <Suspense>, so a notFound() there would arrive after a 200 had already
 *    been sent. Rewriting to a path no route matches renders the standard server-side 404
 *    page (status 404, single noindex) before any rendering.
 */

const PUBLIC_ADMIN_APIS = new Set(["/api/admin/login", "/api/admin/logout"]);

function adminHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

async function adminGate(request: NextRequest, pathname: string) {
  if (PUBLIC_ADMIN_APIS.has(pathname)) return adminHeaders(NextResponse.next());

  const signedIn = await verifySessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname.startsWith("/api/admin")) {
    if (signedIn) return adminHeaders(NextResponse.next());
    return adminHeaders(NextResponse.json({ error: "Unauthorised." }, { status: 401 }));
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

  const [, section, slug] = pathname.split("/");
  const allowed = slug === undefined || slug === "" ? caseStudiesEnabled : section === "case-studies" && isCaseStudyPublished(slug);
  if (allowed) return NextResponse.next();
  return NextResponse.rewrite(new URL("/404-not-found", request.url));
}

export const config = {
  matcher: ["/case-studies", "/case-studies/:slug", "/admin", "/admin/:path*", "/api/admin/:path*"],
};
