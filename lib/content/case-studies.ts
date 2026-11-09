import type { ServiceId } from "./service-catalog";

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  clientType: string;
  year: string;
  description: string;
  deliverables: string[];
  image: {
    src: string;
    alt: string;
  };
  featured?: boolean;
  /** Official services involved (one or more). */
  services: ServiceId[];
  /**
   * true = sample entry kept for layout until real, approved project
   * information is supplied. Rendered with a visible "Sample project" label.
   */
  placeholder: boolean;
}

export const caseStudiesHero = {
  eyebrow: "SELECTED WORK",
  headline: "Case studies across brand, marketing and technology.",
  description:
    "Selected projects across brand, marketing, search and technology. Each entry lists the services involved.",
  meta: [
    { label: "PRACTICE", value: "DIGITAL GROWTH, MARKETING & CREATIVE" },
    { label: "DISCIPLINES", value: "BRAND · GROWTH · SEARCH · TECHNOLOGY" },
  ],
};

export const featuredProject: CaseStudy = {
  id: "featured-aura",
    services: ["personal-branding-linkedin-marketing"],
    placeholder: true,
  slug: "aura-and-influence",
  title: "Aura & Influence",
  clientType: "Frontier AI & Robotics Founder",
  year: "2026",
  description:
    "Public positioning and keynote narrative for a technology founder.",
  deliverables: [
    "Positioning and narrative",
    "Keynote and speech writing",
    "Video content",
    "Visual identity system",
  ],
  image: {
    src: "/images/work/featured.jpg",
    alt: "Man in a dark suit fastening his jacket button",
  },
  featured: true,
};

export const caseStudiesList: CaseStudy[] = [
  {
    id: "cs-01",
    services: ["social-media-marketing"],
    placeholder: true,
    slug: "vanguard-monograph",
    title: "Vanguard Monograph",
    clientType: "Venture Capital Managing Partner",
    year: "2025",
    description:
      "A bi-monthly publication and long-form essay series for investors and operators.",
    deliverables: [
      "Editorial strategy",
      "Long-form essay production",
      "Distribution plan",
    ],
    image: {
      src: "/images/work/project-02.jpg",
      alt: "Smiling woman wearing a crown of red and pink flowers",
    },
  },
  {
    id: "cs-02",
    services: ["personal-branding-linkedin-marketing", "website-design-development"],
    placeholder: true,
    slug: "cognition-capital",
    title: "Cognition Capital",
    clientType: "Deep Tech Syndicate Leader",
    year: "2025",
    description:
      "A digital presence and visual language built on clarity, considered typography and restraint.",
    deliverables: [
      "Visual identity",
      "Website design and development",
      "Brand guidelines",
    ],
    image: {
      src: "/images/work/project-03.jpg",
      alt: "Glass office towers seen from street level",
    },
  },
  {
    id: "cs-03",
    services: ["personal-branding-linkedin-marketing", "ai-business-automation"],
    placeholder: true,
    slug: "the-synthesist",
    title: "The Synthesist",
    clientType: "Biotech & Longevity Chair",
    year: "2026",
    description:
      "A multi-platform presence supported by AI-assisted research workflows that turn complex clinical work into clear stories.",
    deliverables: [
      "AI-assisted research workflows",
      "Multi-platform distribution",
      "Content direction",
    ],
    image: {
      src: "/images/work/project-01.jpg",
      alt: "Portrait of a man in a grey sweater against a blue-grey backdrop",
    },
  },
  {
    id: "cs-04",
    services: ["personal-branding-linkedin-marketing", "pr-event-marketing"],
    placeholder: true,
    slug: "atelier-noir",
    title: "Atelier Noir",
    clientType: "Luxury Design & Architecture Director",
    year: "2024",
    description:
      "A visual monograph and press positioning for an architecture and design practice.",
    deliverables: [
      "Visual monograph",
      "Event series",
      "Press materials and outreach",
    ],
    image: {
      src: "/images/work/project-04.jpg",
      alt: "Bright workspace with a laptop beside tall windows",
    },
  },
];

export const behindTheWork = {
  eyebrow: "BEHIND THE WORK",
  title: "How we approach every project.",
  description:
    "How we approach strategy, creative, growth and technology on every project.",
  pillars: [
    {
      index: "01",
      name: "Strategic Precision",
      tagline: "Clarity before activity.",
      body: "Before creating anything, we review the brand, audience, channels and competitors, and agree what the work needs to achieve.",
    },
    {
      index: "02",
      name: "Creative Direction",
      tagline: "Craft that serves the message.",
      body: "Typography, photography, video and writing are directed so every touchpoint looks deliberate and consistent with the brand.",
    },
    {
      index: "03",
      name: "Marketing & Growth",
      tagline: "The right message in the right channel.",
      body: "Social, search, email, paid media and commerce are planned together and measured against clear objectives.",
    },
    {
      index: "04",
      name: "Technology & Systems",
      tagline: "Automate the process, never the perspective.",
      body: "Websites, automation and AI tools remove repetitive work so more time goes to strategy and creativity.",
    },
  ],
};

export const caseStudiesCta = {
  eyebrow: "NEXT STEPS",
  headline: "Ready to grow beyond the noise?",
  description:
    "Tell us where your brand is today and which services interest you. If you are not sure yet, we will help you decide where to start.",
  ctaText: "Start an inquiry",
  ctaHref: "/#contact",
};

