/**
 * CULT.URE — /services page copy (hero, process, FAQ, CTA).
 * Source of truth: client copy deck "CULTURE_Complete_Website_Copy_B2B.pdf" (03 / Services).
 * Disciplines, services and scope items live in lib/content/disciplines.ts.
 * No timelines, pricing, guarantees or results are stated: scope is defined per engagement.
 */

import { contact } from "./home";

export interface ProcessStage {
  number: string;
  name: string;
  tagline: string;
  summary: string;
  deliverables: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const servicesHero = {
  eyebrow: "SERVICES",
  /** "\n" separates the burgundy first line from the second. */
  headline: "The capabilities behind\na stronger market presence.",
  supportingCopy: [
    "A business does not need more disconnected marketing activity. It needs the right capabilities, applied to the right objectives.",
    "CULT.URE works primarily with B2B businesses across brand strategy, content, digital marketing and technology. Services can be commissioned individually or brought together around a wider business requirement.",
  ],
  sideLabel: "B2B MARKETING AGENCY",
  meta: [
    { label: "DISCIPLINES", value: "Brand Strategy · Content · Growth · Technology" },
    { label: "ENGAGEMENT", value: "Project-based or ongoing" },
    { label: "SCOPE", value: "Defined around the brief and objectives" },
  ],
};

export const servicesProcessIntro = {
  eyebrow: "[ 05 / OUR PROCESS ]",
  title: "A clear process. A defined scope.",
  titleAccent: "Work with purpose.",
  description:
    "Every engagement follows four stages. The depth and duration of each stage depend on the brief and the services involved.",
};

export const serviceProcess: ProcessStage[] = [
  {
    number: "01",
    name: "Discover",
    tagline: "Understand the context",
    summary: "Review the business, its market, existing activity and objectives before defining the work.",
    deliverables: ["Discovery discussion", "Business and channel assessment", "Audience and competitor review", "Agreed objectives"],
  },
  {
    number: "02",
    name: "Define",
    tagline: "Set the direction",
    summary: "Translate the findings into a practical plan with a defined scope, priorities and measures.",
    deliverables: ["Strategic recommendations", "Scope and deliverables", "Execution plan", "Measurement framework"],
  },
  {
    number: "03",
    name: "Create",
    tagline: "Develop and execute",
    summary:
      "Move from planning into the work itself, maintaining a consistent standard across communication, creative and implementation.",
    deliverables: ["Content and creative", "Campaign execution", "Digital development", "Technical implementation"],
  },
  {
    number: "04",
    name: "Evolve",
    tagline: "Review, refine and progress",
    summary: "Assess the work against its objectives, identify what needs to change and establish the next priorities.",
    deliverables: ["Performance reporting", "Analysis and recommendations", "Optimisation", "Next-stage planning"],
  },
];

export const servicesFaqIntro = {
  eyebrow: "[ 06 / FREQUENTLY ASKED QUESTIONS ]",
  title: "A few things worth knowing",
  titleAccent: "before we begin.",
};

export const servicesFaq: FaqItem[] = [
  {
    question: "What does CULT.URE do?",
    answer:
      "CULT.URE is a B2B-focused marketing agency helping businesses clarify their market position, communicate their expertise and build stronger relationships with relevant audiences and decision-makers. Its services span Brand Strategy & Communications, Content & Creative, Digital Marketing & Growth, and Technology & Automation.",
  },
  {
    question: "Does CULT.URE work with B2B businesses?",
    answer:
      "Yes. B2B businesses are the agency's primary focus. CULT.URE helps B2B organisations strengthen positioning, communicate complex offerings, build authority, reach relevant decision-makers and create more effective paths from market interest to qualified business conversations.",
  },
  {
    question: "What types of B2B businesses does CULT.URE work with?",
    answer:
      "CULT.URE is positioned to work with B2B companies and service-led organisations across different industries. The scope and approach are shaped around each business's market, audience, offering and objectives.",
  },
  {
    question: "Can a business engage CULT.URE for a single service?",
    answer:
      "Yes. Individual services can be commissioned independently. Where the brief calls for multiple capabilities, they can be brought together under a wider engagement.",
  },
  {
    question: "Does CULT.URE work with e-commerce businesses?",
    answer:
      "Yes. While B2B is the agency's primary focus, CULT.URE also undertakes e-commerce marketing and growth engagements where the business requirements align with its capabilities.",
  },
  {
    question: "Does CULT.URE work with founders and executives?",
    answer:
      "Yes. Personal Branding & Executive Positioning and Founder & Executive Ghostwriting support founders, executives and subject-matter experts who want to communicate their experience, expertise and perspective more effectively.",
  },
  {
    question: "How is the scope of work determined?",
    answer:
      "The scope is based on the business objective, the work required and the agreed deliverables. Recommendations and timelines are discussed before an engagement begins.",
  },
  {
    question: "What are GEO and AEO?",
    answer:
      "Generative Engine Optimisation (GEO) and Answer Engine Optimisation (AEO) concern how information about a business is understood and surfaced by AI-powered search and answer experiences. They complement SEO, which focuses on organic search visibility.",
  },
  {
    question: "Are deliverables fixed for every service?",
    answer:
      "No. The deliverables shown on the Services page are examples of the work that may be included. The final scope is tailored to the requirements of each engagement.",
  },
  {
    question: "How does an engagement begin?",
    answer:
      "It begins with a conversation about the business, its current position and what it needs to achieve. From there, the relevant services, scope and next steps can be established.",
  },
];

/** Shown under each service's scope list (from the FAQ answer on fixed deliverables). */
export const scopeNote = "The final scope is tailored to the requirements of each engagement.";

export const servicesCta = {
  eyebrow: "START AN ENQUIRY",
  headline: "Tell us what the business needs next.",
  lead: [
    "A clearer position. A stronger presence. A more effective marketing function. Or a digital system that makes the work easier.",
    "Start with the objective. The scope follows.",
  ],
  primaryAction: { label: "Start an enquiry", href: "/contact" },
  secondaryAction: { label: "Contact CULT.URE", href: contact.phone.href },
};
