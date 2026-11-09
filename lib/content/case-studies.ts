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
  headline: "Ideas built to shape perception.",
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
    "Engineered the public intellectual identity and keynote narrative for a technology founder. Positioned the founder at the center of the global conversation around human-machine cognition and future governance.",
  deliverables: [
    "Executive Narrative Architecture",
    "Keynote Positioning & Speechwriting",
    "Cinematic Video Monograph",
    "Bespoke Digital Aesthetic System",
  ],
  image: {
    src: "/images/work/featured.jpg",
    alt: "Aura & Influence — Frontier AI Founder Personal Brand",
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
      "A bi-monthly publication framework and long-form essay series for investors and operators.",
    deliverables: [
      "Editorial Publication Strategy",
      "Long-Form Essay Production",
      "Private Distribution Engine",
    ],
    image: {
      src: "/images/work/project-02.jpg",
      alt: "Vanguard Monograph — Thought Leadership Publication",
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
      "Sculpted a monolithic digital presence and visual language communicating quiet authority, timeless typography, and sharp intellectual clarity.",
    deliverables: [
      "Visual Identity System",
      "Custom Digital Experience",
      "Executive Brand Guidelines",
    ],
    image: {
      src: "/images/work/project-03.jpg",
      alt: "Cognition Capital — Identity & Positioning",
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
      "Multi-platform presence architecture utilizing proprietary AI research workflows to transform complex clinical breakthroughs into compelling cultural narrative.",
    deliverables: [
      "AI-Augmented Research Workflows",
      "Omnichannel Distribution",
      "Media Presence Direction",
    ],
    image: {
      src: "/images/work/project-01.jpg",
      alt: "The Synthesist — Executive Presence & AI",
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
      "Crafted an uncompromising, high-editorial visual monograph and exclusive press positioning celebrating architectural minimalism and material mastery.",
    deliverables: [
      "Monograph Publication",
      "Private Salon Series",
      "Press & Cultural Dialogue",
    ],
    image: {
      src: "/images/work/project-04.jpg",
      alt: "Atelier Noir — Founder Identity",
    },
  },
];

export const behindTheWork = {
  eyebrow: "BEHIND THE WORK",
  title: "The CULT.URE Methodology.",
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
  ctaText: "Initiate Inquiry",
  ctaHref: "/#contact",
};

