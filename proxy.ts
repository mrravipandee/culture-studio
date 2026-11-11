import { NextResponse, type NextRequest } from "next/server";
import { caseStudiesList, featuredProject } from "@/lib/content/case-studies";

const knownSlugs = new Set([featuredProject, ...caseStudiesList].map((p) => p.slug));

/**
 * Unknown case-study slugs get a real HTTP 404.
 *
 * With cacheComponents, `dynamicParams = false` is unavailable and the detail page
 * reads params inside <Suspense>, so a notFound() there would arrive after a 200
 * had already been sent. Rewriting to a path no route matches renders the
 * standard server-side 404 page (status 404, single noindex) before any rendering.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2] ?? "";
  if (knownSlugs.has(slug)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/404-not-found", request.url));
}

export const config = {
  // Detail pages only; /case-studies itself and everything else bypass the proxy.
  matcher: "/case-studies/:slug",
};
