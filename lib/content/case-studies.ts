/**
 * CULT.URE — Case studies (approved projects). SERVER-ONLY DATA.
 *
 * Source of truth: the client-supplied project list (nine projects). Titles, highlights,
 * overviews, services, scope and results are the client's exact wording. Nothing here
 * adds challenges, strategies, timelines, testimonials or further results.
 *
 * A project is public only if its slug is listed in lib/content/case-studies-publishing.ts.
 * Do not import this file from client components.
 *
 * Images: no verified project imagery has been supplied. Some projects use TEMPORARY
 * illustrative photographs (cropped from existing site assets into
 * /public/images/case-studies/, `image.temporary: true`); they are not client work and are
 * captioned "Illustrative image" on the detail page. Projects with `src: null` show a
 * branded typographic visual (components/case-studies/ProjectVisual.tsx). To replace an
 * image, drop the approved file into /public/images/case-studies/ and update `image` below.
 *
 * `filters` maps each project to the listing filters, based only on its supplied services.
 *
 * `discipline` is CULT.URE's editorial mapping of each project to one of the four service
 * disciplines (used as the card category); it is not client copy.
 *
 * Legacy unverified samples live in lib/content/archive/ (not imported anywhere).
 */

import type { DisciplineId } from "./disciplines";
import { disciplineById } from "./disciplines";
import { isCaseStudyPublished, publishedCaseStudySlugs } from "./case-studies-publishing";

/** One figure: `value` + " " + `label` reproduces the client's exact line. */
export type CaseStudyFigure = { value: string; label: string };

export type CaseStudyGroup = "selected" | "growth";

export interface CaseStudy {
  /** Display number from the client list ("01"–"09"). */
  number: string;
  slug: string;
  title: string;
  /** "Project Highlight". */
  highlight: string;
  overview: string;
  /** Client's service labels for this project. */
  services: string[];
  /** "Project Scope" or "Results", as supplied. */
  figuresLabel: "Project Scope" | "Results";
  figures: CaseStudyFigure[];
  group: CaseStudyGroup;
  discipline: DisciplineId;
  /** Listing filters this project appears under (derived from its services). */
  filters: CaseStudyFilterId[];
  image: CaseStudyImage;
}

export interface CaseStudyImage {
  src: string | null;
  alt: string;
  /** True for placeholder photography that is not the client's work. */
  temporary?: boolean;
  /** CSS object-position for the crop, e.g. "50% 30%". */
  position?: string;
}

export type CaseStudyFilterId = "branding" | "social-media" | "website-seo" | "performance-marketing";

/** Listing filters, in display order ("All projects" is added by the UI). */
export const caseStudyFilters: { id: CaseStudyFilterId; label: string }[] = [
  { id: "branding", label: "Branding" },
  { id: "social-media", label: "Social Media" },
  { id: "website-seo", label: "Website & SEO" },
  { id: "performance-marketing", label: "Performance Marketing" },
];

export const caseStudyGroups: Record<CaseStudyGroup, { title: string }> = {
  selected: { title: "Selected projects" },
  growth: { title: "Growth & Performance Marketing" },
};

const f = (value: string, label: string): CaseStudyFigure => ({ value, label });

export const caseStudies: CaseStudy[] = [
  {
    number: "01",
    slug: "the-dco",
    title: "THE DCO",
    highlight: "Building a stronger brand identity and digital presence for a hospitality advisory firm.",
    overview:
      "Developed brand positioning and identity, then carried the direction across the website and social media presence.",
    services: ["Brand Positioning", "Brand Identity", "Website Design & Development", "Social Media Management"],
    figuresLabel: "Project Scope",
    figures: [f("360°", "Brand Development"), f("03", "Brand Touchpoints"), f("01", "Unified Identity")],
    group: "selected",
    discipline: "brand-strategy-communications",
    filters: ["branding", "website-seo", "social-media"],
    image: { src: "/images/case-studies/the-dco-architecture.jpg", alt: "Glass high-rise towers seen from street level", temporary: true },
  },
  {
    number: "02",
    slug: "motion-media",
    title: "Motion Media",
    highlight: "Driving business growth through strategic brand positioning and client acquisition.",
    overview:
      "Repositioned a production house and strengthened its pitching approach, translating clearer market positioning into new client acquisition and sales growth.",
    services: ["Brand Positioning", "Sales Pitching", "Brand Communication"],
    figuresLabel: "Results",
    figures: [f("25%", "Sales Growth"), f("05", "New Clients Acquired"), f("5", "Clients Acquired in 7 Days")],
    group: "selected",
    discipline: "brand-strategy-communications",
    filters: ["branding"],
    image: { src: "/images/case-studies/motion-media-camera.jpg", alt: "A mirrorless camera and lenses on a dark surface", temporary: true, position: "50% 40%" },
  },
  {
    number: "03",
    slug: "xlar-media",
    title: "XLAR Media",
    highlight: "Strengthening the digital presence of an indoor DOOH network in Nashik.",
    overview:
      "Worked across website development, SEO, content strategy and digital marketing to improve online presence and lead generation.",
    services: ["Website Design & Development", "SEO", "Content Strategy", "Digital Marketing"],
    figuresLabel: "Results",
    figures: [f("60%", "Increase in Organic Leads"), f("1K", "Website Visitors")],
    group: "selected",
    discipline: "digital-marketing-growth",
    filters: ["website-seo"],
    image: { src: "/images/case-studies/xlar-media-screens.jpg", alt: "A dark wall of video screens", temporary: true },
  },
  {
    number: "04",
    slug: "personal-brand-growth-campaign",
    title: "Personal Brand Growth Campaign",
    highlight: "Taking a personal brand from 1K to 7K followers with 500K campaign views.",
    overview:
      "Built and executed an Instagram growth campaign focused on increasing audience reach and follower growth.",
    services: ["Instagram Campaign Strategy", "Social Media Growth"],
    figuresLabel: "Results",
    figures: [f("7K", "Followers"), f("500K", "Campaign Views"), f("600%", "Audience Growth")],
    group: "selected",
    discipline: "content-creative",
    filters: ["social-media"],
    image: { src: null, alt: "" },
  },
  {
    number: "05",
    slug: "orthopaedic-surgeon",
    title: "Orthopaedic Surgeon",
    highlight: "Generating 100K+ organic views across social media for an orthopaedic surgeon.",
    overview:
      "Managed social media content with a focus on informative video communication and organic audience reach.",
    services: ["Social Media Strategy & Management", "Video Content"],
    figuresLabel: "Results",
    figures: [f("100K+", "Total Organic Views"), f("6K", "Average Views Per Video"), f("90-Second", "Video Format")],
    group: "selected",
    discipline: "content-creative",
    filters: ["social-media"],
    image: { src: null, alt: "" },
  },
  {
    number: "06",
    slug: "linkedin-visibility-ghostwriting",
    title: "LinkedIn Visibility & Ghostwriting",
    highlight: "Taking LinkedIn impressions from 1K to 28K in just seven days.",
    overview:
      "Developed LinkedIn communication and ghostwritten content to strengthen professional visibility and audience engagement.",
    services: ["LinkedIn Ghostwriting", "Thought Leadership", "Personal Branding"],
    figuresLabel: "Results",
    figures: [f("28K", "Impressions"), f("28×", "Growth"), f("27K", "Additional Impressions")],
    group: "selected",
    discipline: "content-creative",
    filters: ["social-media"],
    image: { src: "/images/case-studies/linkedin-workspace.jpg", alt: "A laptop on a long desk by floor-to-ceiling windows", temporary: true },
  },
  {
    number: "07",
    slug: "fashion-brand-growth",
    title: "Fashion Brand Growth",
    highlight: "Scaling revenue and improving paid acquisition efficiency for a fashion brand.",
    overview: "Growth-focused marketing across customer acquisition and online sales.",
    services: ["Performance Marketing", "E-commerce Growth", "Campaign Optimisation"],
    figuresLabel: "Results",
    figures: [f("218%", "Revenue Growth"), f("6.8×", "Return on Ad Spend"), f("12,450", "Monthly Orders")],
    group: "growth",
    discipline: "digital-marketing-growth",
    filters: ["performance-marketing"],
    image: { src: "/images/case-studies/fashion-editorial.jpg", alt: "Editorial portrait with flowing fabric against deep burgundy", temporary: true, position: "35% 50%" },
  },
  {
    number: "08",
    slug: "beauty-brand-growth",
    title: "Beauty Brand Growth",
    highlight: "Improving customer acquisition and repeat purchasing for a beauty brand.",
    overview:
      "Marketing focused on increasing qualified traffic, improving acquisition efficiency and encouraging repeat orders.",
    services: ["Performance Marketing", "Retention Marketing", "E-commerce Growth"],
    figuresLabel: "Results",
    figures: [
      f("42%", "Increase in Repeat Purchase Rate"),
      f("176%", "Traffic Growth"),
      f("34%", "Reduction in Customer Acquisition Cost"),
    ],
    group: "growth",
    discipline: "digital-marketing-growth",
    filters: ["performance-marketing"],
    image: { src: null, alt: "" },
  },
  {
    number: "09",
    slug: "marketplace-growth",
    title: "Marketplace Growth",
    highlight: "Driving marketplace sales through stronger product visibility and performance marketing.",
    overview:
      "Marketplace growth activity focused on sales performance, advertising efficiency and product discoverability.",
    services: ["Marketplace Marketing", "Performance Advertising", "Product Optimisation"],
    figuresLabel: "Results",
    figures: [f("312%", "Sales Growth"), f("8.4×", "Return on Ad Spend"), f("Top 5", "Product Ranking")],
    group: "growth",
    discipline: "digital-marketing-growth",
    filters: ["performance-marketing"],
    image: { src: null, alt: "" },
  },
];

/** Category label shown on cards: the mapped discipline's official name. */
export const caseStudyCategory = (project: CaseStudy) => disciplineById(project.discipline)?.name ?? "";

/* ---------------------------------------------------------------
   Publishing (see lib/content/case-studies-publishing.ts)
---------------------------------------------------------------- */

// Guard: every approved slug must exist here (fails the build otherwise).
for (const slug of publishedCaseStudySlugs) {
  if (!caseStudies.some((p) => p.slug === slug)) {
    throw new Error(`Published case study "${slug}" does not exist in lib/content/case-studies.ts.`);
  }
}

/** Only explicitly approved projects, in the client's order. */
export const publishedCaseStudies: CaseStudy[] = caseStudies.filter((p) => isCaseStudyPublished(p.slug));
export const publishedInGroup = (group: CaseStudyGroup) => publishedCaseStudies.filter((p) => p.group === group);

/* ---------------------------------------------------------------
   Listing page copy (client brief: Case Studies page)
---------------------------------------------------------------- */

export const caseStudiesHero = {
  eyebrow: "Case studies",
  /** Two lines; `accent` is set in burgundy. */
  headline: [
    { text: "Real Brands.", accent: "" },
    { text: "Measurable ", accent: "Growth." },
  ],
  description:
    "A selection of projects that show how strategy, design and marketing come together to create real business impact.",
  /** Temporary abstract texture (decorative, from an existing site asset). */
  image: { src: "/images/case-studies/hero-burgundy-material.jpg", temporary: true },
};

type Highlight = { value: string; label: string; source: string | null };

/**
 * Performance highlights: selected figures from individual projects, read from the
 * project data above so they never drift. Not averages or combined results.
 */
const figureFrom = (slug: string, index: number): Highlight | null => {
  const project = publishedCaseStudies.find((p) => p.slug === slug);
  const figure = project?.figures[index];
  return project && figure ? { value: figure.value, label: figure.label, source: project.title } : null;
};

export const caseStudyHighlights = {
  note: "Selected results from individual projects",
  items: [
    { value: String(publishedCaseStudies.length).padStart(2, "0"), label: "Case Studies", source: null },
    figureFrom("xlar-media", 0),
    figureFrom("fashion-brand-growth", 0),
    figureFrom("marketplace-growth", 1),
  ].filter((item): item is Highlight => item !== null),
};

/** Closing CTA (client brief). */
export const caseStudiesCta = {
  eyebrow: "Have a project in mind?",
  headline: { before: "Let’s Create Your", line2: "Next ", accent: "Success", after: " Story." },
  ctaText: "Start a Conversation",
  ctaHref: "/contact",
};
