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
    "Most brands are built for the feed: loud, frequent and easy to forget. A brand earns its place differently, by standing for something clear and saying it consistently, on the channels and in the moments that matter.",
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
      body: "The strongest brands are built on real expertise, presented well, rather than on volume or borrowed trends.",
    },
  ],
  value: {
    title: "Why it has to work as one",
    body: "People choose brands they recognise and trust. When strategy, creative and technology point in the same direction, every channel (search, social, email and the website) reinforces the same idea instead of competing for attention.",
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
    title: "Marketing, brand and technology services that work as one.",
    description:
      "Nine services in four disciplines, from personal branding and social media marketing to SEO, websites and AI automation. Use one, or combine them in a single plan.",
  } satisfies SectionIntro,
  /** Services themselves live in lib/content/service-catalog.ts. */
  cta: { label: "Explore all nine services", href: "/services" },
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
    title: "Selected work",
    description:
      "Sample projects that show how our services combine. Confirmed client case studies will replace them as they are published.",
  } satisfies SectionIntro,
  cta: { label: "View all case studies", href: "/case-studies" },
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
    index: "04",
    eyebrow: "Process",
    title: "From first conversation to measurable progress.",
    description:
      "The same four stages apply whether you work with us on one service or several.",
  } satisfies SectionIntro,
  steps: [
    {
      title: "Discover",
      tagline: "Understand the starting point",
      body: "We learn about your business, audience, channels and competitors, and agree what success should look like.",
      deliverables: ["Discovery conversation", "Channel review", "Agreed objectives"],
    },
    {
      title: "Define",
      tagline: "Decide the plan",
      body: "We recommend the services, priorities and measures that fit your goals, and leave out what does not.",
      deliverables: ["Recommended scope", "Channel priorities", "Measurement plan"],
    },
    {
      title: "Create",
      tagline: "Design, build and launch",
      body: "Creative, content, campaigns and technology are produced together, so each part supports the others.",
      deliverables: ["Creative and content", "Campaigns and websites", "Automations"],
    },
    {
      title: "Evolve",
      tagline: "Measure and improve",
      body: "We report clearly, learn from the results and refine the plan as the work continues.",
      deliverables: ["Reporting", "Optimisation", "Next steps"],
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
    title: "Strategy, creative and technology in one team.",
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
      body: "Editorial standards for every piece: considered writing, intentional visuals and a recognisable aesthetic.",
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
      "Tell us where your brand is today, what you want to achieve and which services interest you. If you are not sure yet, choose \"Not sure yet\" and we will help you decide where to start.",
  } satisfies SectionIntro,
  /** Set to the real inbox, e.g. "hello@yourdomain.com". */
  email: null as string | null,
  /** Add real profiles, e.g. { label: "LinkedIn", href: "https://..." }. */
  socials: [] as SocialLink[],
  /** Used for the CTA while no email is configured. */
  fallbackCta: { label: "Get in touch", href: "/#contact" },
};
