export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  clientType: string;
  category: string;
  year: string;
  description: string;
  deliverables: string[];
  image: {
    src: string;
    alt: string;
  };
  featured?: boolean;
}

export const caseStudiesHero = {
  eyebrow: "SELECTED WORK",
  headline: "Ideas built to shape perception.",
  description:
    "A curated archive of personal branding engagements, executive monographs, and cultural positioning architectures for leaders defining their industry.",
  meta: [
    { label: "PRACTICE", value: "GLOBAL EXECUTIVE" },
    { label: "FOCUS", value: "PERSONAL BRAND ARCHITECTURE" },
    { label: "TIMELINE", value: "2024 — 2026" },
  ],
};

export const featuredProject: CaseStudy = {
  id: "featured-aura",
  slug: "aura-and-influence",
  title: "Aura & Influence",
  clientType: "Frontier AI & Robotics Founder",
  category: "Personal Branding & Cultural Positioning",
  year: "2026",
  description:
    "Engineered the public intellectual identity and keynote narrative for a Series-B AI pioneer. Positioned the founder at the center of the global conversation around human-machine cognition and future governance.",
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
    slug: "vanguard-monograph",
    title: "Vanguard Monograph",
    clientType: "Venture Capital Managing Partner",
    category: "Content Strategy & Creation",
    year: "2025",
    description:
      "A bi-monthly publication framework and long-form essay series read by over 4.5M investors, operators, and cultural gatekeepers.",
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
    slug: "cognition-capital",
    title: "Cognition Capital",
    clientType: "Deep Tech Syndicate Leader",
    category: "Brand Identity & Positioning",
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
    slug: "the-synthesist",
    title: "The Synthesist",
    clientType: "Biotech & Longevity Chair",
    category: "Executive Presence & AI",
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
    slug: "atelier-noir",
    title: "Atelier Noir",
    clientType: "Luxury Design & Architecture Director",
    category: "Founder Identity",
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
    "How we approach narrative architecture, aesthetic resonance, and cultural authority for defining leaders.",
  pillars: [
    {
      index: "01",
      name: "Strategic Precision",
      tagline: "Unearthing the unborrowed perspective.",
      body: "We conduct exhaustive audits of your existing footprint, industry whitespace, and internal convictions. Before creating a single asset, we define the singular thesis that sets you entirely apart.",
    },
    {
      index: "02",
      name: "Creative Direction",
      tagline: "Editorial craft at museum grade.",
      body: "We treat personal brands like luxury fashion houses and literary publications. From typography and custom photography to cinematic video, every artifact looks deliberate, elevated, and timeless.",
    },
    {
      index: "03",
      name: "Content Engine",
      tagline: "Conviction over feed volume.",
      body: "We reject synthetic social churn. We plan, write, and direct high-signal pieces designed to spark industry debate, earn organic peer citation, and resonate with decision-makers.",
    },
    {
      index: "04",
      name: "Cognition & Systems",
      tagline: "Automate execution, preserve humanity.",
      body: "We architect intelligent AI automation pipelines that eliminate repetitive friction across research, transcription, and multi-channel distribution—freeing you to focus purely on vision.",
    },
  ],
};

export const caseStudiesCta = {
  eyebrow: "NEXT STEPS",
  headline: "Ready to define your category?",
  description:
    "We partner with a limited number of founders, executives, and category leaders each quarter to ensure rigorous focus and museum-grade execution.",
  ctaText: "Initiate Inquiry",
  ctaHref: "/services#contact",
};

