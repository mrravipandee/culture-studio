/**
 * CULT.URE — Case Studies: section switch and the client's approval list.
 *
 * Per-project visibility now lives in MongoDB (status PUBLISHED, managed in
 * /admin/case-studies). This module keeps two things:
 *
 *  - `caseStudiesEnabled`: the SECTION switch. While false, /case-studies and every
 *    /case-studies/<slug> return 404 (proxy.ts), and Case Studies is removed from the Navbar,
 *    mobile menu, Footer, 404 page, sitemap and the Home "Selected Work" section.
 *  - `publishedCaseStudySlugs`: the client's explicit approval of the nine original projects.
 *    The migration (scripts/migrate-case-studies.mjs) creates these as PUBLISHED and any other
 *    source project as DRAFT. Changing this list does not change the live site any more.
 *
 * It contains no project data, so client components (Navbar) can import it without bundling
 * project content into public JavaScript.
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

/** Case Studies section switch (navigation, routes, sitemap, Home section). */
export const caseStudiesEnabled = true;
