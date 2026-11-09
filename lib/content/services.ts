/**
 * CULT.URE — /services page copy (hero, process, FAQ, CTA).
 * The nine services themselves live in lib/content/service-catalog.ts.
 * No timelines, pricing, guarantees or results are stated: scope is agreed per engagement.
 */

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
  eyebrow: "SERVICES",
  headline: "Strategy, creative and technology.\nBuilt to move brands forward.",
  supportingCopy:
    "CULT.URE is a digital growth, marketing and creative agency. Nine services across four disciplines, planned together so every channel works in the same direction.",
  meta: [
    { label: "DISCIPLINES", value: "Brand · Growth · Search · Technology" },
    { label: "SERVICES", value: "Nine, delivered individually or together" },
    { label: "SCOPE", value: "Agreed per engagement" },
  ],
};

export const serviceProcess: ProcessStage[] = [
  {
    number: "01",
    name: "Discover",
    tagline: "Understand the brand, audience and goals",
    summary:
      "We start by learning where the brand stands today: its audience, channels, competitors and what the business needs to achieve.",
    timeline: "Start",
    deliverables: ["Discovery conversation", "Review of current channels", "Agreed objectives"],
  },
  {
    number: "02",
    name: "Strategy",
    tagline: "Decide what to do, and what not to do",
    summary:
      "We turn what we learn into a clear plan: which services are needed, in what order, and how success will be measured.",
    timeline: "Plan",
    deliverables: ["Recommended services and scope", "Channel and content priorities", "Measurement plan"],
  },
  {
    number: "03",
    name: "Create",
    tagline: "Design, build and launch",
    summary:
      "Creative, content, campaigns and technology are produced and launched together, so each piece supports the others.",
    timeline: "Deliver",
    deliverables: ["Creative and content", "Campaigns and websites", "Automations and integrations"],
  },
  {
    number: "04",
    name: "Evolve",
    tagline: "Measure, learn and improve",
    summary:
      "We review what is working, report clearly and adjust the plan, so the work keeps improving after launch.",
    timeline: "Improve",
    deliverables: ["Reporting", "Optimisation", "Next-step recommendations"],
  },
];

export const servicesFaq: FaqItem[] = [
  {
    question: "What does CULT.URE do?",
    answer:
      "CULT.URE is a digital growth, marketing and creative agency. We offer nine services across four disciplines: Brand & Presence, Digital Marketing & Growth, Search & Customer Engagement, and Technology & Experience.",
  },
  {
    question: "Can I work with you on a single service?",
    answer:
      "Yes. Each service can be delivered on its own, or combined with others when a project needs more than one discipline.",
  },
  {
    question: "How does a project begin?",
    answer:
      "Every engagement starts with a conversation about your goals, current situation and timing. From there we recommend the services and scope that fit.",
  },
  {
    question: "What if I am not sure which service I need?",
    answer:
      "Choose \"Not sure yet\" in the inquiry form and tell us what you are trying to achieve. We will suggest where to start.",
  },
  {
    question: "Are deliverables fixed?",
    answer:
      "No. The deliverables listed for each service are typical examples. The actual scope is agreed for each engagement.",
  },
];

export const servicesCta = {
  eyebrow: "START AN INQUIRY",
  headline: "Tell us what you want to grow.",
  lead:
    "Share where your brand is today and which services interest you. If you are not sure yet, that is a good place to start the conversation.",
  primaryAction: { label: "Start an inquiry", href: "/#contact" },
  secondaryAction: { label: "Explore case studies", href: "/case-studies" },
};
