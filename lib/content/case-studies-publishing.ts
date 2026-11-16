/**
 * CULT.URE — Case Studies publishing switch (explicit approval list).
 *
 * A case study is public ONLY if its slug is listed here. Add a slug only once the
 * client has explicitly approved the project's content for publication.
 *
 * While this list is empty:
 *  - /case-studies and every /case-studies/<slug> return HTTP 404 (proxy.ts + pages)
 *  - Case Studies is removed from the Navbar, mobile menu, Footer and 404 page
 *  - the Home "Selected Work" section is hidden and Home sections are renumbered
 *  - /case-studies is excluded from the sitemap
 * With at least one slug listed, all of the above is restored automatically.
 *
 * This module deliberately contains no project data, so client components (Navbar)
 * can import it without bundling project content into public JavaScript.
 */

/** Approved by the client for publication (nine projects). */
export const publishedCaseStudySlugs: readonly string[] = [
  "the-dco",
  "motion-media",
  "xlar-media",
  "personal-brand-growth-campaign",
  "orthopaedic-surgeon",
  "linkedin-visibility-ghostwriting",
  "fashion-brand-growth",
  "beauty-brand-growth",
  "marketplace-growth",
];

/** True when at least one case study has been explicitly approved and published. */
export const caseStudiesEnabled = publishedCaseStudySlugs.length > 0;

export const isCaseStudyPublished = (slug: string) => publishedCaseStudySlugs.includes(slug);
