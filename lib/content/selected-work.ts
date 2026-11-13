/**
 * CULT.URE — Home "Selected Work" (SERVER-ONLY DATA).
 *
 * Moved out of lib/content/home.ts because home.ts is imported by client components
 * (Navbar, InquiryForm): keeping unpublished sample projects there shipped their names
 * in public JavaScript. Import this file only from server components.
 *
 * The section renders only when a case study is explicitly published
 * (lib/content/case-studies-publishing.ts), and then only non-sample projects.
 */

import type { ContentImage, SectionIntro } from "./home";
import type { ServiceId } from "./service-catalog";

/* ---------------------------------------------------------------
   05 — Selected Work
---------------------------------------------------------------- */

export type Project = {
  id: string;
  title: string;
  description: string;
  /** Link to the full case study once it exists. */
  href: string | null;
  placeholder: boolean;
  image: ContentImage;
  year?: string;
  /** Official services involved (lib/content/service-catalog.ts). */
  services: ServiceId[];
  scope?: string;
};

export const selectedWork = {
  intro: {
    index: "03",
    eyebrow: "Selected work",
    title: "The thinking behind the work.",
    description: "A selection of projects across brand, communication, digital marketing and technology.",
  } satisfies SectionIntro,
  cta: { label: "View case studies", href: "/case-studies" },
  projects: [
    {
      id: "sample-01",
      title: "Aura & Influence",
      description:
        "Public positioning and media narrative for a technology founder.",
      href: "/case-studies/aura-and-influence",
      placeholder: true,
      services: ["personal-branding-linkedin-marketing"],
      year: "2026",
      scope: "Technology founder",
      image: {
        src: "/images/work/featured.jpg",
        alt: "Man in a dark suit fastening his jacket button",
        placeholderLabel: "Project image — Aura & Influence",
      },
    },
    {
      id: "sample-02",
      title: "Vanguard Monograph",
      description:
        "An editorial publication and visual content series for an investor audience.",
      href: "/case-studies/vanguard-monograph",
      placeholder: true,
      services: ["social-media-marketing"],
      year: "2025",
      scope: "Venture capital partner",
      image: {
        src: "/images/work/project-02.jpg",
        alt: "Smiling woman wearing a crown of red and pink flowers",
        placeholderLabel: "Project image — Vanguard Monograph",
      },
    },
    {
      id: "sample-03",
      title: "Cognition Capital",
      description:
        "Visual identity, website and a private editorial channel for a venture investor.",
      href: "/case-studies/cognition-capital",
      placeholder: true,
      services: ["personal-branding-linkedin-marketing", "website-design-development"],
      year: "2025",
      scope: "Venture investor",
      image: {
        src: "/images/work/project-03.jpg",
        alt: "Glass office towers seen from street level",
        placeholderLabel: "Project image — Cognition Capital",
      },
    },
    {
      id: "sample-04",
      title: "The Synthesist",
      description:
        "A multi-platform presence supported by AI-assisted research and publishing workflows.",
      href: "/case-studies/the-synthesist",
      placeholder: true,
      services: ["personal-branding-linkedin-marketing", "ai-business-automation"],
      year: "2026",
      scope: "Life sciences leader",
      image: {
        src: "/images/work/project-04.jpg",
        alt: "Bright workspace with a laptop beside tall windows",
        placeholderLabel: "Project image — The Synthesist",
      },
    },
  ] satisfies Project[],
};

