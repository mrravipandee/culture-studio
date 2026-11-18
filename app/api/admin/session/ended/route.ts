import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/session";

/**
 * GET /api/admin/session/ended — clears the session cookie and shows the login page.
 *
 * Protected pages send signed-out or revoked sessions here (a Server Component can't clear
 * cookies itself). Without it, a revoked but still well-formed cookie would bounce between
 * /admin/login (proxy: "signed in") and the page guard (MongoDB: "revoked").
 * Clearing a cookie is harmless if triggered cross-site, so GET is acceptable here.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    session.destroy();
  } catch {
    // misconfigured: there is no valid session to clear
  }
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
