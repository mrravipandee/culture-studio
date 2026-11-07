/**
 * CULT.URE — Services Content Model.
 *
 * All copy and structured data for /services are centralized here
 * for editorial agility and type safety.
 */

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  deliverables: string[];
  scope: string;
  image: {
    src: string;
    alt: string;
  };
}

export interface CapabilityGroup {
  number: string;
  category: string;
  headline: string;
  description: string;
  items: string[];
}

export interface ProcessStage {
  number: string;
  name: string;
  tagline: string;
  summary: string;
  timeline: string;
  deliverables: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export const servicesHero = {
  eyebrow: "OUR EXPERTISE",
  headline: "Strategy, creativity and culture.\nBuilt around your identity.",
  supportingCopy:
    "We help ambitious individuals and brands shape how they are seen, understood and remembered in a world saturated with ephemeral noise.",
  meta: [
    { label: "PRACTICE", value: "Executive Branding & Cultural Architecture" },
    { label: "MODEL", value: "Bespoke Studio Engagements" },
    { label: "TIMELINE", value: "Quarterly Cohort Basis" },
  ],
};

export const serviceList: ServiceItem[] = [
  {
    id: "personal-branding",
    number: "01",
    title: "Personal Branding",
    shortTitle: "Personal Branding",
    tagline: "Reputation Architecture & Public Identity",
    description:
      "Define the narrative, voice, positioning and public presence that make an individual recognizable. We elevate leaders from industry operators into definitive cultural voices whose perspective commands rooms.",
    deliverables: [
      "Narrative & Positioning Architecture",
      "Executive Voice & Tone Blueprint",
      "Comprehensive Presence Audit",
      "Multi-Channel Platform Strategy",
      "Keynote & Public Identity Guidelines",
    ],
    scope: "Founders, CEOs & Managing Partners",
    image: {
      src: "/images/services/personal-branding.jpg",
      alt: "CULT.URE Personal Branding Practice",
    },
  },
  {
    id: "content-strategy",
    number: "02",
    title: "Content Strategy & Creation",
    shortTitle: "Content Strategy",
    tagline: "Publication-Grade Media & Intellectual Assets",
    description:
      "Turn expertise into a consistent body of meaningful content. We engineer thought-leadership essays, video monographs, and publication channels that earn peer respect, institutional trust, and cultural relevance.",
    deliverables: [
      "Core Content Pillars & Theses",
      "Quarterly Editorial Calendar",
      "Long-Form Monograph Writing",
      "Cinematic Video Production",
      "Keynote Scripts & Media Distribution",
    ],
    scope: "Category Leaders & Pioneering Operators",
    image: {
      src: "/images/services/content-strategy.jpg",
      alt: "CULT.URE Content Strategy & Creation Practice",
    },
  },
  {
    id: "brand-identity",
    number: "03",
    title: "Brand Identity & Positioning",
    shortTitle: "Brand Identity",
    tagline: "Monolithic Visual Systems & Category Design",
    description:
      "Establish a clear identity and strategic position that differentiates a brand. From bespoke typography and digital flagship architecture to visual guidelines, every touchpoint communicates quiet authority.",
    deliverables: [
      "Category Design & Strategic Narrative",
      "Executive Messaging Matrix",
      "Visual Identity System & Typography",
      "Digital Flagship Web Architecture",
      "Comprehensive Brand Guidelines",
    ],
    scope: "Visionary Enterprises & Syndicate Leaders",
    image: {
      src: "/images/services/brand-identity.jpg",
      alt: "CULT.URE Brand Identity & Positioning Practice",
    },
  },
  {
    id: "ai-automation",
    number: "04",
    title: "AI Automation",
    shortTitle: "AI Automation",
    tagline: "Cognitive Pipelines & Scaled Distribution",
    description:
      "Identify repetitive processes and create intelligent workflows that support more efficient operations. We automate distribution friction and intelligence gathering while keeping taste, nuance, and core thinking purely human.",
    deliverables: [
      "Executive Workflow Analysis",
      "Automation Architecture Blueprint",
      "AI-Assisted Publishing Engines",
      "Cultural Sentiment & Listening Pipelines",
      "Cognitive Distribution Optimization",
    ],
    scope: "High-Volume Thinkers & Forward-Looking Studios",
    image: {
      src: "/images/services/ai-automation.jpg",
      alt: "CULT.URE AI Automation & Cognitive Systems Practice",
    },
  },
];

export const capabilities: CapabilityGroup[] = [
  {
    number: "01",
    category: "Narrative & Thought Leadership",
    headline: "Words designed to be cited, archived, and repeated.",
    description:
      "We strip away corporate jargon to unearth your proprietary worldview. Our writers craft monographs, keynote addresses, and manifesto texts with the rigor of premier literary and business publications.",
    items: [
      "Executive Narrative Architecture",
      "Keynote Speeches & Global Addresses",
      "Monograph-Grade Essays & Articles",
      "Strategic Op-Eds & Bylines",
      "Book Proposals & Manifestos",
    ],
  },
  {
    number: "02",
    category: "Visual Identity & Digital Flagships",
    headline: "Visual systems communicating quiet, undeniable authority.",
    description:
      "We reject disposable design trends. We build bespoke typographic systems, high-contrast layouts, and digital flagship platforms that stand as enduring digital monographs.",
    items: [
      "Bespoke Typographic Systems",
      "Digital Flagship Experience Design",
      "Art Direction & Monograph Design",
      "Comprehensive Brand Style Manuals",
      "Editorial Iconography & Signage",
    ],
  },
  {
    number: "03",
    category: "Media & Cinematic Video Production",
    headline: "Broadcast-grade production for modern cultural channels.",
    description:
      "In an era of disposable reels, cinematic craft is the ultimate differentiator. Our production unit directs high-fidelity portrait films, keynote series, and executive documentaries.",
    items: [
      "Cinematic Executive Mini-Docs",
      "Studio Broadcast Interviews",
      "Keynote Video Production",
      "Audio Essays & Private Podcasts",
      "Editorial Portrait Photography",
    ],
  },
  {
    number: "04",
    category: "Cognitive Systems & Distribution",
    headline: "Infinite operational leverage without compromising human discernment.",
    description:
      "We construct bespoke AI listening networks and autonomous distribution engines that amplify your ideas across global ecosystems without demanding your daily time.",
    items: [
      "Autonomous Multi-Platform Distribution",
      "Real-Time Cultural Sentiment Tracking",
      "Private Thought-Leadership Vaults",
      "Cross-Medium Asset Synthesizers",
      "Audience Network Telemetry",
    ],
  },
];

export const serviceProcess: ProcessStage[] = [
  {
    number: "01",
    name: "Discover",
    tagline: "Narrative Excavation & Archetype Diagnostic",
    summary:
      "We begin with exhaustive stakeholder interviews, worldview diagnostics, and competitive landscape audits to excavate what makes your thinking unrepeatable.",
    timeline: "Weeks 1 — 2",
    deliverables: [
      "Executive diagnostic interview",
      "Whitespace opportunity matrix",
      "Natural leadership archetype",
    ],
  },
  {
    number: "02",
    name: "Strategy",
    tagline: "Positioning Matrix & Category Narrative",
    summary:
      "We synthesize the findings into an airtight intellectual platform. We architect your core theses, proprietary vocabulary, and multi-channel publication strategy.",
    timeline: "Weeks 3 — 4",
    deliverables: [
      "Category design blueprint",
      "Core intellectual frameworks",
      "Platform allocation model",
    ],
  },
  {
    number: "03",
    name: "Create",
    tagline: "High-Craft Production & Monograph Launch",
    summary:
      "Our studio enters production: sculpting essays, directing cinematic film, refining typestyles, and preparing your digital presence for public debut.",
    timeline: "Weeks 5 — 8",
    deliverables: [
      "Monograph publications",
      "Cinematic film & keynote assets",
      "Digital flagship deployment",
    ],
  },
  {
    number: "04",
    name: "Evolve",
    tagline: "Compounding Authority & Autonomous Distribution",
    summary:
      "We deploy cognitive listening and distribution workflows, refining narrative vectors in real-time as your cultural capital and industry respect compound.",
    timeline: "Quarterly Continuum",
    deliverables: [
      "Autonomous distribution pipelines",
      "Sentiment monitoring telemetry",
      "Ongoing strategic advisory",
    ],
  },
];

export const servicesFaq: FaqItem[] = [
  {
    question: "What does CULT.URE specialize in?",
    answer:
      "CULT.URE is a specialized personal branding and cultural positioning agency. We engineer strategic narratives, high-craft editorial media, and cognitive automation systems for ambitious founders, executives, syndicate leaders, and creators who want to define their category.",
  },
  {
    question: "Who are these services for?",
    answer:
      "Our practice is designed for high-conviction leaders: venture capital partners, frontier technology founders (AI, robotics, biotech), corporate executives, and sovereign creators who recognize that personal reputation is their highest-leverage intellectual asset.",
  },
  {
    question: "How does a project begin?",
    answer:
      "Every engagement starts with an exploratory advisory conversation to evaluate strategic fit, goals, and timing. Once aligned, we initiate Phase 01 (Discover) with deep diagnostic interviews and narrative audits.",
  },
  {
    question: "What information is required?",
    answer:
      "We require access to your previous public work, core beliefs, strategic objectives, and roughly 4–6 hours of intimate interview time during the initial diagnostic phase. From there, our studio handles heavy narrative architecture and production.",
  },
  {
    question: "Can services be customized?",
    answer:
      "Yes. While our four core disciplines (Personal Branding, Content Strategy, Brand Identity, AI Automation) provide a structured foundation, every studio engagement is tailored to your unique objectives, timeline, and category dynamics.",
  },
];

export const servicesCta = {
  eyebrow: "INITIATE INQUIRY",
  headline: "Your next chapter starts with a conversation.",
  lead:
    "We partner with a selective cohort of leaders each quarter to maintain uncompromising editorial craft. Reach out to discuss positioning, availability, and alignment.",
  primaryAction: {
    label: "Start a Conversation",
    href: "#contact",
  },
  secondaryAction: {
    label: "Explore Case Studies",
    href: "/case-studies",
  },
};
