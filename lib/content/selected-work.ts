/**
 * CULT.URE — Home "03 — Selected Work".
 *
 * Intro and CTA: client copy deck (Home → 03 Selected Work).
 * Projects: a selection of the approved case studies (lib/content/case-studies.ts),
 * referenced by slug. Only explicitly published projects are shown; no other projects.
 * The section is hidden entirely while no case study is published.
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
  /** Approved case studies featured on Home, in display order (card 01 and 04 are wide). */
  slugs: ["the-dco", "motion-media", "xlar-media", "fashion-brand-growth"],
};
