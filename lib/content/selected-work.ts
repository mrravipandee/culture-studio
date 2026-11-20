/**
 * CULT.URE — Home "03 — Selected Work".
 *
 * Intro and CTA: client copy deck (Home → 03 Selected Work).
 * Projects: PUBLISHED case studies marked "featured" in /admin/case-studies (MongoDB).
 * `slugs` below is only the initial featured set used by the migration
 * (lib/case-studies/migration.ts); editing it no longer changes the Home page.
 *
 * Legacy sample projects are archived in lib/content/archive/legacy-selected-work.ts.
 */

import type { SectionIntro } from "./home";

export const selectedWork = {
  intro: {
    index: "03",
    eyebrow: "Selected work",
    title: "The thinking behind the work.",
    description: "A selection of projects across brand, communication, digital marketing and technology.",
  } satisfies SectionIntro,
  cta: { label: "View case studies", href: "/case-studies" },
  /** Initial featured set for the migration (Home order follows each project's sortOrder). */
  slugs: ["the-dco", "motion-media", "xlar-media", "fashion-brand-growth"],
};
