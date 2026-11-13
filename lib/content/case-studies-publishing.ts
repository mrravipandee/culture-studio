/**
 * CULT.URE — Case Studies publishing switch (explicit approval list).
 *
 * A case study is public ONLY if its slug is listed here. `placeholder: false` in
 * lib/content/case-studies.ts is NOT approval: add a slug here only once the client
 * has explicitly approved the project (name, description, client details, images).
 *
 * While this list is empty:
 *  - /case-studies and every /case-studies/<slug> return HTTP 404 (proxy.ts + pages)
 *  - Case Studies is removed from the Navbar, mobile menu, Footer and 404 page
 *  - the Home "Selected Work" section is hidden and Home sections are renumbered
 *  - /case-studies is excluded from the sitemap
 * Adding the first approved slug restores all of the above automatically.
 *
 * This module deliberately contains no project data, so client components (Navbar)
 * can import it without bundling unpublished sample content into public JavaScript.
 */

export const publishedCaseStudySlugs: readonly string[] = [];

/** True when at least one case study has been explicitly approved and published. */
export const caseStudiesEnabled = publishedCaseStudySlugs.length > 0;

export const isCaseStudyPublished = (slug: string) => publishedCaseStudySlugs.includes(slug);
