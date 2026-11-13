/**
 * CULT.URE — Homepage content.
 *
 * All homepage copy lives here so it can be edited without touching layout.
 * Anything marked `placeholder: true` is a clearly labelled stand-in and
 * must be replaced with real, approved material before launch.
 * Images: set `image.src` to a file in /public/images/... to replace a
 * placeholder frame with an optimised next/image.
 */

import { caseStudiesEnabled } from "./case-studies-publishing";

/**
 * Home section numbers. "03 — Selected Work" appears only when a case study is explicitly
 * published; until then the following sections move up one number.
 * Published: 01 Manifesto · 02 Services · 03 Selected Work · 04 Process · 05 Why · 06 Contact
 * Hidden:    01 Manifesto · 02 Services · 03 Process · 04 Why · 05 Contact
 */
const homeIndex = (published: number) => String(caseStudiesEnabled ? published : published - 1).padStart(2, "0");

export type ContentImage = {
  /** Path under /public, e.g. "/images/work/project-01.jpg". */
  src: string | null;
  alt: string;
  /** Label shown inside the placeholder frame while `src` is null. */
  placeholderLabel: string;
};

export type SectionIntro = {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
};

/* ---------------------------------------------------------------
   03 — Manifesto
---------------------------------------------------------------- */

export const manifesto = {
  intro: {
    index: "01",
    eyebrow: "Manifesto",
    title: "Attention is easy to buy. Being remembered is harder.",
  } satisfies SectionIntro,
  /** One string per paragraph. */
  lead: [
    "B2B markets are crowded with businesses making similar promises. More content, more campaigns and more visibility do not automatically make a business distinctive. What matters is what decision-makers understand about you, what they associate with your name and whether they have a reason to consider you.",
    "That comes from a clear market position, communication with substance and a consistent presence across every point of contact. CULT.URE believes marketing should do more than keep a business visible. It should give the market a reason to pay attention.",
  ],
  beliefs: [
    {
      title: "Clarity before communication",
      body: "A business needs to know what it stands for, who it serves and why its work matters before it can communicate those things convincingly.",
    },
    {
      title: "Substance over volume",
      body: "Publishing more is not the same as saying something worthwhile. Every message should have a purpose and every channel should have a role.",
    },
    {
      title: "Consistency builds recognition",
      body: "A brand becomes familiar when its identity, language and experience reinforce the same impression over time.",
    },
  ],
  value: {
    title: "Why it has to work as one",
    body: "A strong market position cannot exist in isolation from the way a business communicates. The website, content, campaigns, search presence and customer experience all contribute to the same perception. When those elements are disconnected, the business tells several different stories. When they are aligned, each interaction builds on the last.",
  },
};

/* ---------------------------------------------------------------
   04 — Expertise (proposed service categories — edit freely)
---------------------------------------------------------------- */

/**
 * Logo marquee. PLACEHOLDER names: replace with real, approved client logos
 * (set `src` to an SVG in /public/images/clients/) before launch.
 */
export const trustedBy = {
  label: "Trusted by founders and leaders at",
  placeholder: true,
  logos: [
    { name: "Client One", src: null },
    { name: "Client Two", src: null },
    { name: "Client Three", src: null },
    { name: "Client Four", src: null },
    { name: "Client Five", src: null },
    { name: "Client Six", src: null },
  ],
};

export const expertise = {
  intro: {
    index: "02",
    eyebrow: "Services",
    title: "The work behind how a business is seen, understood and chosen.",
    description:
      "CULT.URE works primarily with B2B businesses, bringing four connected areas of expertise to the challenges of positioning, communication, demand generation and growth.",
  } satisfies SectionIntro,
  /** Disciplines and services live in lib/content/disciplines.ts. */
  cta: { label: "Explore all services", href: "/services" },
};

/* ---------------------------------------------------------------
   05 — Selected Work: moved to lib/content/selected-work.ts (server-only),
   so unpublished sample projects never reach client JavaScript bundles.
---------------------------------------------------------------- */

/* ---------------------------------------------------------------
   06 — Our Thinking
---------------------------------------------------------------- */

export const thinking = {
  intro: {
    index: "05",
    eyebrow: "Thinking",
    title: "How we think about brands, marketing and technology.",
  } satisfies SectionIntro,
  statements: [
    {
      topic: "On branding",
      statement: "A brand is not what you say. It is what people repeat.",
      body: "Positioning only works when it is simple enough for others to carry. We design for the sentence people use to describe you when you are not in the room.",
    },
    {
      topic: "On content",
      statement: "Your audience doesn't need more content. It needs a clearer message.",
      body: "Volume is easy; meaning is rare. We would rather publish fewer pieces, each with a clear reason to exist.",
    },
    {
      topic: "On culture",
      statement: "Trends are borrowed. Culture is built.",
      body: "Chasing what is popular makes you interchangeable. Building around what you believe makes you a reference point.",
    },
    {
      topic: "On AI",
      statement: "Automate the process. Never the perspective.",
      body: "AI should give time back for original thinking by handling repetitive work, so the voice stays human.",
    },
  ],
};

/* ---------------------------------------------------------------
   07 — Process
---------------------------------------------------------------- */

export const processSteps = {
  intro: {
    index: homeIndex(4),
    eyebrow: "Process",
    title: "Good work begins with the right questions.",
    description:
      "Every engagement starts with understanding the business, not selecting a service from a list. The scope is shaped around the objective, the market and the work required to make progress.",
  } satisfies SectionIntro,
  steps: [
    {
      title: "Discover",
      tagline: "Understand the context",
      body: "Understand the business, its market, its audience and the challenges it needs to address.",
      deliverables: ["Discovery discussion", "Business and channel assessment", "Audience and competitor review", "Agreed objectives"],
    },
    {
      title: "Define",
      tagline: "Set the direction",
      body: "Translate the findings into a focused plan, with clear priorities, recommended activities and measures of success.",
      deliverables: ["Strategic recommendations", "Scope and deliverables", "Execution plan", "Measurement framework"],
    },
    {
      title: "Create",
      tagline: "Develop and execute",
      body: "Develop and execute the agreed work across brand communication, creative production, campaigns, digital experiences and automation.",
      deliverables: ["Content and creative", "Campaign execution", "Digital development", "Technical implementation"],
    },
    {
      title: "Evolve",
      tagline: "Review, refine and progress",
      body: "Review performance against the original objectives, identify refinements and establish the next priorities.",
      deliverables: ["Performance reporting", "Analysis and recommendations", "Optimisation", "Next-stage planning"],
    },
  ],
};


/* ---------------------------------------------------------------
   08 — Why CULT.URE
---------------------------------------------------------------- */

export const whyCulture = {
  intro: {
    index: homeIndex(5),
    eyebrow: "Why CULT.URE",
    title: "A considered approach to modern B2B marketing.",
    description:
      "The quality of marketing depends on more than the individual pieces produced. It depends on the thinking behind them, the standards applied to them and how well they work together.",
  } satisfies SectionIntro,
  pillars: [
    {
      title: "Strategic perspective",
      body: "Business objectives, market context and audience priorities inform the work from the outset.",
    },
    {
      title: "Editorial and creative judgement",
      body: "Language, design and execution are treated as essential parts of how a business is perceived.",
    },
    {
      title: "Connected disciplines",
      body: "Brand, content, marketing and technology are considered in relation to one another, rather than treated as unrelated activities.",
    },
    {
      title: "Commercial awareness",
      body: "The work is planned around the business objective, with performance and progress evaluated against relevant measures.",
    },
  ],
  /** Shown under "What to expect". */
  commitments: [
    "A clear understanding of the brief before recommendations are made.",
    "A defined scope, priorities and intended outcomes.",
    "Thoughtful communication and considered creative execution.",
    "Transparent discussions about performance, constraints and next steps.",
  ],
};

/* ---------------------------------------------------------------
   Tagline moment (between Selected Work and Process)
---------------------------------------------------------------- */

export const reputationLine = {
  lines: ["Your reputation arrives before you do.", "Make every impression count."],
  body: "The way a business presents itself shapes the expectations people bring to the first conversation.",
};

/* ---------------------------------------------------------------
   09 — Client Voices (PLACEHOLDERS — real, approved feedback only)
---------------------------------------------------------------- */

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  placeholder: boolean;
};

export const clientVoices = {
  intro: {
    index: homeIndex(6),
    eyebrow: "Client Voices",
    title: "In their words.",
    description:
      "Client feedback will be published here only with permission.",
  } satisfies SectionIntro,
  testimonials: [
    {
      id: "voice-01",
      quote: "Testimonial placeholder — awaiting approved client feedback.",
      name: "Client name",
      role: "Role, Company",
      placeholder: true,
    },
    {
      id: "voice-02",
      quote: "Testimonial placeholder — awaiting approved client feedback.",
      name: "Client name",
      role: "Role, Company",
      placeholder: true,
    },
    {
      id: "voice-03",
      quote: "Testimonial placeholder — awaiting approved client feedback.",
      name: "Client name",
      role: "Role, Company",
      placeholder: true,
    },
  ] satisfies Testimonial[],
};

/* ---------------------------------------------------------------
   10 — Contact
---------------------------------------------------------------- */

export type SocialLink = { label: string; href: string };

/** Only approved testimonials are ever shown; placeholders keep the section hidden. */
export const hasClientVoices = clientVoices.testimonials.some((t) => !t.placeholder);

/**
 * Home "06 — Contact": a call to action to the Contact page (client copy deck, Home → 06 — Contact).
 * The full enquiry form lives on /contact (and in the About page's inline contact section).
 */
export const contactCta = {
  intro: {
    index: homeIndex(hasClientVoices ? 7 : 6),
    eyebrow: "Contact",
    title: "There is a business objective behind every good brief.",
    description:
      "A new market to reach. A proposition to clarify. A brand that needs a stronger presence. A growth opportunity worth pursuing.",
  } satisfies SectionIntro,
  closing: "Tell CULT.URE what you are working towards.",
  action: { label: "Start a conversation", href: "/contact" },
};

export const contact = {
  intro: {
    index: hasClientVoices ? "07" : "06",
    eyebrow: "Contact",
    title: "There is a business objective behind every good brief.",
    description:
      "A new market to reach. A proposition to clarify. A brand that needs a stronger presence. A growth opportunity worth pursuing. Tell CULT.URE what you are working towards.",
  } satisfies SectionIntro,
  /** Verified (client copy deck). Display form and tel: link. */
  phone: { display: "+91 77439 79071", href: "tel:+917743979071" },
  /** Verified official inbox (client-approved). Shown as a mailto link; it is not a form backend. */
  email: "cult.urestudioagency@gmail.com" as string | null,
  /** Profiles named in the copy deck (Instagram, LinkedIn, Facebook, X) have no URLs yet; add them here. */
  socials: [] as SocialLink[],
  /** Used for the CTA while no email is configured. */
  fallbackCta: { label: "Get in touch", href: "/contact" },
};
