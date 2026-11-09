/**
 * CULT.URE — Homepage content.
 *
 * All homepage copy lives here so it can be edited without touching layout.
 * Anything marked `placeholder: true` is a clearly labelled stand-in and
 * must be replaced with real, approved material before launch.
 * Images: set `image.src` to a file in /public/images/... to replace a
 * placeholder frame with an optimised next/image.
 */

import type { ServiceId } from "./service-catalog";

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
    title: "Attention is rented. Culture is owned.",
  } satisfies SectionIntro,
  lead:
    "Most brands are built for the feed — loud, frequent and easy to forget. We believe a brand earns its place differently: by standing for something clear, expressed with consistency, on the channels and in the moments that matter.",
  beliefs: [
    {
      title: "Clarity before content",
      body: "Before anything is published, we define what you stand for and who it is for. Everything else follows from that.",
    },
    {
      title: "Consistency compounds",
      body: "Recognition is built over time. A steady, recognisable voice outlasts any single viral moment.",
    },
    {
      title: "Substance over spectacle",
      body: "The strongest brands are earned by real expertise, presented well — not by noise, volume or borrowed trends.",
    },
  ],
  value: {
    title: "Why it has to work as one",
    body: "People choose brands they recognise and trust. When strategy, creative and technology point in the same direction, every channel — from search and social to the inbox and the website — reinforces the same idea instead of competing for attention.",
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
    title: "Strategy, creative and technology. One direction.",
    description:
      "Nine services across four disciplines, planned together so every channel points the same way.",
  } satisfies SectionIntro,
  /** Services themselves live in lib/content/service-catalog.ts. */
  cta: { label: "Explore all services", href: "/services" },
};

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
    title: "Selected work.",
    description:
      "A curated archive of strategic positioning, bespoke editorial media, and cultural influence across industries.",
  } satisfies SectionIntro,
  cta: { label: "View all case studies", href: "/case-studies" },
  projects: [
    {
      id: "sample-01",
      title: "Aura & Influence",
      description:
        "Comprehensive public identity and strategic media positioning for a pioneering frontier technology founder.",
      href: "/case-studies/aura-and-influence",
      placeholder: true,
      services: ["personal-branding-linkedin-marketing"],
      year: "2026",
      scope: "Frontier AI Pioneer",
      image: {
        src: "/images/work/featured.jpg",
        alt: "Aura & Influence Case Study",
        placeholderLabel: "Project image — Aura & Influence",
      },
    },
    {
      id: "sample-02",
      title: "Vanguard Monograph",
      description:
        "An executive thought-leadership publication and cinematic visual production.",
      href: "/case-studies/vanguard-monograph",
      placeholder: true,
      services: ["social-media-marketing"],
      year: "2025",
      scope: "Venture Capital Partner",
      image: {
        src: "/images/work/project-02.jpg",
        alt: "Vanguard Monograph Case Study",
        placeholderLabel: "Project image — Vanguard Monograph",
      },
    },
    {
      id: "sample-03",
      title: "Cognition Capital",
      description:
        "Monolithic visual identity, digital architecture, and private editorial channel for a Tier-1 venture partner.",
      href: "/case-studies/cognition-capital",
      placeholder: true,
      services: ["personal-branding-linkedin-marketing", "website-design-development"],
      year: "2025",
      scope: "Deep Tech Syndicate",
      image: {
        src: "/images/work/project-03.jpg",
        alt: "Cognition Capital Case Study",
        placeholderLabel: "Project image — Cognition Capital",
      },
    },
    {
      id: "sample-04",
      title: "The Synthesist",
      description:
        "Multi-platform presence architecture utilizing proprietary cognitive workflows to transform breakthroughs into cultural narrative.",
      href: "/case-studies/the-synthesist",
      placeholder: true,
      services: ["personal-branding-linkedin-marketing", "ai-business-automation"],
      year: "2026",
      scope: "Biotech & Longevity Chair",
      image: {
        src: "/images/work/project-04.jpg",
        alt: "The Synthesist Case Study",
        placeholderLabel: "Project image — The Synthesist",
      },
    },
  ] satisfies Project[],
};

/* ---------------------------------------------------------------
   06 — Our Thinking
---------------------------------------------------------------- */

export const thinking = {
  intro: {
    index: "05",
    eyebrow: "Thinking",
    title: "How we see branding, content and culture.",
  } satisfies SectionIntro,
  statements: [
    {
      topic: "On branding",
      statement: "A brand is not what you say. It is what people repeat.",
      body: "Positioning only works when it is simple enough for others to carry. We design for the sentence people use to describe you when you are not in the room.",
    },
    {
      topic: "On content",
      statement: "Your audience doesn't need more content. It needs a clearer you.",
      body: "Volume is easy. Meaning is rare. We publish less noise and more conviction — fewer pieces, each with a reason to exist.",
    },
    {
      topic: "On culture",
      statement: "Trends are borrowed. Culture is built.",
      body: "Chasing what is popular makes you interchangeable. Building around what you believe makes you a reference point.",
    },
    {
      topic: "On AI",
      statement: "Automate the process. Never the perspective.",
      body: "AI should buy back time for original thought — handling the repetitive work so the voice stays unmistakably human.",
    },
  ],
};

/* ---------------------------------------------------------------
   07 — Process
---------------------------------------------------------------- */

export const processSteps = {
  intro: {
    index: "04",
    eyebrow: "Process",
    title: "A clear path from noise to culture.",
    description:
      "A structured 4-phase continuum translating raw leadership conviction into permanent cultural resonance.",
  } satisfies SectionIntro,
  steps: [
    {
      title: "Discover",
      tagline: "Excavation & Diagnostic",
      body: "We listen first — your story, goals, audience and the landscape you operate in — to identify what is unrepeatable, distinctive and true.",
      deliverables: ["Narrative Audit", "Archetype Mapping", "Ecosystem Whitespace"],
    },
    {
      title: "Define",
      tagline: "Positioning & Category Thesis",
      body: "We turn those insights into a clear intellectual platform and identity: what you stand for, who it influences, and how it sounds.",
      deliverables: ["Proprietary Framework", "Voice & Tone Blueprint", "Channel Architecture"],
    },
    {
      title: "Create",
      tagline: "Publication & Media Craft",
      body: "We bring the narrative to life through monographs, cinematic video, essays and systems — produced with editorial precision.",
      deliverables: ["Monograph Essays", "Cinematic Film", "Keynote Positioning"],
    },
    {
      title: "Evolve",
      tagline: "Compounding & Cultural Iteration",
      body: "We review resonance, refine positioning and deploy autonomous distribution workflows as your authority compounds.",
      deliverables: ["Cognitive Distribution", "Sentiment Tracking", "Authority Compounding"],
    },
  ],
};

/* ---------------------------------------------------------------
   08 — Why CULT.URE
---------------------------------------------------------------- */

export const whyCulture = {
  intro: {
    index: "06",
    eyebrow: "Why CULT.URE",
    title: "Strategy, creativity and cultural relevance — in one practice.",
    description:
      "We work at the intersection of three things most agencies keep separate. That is what lets a brand feel coherent instead of assembled.",
  } satisfies SectionIntro,
  pillars: [
    {
      title: "Strategy",
      body: "Every decision traces back to a clear position and a defined audience. Nothing is published without a reason.",
    },
    {
      title: "Creativity",
      body: "Editorial standards for every piece — considered writing, intentional visuals and a recognisable aesthetic.",
    },
    {
      title: "Cultural relevance",
      body: "We pay attention to the conversations shaping your field, so your voice adds to them rather than echoing them.",
    },
  ],
  commitments: [
    "Strategy before a single post",
    "One team across brand, marketing, search and technology",
    "Work built around you — not a template",
    "Honest conversations about what is and isn't working",
  ],
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
    index: "07",
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

export const contact = {
  intro: {
    index: hasClientVoices ? "08" : "07",
    eyebrow: "Contact",
    title: "Let's build something that outlasts the noise.",
    description:
      "Whether you are starting from scratch or refining an existing presence, we would like to hear what you are building. Tell us where you are today and where you want your brand to go.",
  } satisfies SectionIntro,
  /** Set to the real inbox, e.g. "hello@yourdomain.com". */
  email: null as string | null,
  /** Add real profiles, e.g. { label: "LinkedIn", href: "https://..." }. */
  socials: [] as SocialLink[],
  /** Used for the CTA while no email is configured. */
  fallbackCta: { label: "Get in touch", href: "/#contact" },
};
