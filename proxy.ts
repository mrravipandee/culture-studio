import { NextResponse, type NextRequest } from "next/server";
import { caseStudiesEnabled, isCaseStudyPublished } from "@/lib/content/case-studies-publishing";

/**
 * Case Studies visibility and real HTTP 404s.
 *
 * - /case-studies: 404 while no case study is explicitly published.
 * - /case-studies/<slug>: 404 unless that slug is explicitly published
 *   (lib/content/case-studies-publishing.ts). Unknown and unpublished sample slugs
 *   are treated the same way.
 *
 * With cacheComponents, `dynamicParams = false` is unavailable and the detail page reads
 * params inside <Suspense>, so a notFound() there would arrive after a 200 had already
 * been sent. Rewriting to a path no route matches renders the standard server-side 404
 * page (status 404, single noindex) before any rendering.
 */
export function proxy(request: NextRequest) {
  const [, section, slug] = request.nextUrl.pathname.split("/");
  const allowed = slug === undefined || slug === "" ? caseStudiesEnabled : section === "case-studies" && isCaseStudyPublished(slug);
  if (allowed) return NextResponse.next();
  return NextResponse.rewrite(new URL("/404-not-found", request.url));
}

export const config = {
  // The listing and detail pages only; everything else bypasses the proxy.
  matcher: ["/case-studies", "/case-studies/:slug"],
};
