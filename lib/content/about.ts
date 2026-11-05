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
    "CULT.URE is a personal branding and cultural positioning agency for founders, executives, and innovators. We sit at the intersection of strategic narrative, high-craft editorial design, and cognitive automation — shaping reputations that outlive algorithms.",
  metadata: [
    { label: "PRACTICE", value: "Executive Branding & Cultural Positioning" },
    { label: "FOUNDED", value: "2026 — London / Global" },
    { label: "APPROACH", value: "Editorial Rigor × Cognitive AI" },
    { label: "MANDATE", value: "BEYOND THE NOISE. INTO THE CULTURE." },
  ],
  disciplines: [
    "Narrative Strategy",
    "Editorial Craft",
    "Cultural Resonance",
    "Cognitive Systems",
  ],
};

export const aboutPhilosophy: AboutPhilosophyData = {
  eyebrow: "OUR PHILOSOPHY",
  title: "A point of view is the only defensible asset in an age of automated noise.",
  intro:
    "When generative models can replicate endless volume, mere attention becomes a commodity. We construct brands anchored in deep conviction, timeless design, and cultural staying power.",
  statements: [
    {
      domain: "BRANDING",
      statement: "Reputation is not declared. It is earned through sustained coherence.",
      elaboration:
        "A leader’s brand is not a logo or a weekly LinkedIn post. It is the composite intellectual footprint left in every room, article, broadcast, and conversation.",
    },
    {
      domain: "CONTENT",
      statement: "Content without conviction is digital debris.",
      elaboration:
        "We reject algorithmic mimicry. We craft monographs, essays, and cinematic media designed to be cited by peers and preserved in archives.",
    },
    {
      domain: "CULTURE",
      statement: "Culture is the ultimate multiplier of enterprise value.",
      elaboration:
        "Markets follow cultural momentum. When a founder’s personal ethos enters the broader zeitgeist, organizational recruitment, investor appetite, and customer loyalty accelerate exponentially.",
    },
    {
      domain: "TECHNOLOGY & AI",
      statement: "Automate friction. Never automate human taste.",
      elaboration:
        "We utilize state-of-the-art cognitive workflows to scale distribution and eliminate operational bottlenecks, preserving raw discernment, emotion, and aesthetic taste.",
    },
  ],
};

export const aboutStory: AboutStoryData = {
  eyebrow: "OUR STORY",
  title: "Built to counter the homogenization of digital leadership.",
  lead:
    "CULT.URE was conceived as a deliberate alternative to conventional PR firms and formulaic social media agencies. We recognized that the world’s most formidable minds were being framed with cookie-cutter carousels and ghostwritten banalities.",
  purpose:
    "To transition high-conviction founders, operators, and thinkers from industry participants into respected cultural authorities who command category leadership.",
  vision:
    "A world where leadership discourse is elevated to an art form — combining rigorous substance with editorial gravitas.",
  editableNotice:
    "[ EDITABLE PRACTICE NOTE: Company origin narrative, specific founder background, and studio milestones can be tailored here without modifying design components. ]",
  milestones: [
    {
      phase: "Phase I",
      label: "The Diagnosis",
      description:
        "Observing the collapse of generic social marketing and the rise of personal authority as the primary driver of institutional trust.",
    },
    {
      phase: "Phase II",
      label: "The Methodology",
      description:
        "Synthesizing publishing house editorial standards with venture-scale narrative architecture and modern distribution mechanics.",
    },
    {
      phase: "Phase III",
      label: "The Studio Today",
      description:
        "Partnering with a selective roster of leaders across venture capital, deep tech, luxury, and philosophy to sculpt definitive global voices.",
    },
  ],
};

export const aboutPerspective: AboutPerspectiveData = {
  eyebrow: "OUR PERSPECTIVE",
  title: "How we navigate the modern landscape of public perception.",
  lead:
    "Modern influence requires an acute understanding of how human psychology, platform algorithms, and artistic expression converge.",
  pillars: [
    {
      number: "01",
      title: "Personal Branding",
      subtitle: "Intellectual Equity over Vanity Metrics",
      description:
        "Follower counts are volatile; intellectual authority is permanent. We establish proprietary frameworks and concepts that your industry associates indelibly with your name.",
      takeaway: "Authority generates inbound opportunity without cold pursuit.",
    },
    {
      number: "02",
      title: "Digital Culture",
      subtitle: "Navigating Algorithmic Tribalism",
      description:
        "Digital feeds reward polarized superficiality unless an identity is anchored in authentic cultural resonance. We position leaders above trend cycles so their perspective shapes the room.",
      takeaway: "Set the conversation instead of reacting to it.",
    },
    {
      number: "03",
      title: "Creative Communication",
      subtitle: "Editorial Rigor as a Differentiator",
      description:
        "Every touchpoint must reflect uncompromising craftsmanship. From typography and color temperature to syntactic cadence, we apply the standards of premier art publications.",
      takeaway: "Taste cannot be simulated; it must be practiced.",
    },
    {
      number: "04",
      title: "AI & Automation",
      subtitle: "Amplifying Reach While Preserving Nuance",
      description:
        "We harness generative AI and bespoke automation pipelines as leverage engines. They liberate leaders from production drudgery while keeping the central vision purely human.",
      takeaway: "Scale distribution to infinity without sacrificing depth.",
    },
  ],
};

export const aboutApproach: AboutApproachData = {
  eyebrow: "OUR APPROACH",
  title: "A four-stage continuum from hidden brilliance to category authority.",
  lead:
    "We don’t begin with content creation; we begin with cognitive clarity. Every engagement follows a disciplined architectural progression.",
  steps: [
    {
      step: "01",
      name: "Understand",
      tagline: "Excavating the core ethos",
      description:
        "We conduct comprehensive narrative audits, worldview interviews, and audience ecosystem mapping to identify your unrepeatable perspective and natural leadership archetype.",
      deliverables: [
        "Executive narrative audit",
        "Worldview & thesis extraction",
        "Audience & whitespace analysis",
        "Platform equity benchmark",
      ],
    },
    {
      step: "02",
      name: "Strategize",
      tagline: "Architecting the intellectual platform",
      description:
        "We define the core theses, editorial pillars, and publication rhythms that will anchor your public presence across digital, print, and speaking mediums.",
      deliverables: [
        "Proprietary framework design",
        "Editorial positioning playbook",
        "Multi-channel distribution architecture",
        "Network amplification blueprint",
      ],
    },
    {
      step: "03",
      name: "Create",
      tagline: "Execution with editorial precision",
      description:
        "Our studio directs and produces bespoke essays, video monographs, visual identities, and monograph publications designed to rival premier publications.",
      deliverables: [
        "Monograph-grade articles & essays",
        "Cinematic video & keynotes",
        "Visual identity & typestyles",
        "Bespoke digital presence assets",
      ],
    },
    {
      step: "04",
      name: "Evolve",
      tagline: "Sustained compounding & cultural iteration",
      description:
        "We install autonomous listening and scheduling systems to analyze resonance, refine positioning, and compound your reputation across quarters and years.",
      deliverables: [
        "Cognitive distribution automation",
        "Cultural sentiment tracking",
        "Iterative positioning refinement",
        "Category authority compounding",
      ],
    },
  ],
};

export const aboutPrinciples: AboutPrinciplesData = {
  eyebrow: "OUR PRINCIPLES",
  title: "The standards that govern every word, frame, and engagement.",
  lead:
    "These four convictions dictate how we select partners, craft narratives, and judge the enduring value of our work.",
  items: [
    {
      number: "I",
      title: "Clarity over noise.",
      summary: "In a world of endless broadcasting, precise thinking is the ultimate magnet.",
      detail:
        "We strip away jargon, filler, and performative posturing. We say what is true, in the fewest and most incisive words possible.",
    },
    {
      number: "II",
      title: "Meaning over attention.",
      summary: "Virality is transient; intellectual respect is enduring.",
      detail:
        "We do not optimize for cheap clicks that evaporate tomorrow. We optimize for the deep respect of peers, institutional investors, and discerning clients.",
    },
    {
      number: "III",
      title: "Strategy before execution.",
      summary: "Publishing without strategy is just expensive noise.",
      detail:
        "We never produce a video, draft an essay, or publish an opinion until the foundational strategic outcome and positioning thesis are airtight.",
    },
    {
      number: "IV",
      title: "Creativity with purpose.",
      summary: "Aesthetic excellence in service of undeniable influence.",
      detail:
        "Every typographic selection, layout choice, and cinematic cut exists to elevate the authority of your ideas, not to display design self-indulgence.",
    },
  ],
};

export const aboutCta: AboutCtaData = {
  eyebrow: "INITIATE A CONVERSATION",
  headline: "Let's build something that matters.",
  lead:
    "We partner with a limited cohort of founders, executives, and pioneers each quarter. If you are ready to define your category and lead the cultural conversation, we welcome your inquiry.",
  primaryAction: {
    label: "Start an Inquiry",
    href: "#contact",
  },
  secondaryAction: {
    label: "Explore Selected Work",
    href: "/case-studies",
  },
};
