/**
 * CULT.URE — About Page Content Model.
 *
 * All copy is centralized here to allow editorial updates without altering UI architecture.
 * Missing or pending founder/team narratives are clearly marked as editable placeholders.
 */

export interface AboutHeroData {
  eyebrow: string;
  headline: string;
  lead: string;
  metadata: Array<{ label: string; value: string }>;
  disciplines: string[];
}

export interface PhilosophyStatement {
  domain: string;
  statement: string;
  elaboration: string;
}

export interface AboutPhilosophyData {
  eyebrow: string;
  title: string;
  intro: string;
  statements: PhilosophyStatement[];
}

export interface AboutStoryData {
  eyebrow: string;
  title: string;
  lead: string;
  purpose: string;
  vision: string;
  editableNotice: string;
  milestones: Array<{
    phase: string;
    label: string;
    description: string;
  }>;
}

export interface PerspectivePillar {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  takeaway: string;
}

export interface AboutPerspectiveData {
  eyebrow: string;
  title: string;
  lead: string;
  pillars: PerspectivePillar[];
}

export interface ApproachStep {
  step: string;
  name: string;
  tagline: string;
  description: string;
  deliverables: string[];
}

export interface AboutApproachData {
  eyebrow: string;
  title: string;
  lead: string;
  steps: ApproachStep[];
}

export interface PrincipleItem {
  number: string;
  title: string;
  summary: string;
  detail: string;
}

export interface AboutPrinciplesData {
  eyebrow: string;
  title: string;
  lead: string;
  items: PrincipleItem[];
}

export interface AboutCtaData {
  eyebrow: string;
  headline: string;
  lead: string;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction: {
    label: string;
    href: string;
  };
}

export const aboutHero: AboutHeroData = {
  eyebrow: "ABOUT CULT.URE",
  headline: "We believe brands should mean something.",
  lead:
    "CULT.URE is a digital growth, marketing and creative agency. We bring brand strategy, marketing, search and technology together, so brands are clear about what they stand for, visible where their audience looks, and built on systems that support growth.",
  metadata: [
    { label: "PRACTICE", value: "Digital growth, marketing & creative" },
    { label: "DISCIPLINES", value: "Brand · Growth · Search · Technology" },
    { label: "SERVICES", value: "Nine, delivered individually or together" },
    { label: "TAGLINE", value: "BEYOND THE NOISE. INTO THE CULTURE." },
  ],
  disciplines: [
    "Brand & Presence",
    "Digital Marketing & Growth",
    "Search & Customer Engagement",
    "Technology & Experience",
  ],
};

export const aboutPhilosophy: AboutPhilosophyData = {
  eyebrow: "OUR PHILOSOPHY",
  title: "Attention is easy to buy. Recognition has to be built.",
  intro:
    "Any brand can be loud for a moment. The ones people remember are clear about who they are, consistent in how they show up, and supported by systems that keep the work moving.",
  statements: [
    {
      domain: "BRAND BUILDING",
      statement: "A brand is what people repeat, not what it says.",
      elaboration:
        "We start with positioning and voice, so every campaign, page and post adds to the same idea instead of starting from zero.",
    },
    {
      domain: "MARKETING & GROWTH",
      statement: "Growth comes from the right message in the right channel.",
      elaboration:
        "Social, paid, search, email and commerce each play a different role. We plan them together and measure them against clear goals.",
    },
    {
      domain: "CREATIVE COMMUNICATION",
      statement: "Craft is how a brand earns attention it did not pay for.",
      elaboration:
        "Considered writing, design and visual direction make communication worth noticing and easier to trust.",
    },
    {
      domain: "TECHNOLOGY",
      statement: "Automate the process. Never the perspective.",
      elaboration:
        "Websites, automation and AI tools should remove friction and repetitive work, so people can spend their time on strategy and creativity.",
    },
  ],
};

export const aboutStory: AboutStoryData = {
  eyebrow: "WHY CULT.URE",
  title: "One agency for the brand, the growth and the systems behind them.",
  lead:
    "Brand, marketing and technology are often handled by separate teams that rarely talk to each other. CULT.URE brings them into one plan, so positioning, campaigns, search, websites and automation support the same goals.",
  purpose:
    "To help brands and the people behind them become clear, visible and easy to choose, through strategy, creative and technology that work together.",
  vision:
    "Brands that stand for something, show up consistently, and grow without adding noise.",
  /** Optional note shown in the story section. Add confirmed company history, founder or team details here. */
  editableNotice: "",
  milestones: [
    {
      phase: "Strategy",
      label: "Clarity first",
      description:
        "Positioning, audience and objectives are defined before any channel or tool is chosen.",
    },
    {
      phase: "Creative",
      label: "Communication with craft",
      description:
        "Content, design, campaigns and PR express that position consistently across every touchpoint.",
    },
    {
      phase: "Technology",
      label: "Systems that scale",
      description:
        "Websites, search, lifecycle communication and automation turn attention into lasting growth.",
    },
  ],
};

export const aboutPerspective: AboutPerspectiveData = {
  eyebrow: "WHAT WE DO",
  title: "Four disciplines, connected by one approach.",
  lead:
    "Our nine services are organised into four disciplines. Each one solves a different part of the same problem: helping a brand be understood, found and chosen.",
  pillars: [
    {
      number: "01",
      title: "Brand & Presence",
      subtitle: "Personal Branding & LinkedIn Marketing · PR & Event Marketing",
      description:
        "Shaping how a brand and the people behind it are seen: in feeds, in the press and in person.",
      takeaway: "Recognition starts with a clear position.",
    },
    {
      number: "02",
      title: "Digital Marketing & Growth",
      subtitle: "Social Media Marketing · Performance & Growth Marketing · E-commerce Marketing & Growth",
      description:
        "Content, paid media and commerce connected to clear objectives and measured honestly.",
      takeaway: "Attention only matters when it moves people to act.",
    },
    {
      number: "03",
      title: "Search & Customer Engagement",
      subtitle: "SEO, GEO & AEO · Email & Lifecycle Marketing",
      description:
        "Being found in search and AI answers, then staying relevant through owned communication.",
      takeaway: "Discovery and loyalty are one relationship.",
    },
    {
      number: "04",
      title: "Technology & Experience",
      subtitle: "Website Design & Development · AI & Business Automation",
      description:
        "The websites and automated systems that every other discipline depends on.",
      takeaway: "Strong marketing needs strong foundations.",
    },
  ],
};

export const aboutApproach: AboutApproachData = {
  eyebrow: "OUR APPROACH",
  title: "How the disciplines come together.",
  lead:
    "Whether a project uses one service or several, it follows the same sequence.",
  steps: [
    {
      step: "01",
      name: "Understand",
      tagline: "Where the brand stands today",
      description:
        "We learn about the business, audience, channels and competitors, and agree what success should look like.",
      deliverables: ["Discovery conversation", "Channel review", "Agreed objectives"],
    },
    {
      step: "02",
      name: "Strategize",
      tagline: "What to do, and in what order",
      description:
        "We recommend the services, priorities and measures that fit the objectives, and nothing that does not.",
      deliverables: ["Recommended scope", "Channel priorities", "Measurement plan"],
    },
    {
      step: "03",
      name: "Create",
      tagline: "Design, build and launch",
      description:
        "Creative, campaigns, content and technology are produced together so each part supports the others.",
      deliverables: ["Creative and content", "Campaigns and websites", "Automations"],
    },
    {
      step: "04",
      name: "Evolve",
      tagline: "Measure and improve",
      description:
        "We report clearly, learn from the results and refine the plan over time.",
      deliverables: ["Reporting", "Optimisation", "Next steps"],
    },
  ],
};

export const aboutPrinciples: AboutPrinciplesData = {
  eyebrow: "OUR PRINCIPLES",
  title: "The standards behind every engagement.",
  lead: "Four convictions guide how we plan, create and judge our work.",
  items: [
    {
      number: "I",
      title: "Clarity over noise.",
      summary: "Clear thinking travels further than volume.",
      detail: "We remove jargon and filler and say what is true in as few words as possible.",
    },
    {
      number: "II",
      title: "Meaning over attention.",
      summary: "Short-term clicks are not the goal; lasting recognition is.",
      detail: "We judge work by whether it builds trust and moves the business forward, not by vanity metrics.",
    },
    {
      number: "III",
      title: "Strategy before execution.",
      summary: "Publishing without a plan is expensive noise.",
      detail: "Every channel, campaign and tool is chosen for a reason that traces back to the objectives.",
    },
    {
      number: "IV",
      title: "Creativity with purpose.",
      summary: "Craft that serves the message.",
      detail: "Design, writing and technology are held to a high standard because they shape how a brand is perceived.",
    },
  ],
};

export const aboutCta: AboutCtaData = {
  eyebrow: "START AN INQUIRY",
  headline: "Tell us what you want to build.",
  lead:
    "Share where your brand is today and which services interest you. If you are not sure yet, we will help you decide where to start.",
  primaryAction: {
    label: "Start an inquiry",
    href: "/#contact",
  },
  secondaryAction: {
    label: "Explore our services",
    href: "/services",
  },
};
