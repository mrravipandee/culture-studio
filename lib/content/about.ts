/**
 * CULT.URE — About page content.
 *
 * Source of truth: client copy deck "CULTURE_Complete_Website_Copy_B2B.pdf" (02 / About Us).
 * Sections follow the PDF order: Hero, Our Approach, Our Philosophy, Why CULT.URE
 * (Purpose, Vision, How It Connects, In Practice), What CULT.URE Does, Our Principles,
 * Start a Conversation.
 *
 * No company history, founder or team details, statistics or testimonials: none are
 * provided in the copy deck. Add confirmed details here only once supplied.
 */

import { disciplineHref, disciplines } from "./disciplines";

export const aboutHero = {
  eyebrow: "ABOUT CULT.URE",
  strapline: "B2B MARKETING AGENCY",
  motto: "CONTENT × CULTURE × COGNITION",
  /** Rendered as two lines; the second is set in burgundy. */
  headline: ["Good businesses have a story.", "The market needs to understand it."],
  lead: [
    "CULT.URE is a B2B-focused marketing agency working with businesses to shape how they are positioned, perceived and remembered.",
    "The practice brings together brand strategy, communications, content, digital marketing and technology. The focus is on making business expertise easier to recognise, giving brands a more distinctive voice and connecting marketing activity to meaningful commercial objectives.",
  ],
  /** The four service disciplines (exact names). */
  disciplines: disciplines.map((d) => d.name),
  image: {
    src: "/images/hero/detail.jpg",
    alt: "Gallery wall of framed prints on white shelves",
  },
};

export const aboutApproach = {
  eyebrow: "OUR APPROACH",
  title: "Marketing requires more than good execution.",
  lead: [
    "A campaign can attract attention. A well-designed website can make a strong first impression. A consistent content programme can build familiarity. But none of these works as well as it should when the thinking behind it is unclear.",
    "CULT.URE approaches marketing as a connected business function: understanding the market, defining the message, choosing the right channels and executing with purpose.",
  ],
  cards: [
    { label: "Practice", text: "Brand strategy, communications, marketing and technology." },
    {
      label: "Focus",
      text: "B2B businesses and service-led organisations, with additional work across e-commerce and executive positioning.",
    },
    { label: "Engagement", text: "Individual projects or connected, ongoing support." },
    { label: "Principle", text: "Beyond the noise. Into the culture." },
  ],
};

export const aboutPhilosophy = {
  eyebrow: "OUR PHILOSOPHY",
  title: "Recognition is not a media plan. It is the result of everything a brand does.",
  intro: [
    "A business is understood through more than its advertising. Its reputation, language, visual identity, expertise, customer experience and public presence all influence the way it is perceived.",
    "That is why marketing cannot be reduced to a publishing schedule or a collection of campaigns. It needs a point of view and a consistent standard of execution.",
  ],
  statements: [
    {
      domain: "BRAND STRATEGY",
      statement: "A position worth recognising.",
      elaboration:
        "A clear position gives a business a reason to be considered. It defines what the business stands for, the audiences it serves and the distinction it brings to the market.",
    },
    {
      domain: "COMMUNICATION",
      statement: "A message worth understanding.",
      elaboration:
        "Expertise has little commercial value if it cannot be communicated clearly. The language, content and creative expression of a business should make its value easier to understand.",
    },
    {
      domain: "MARKETING",
      statement: "A presence built with purpose.",
      elaboration:
        "The right channels bring a business into relevant conversations. Strategy determines where to show up, what to say and how to turn attention into meaningful engagement.",
    },
    {
      domain: "TECHNOLOGY",
      statement: "Systems that support the work.",
      elaboration:
        "Digital platforms, automation and AI can make marketing more efficient and business processes more connected. Their value lies in how well they solve a real problem.",
    },
  ],
};

export const aboutStory = {
  eyebrow: "WHY CULT.URE",
  title: "The brand, the communication and the business objective belong in the same conversation.",
  lead: [
    "Marketing often becomes fragmented. Brand decisions are made separately from campaign decisions. Content is produced without a wider communication strategy. Technology is introduced without a clear operational purpose.",
    "CULT.URE takes a connected view. The objective is not to add more activity to an already crowded marketing environment. It is to make the existing effort more coherent, more considered and more useful to the business.",
  ],
  purpose:
    "To help B2B businesses communicate their value with greater clarity, build stronger market recognition and make more of their marketing efforts.",
  vision:
    "A business landscape where good work is recognised, expertise is communicated with substance and brands build relevance beyond short-lived attention.",
  /** Optional note shown in the story section. Add confirmed company history, founder or team details here. */
  editableNotice: "",
  /** "How It Connects". */
  milestones: [
    {
      phase: "Strategy",
      label: "Establish the position.",
      description:
        "Understand the business, its market and the audiences it needs to reach. Define the direction before choosing the activity.",
    },
    {
      phase: "Creative",
      label: "Give the position a voice.",
      description:
        "Develop the language, content and visual communication that make the business recognisable across its touchpoints.",
    },
    {
      phase: "Growth",
      label: "Put the work into the market.",
      description:
        "Use relevant digital channels, campaigns and customer journeys to build discoverability, engagement and commercial opportunity.",
    },
    {
      phase: "Technology",
      label: "Strengthen the infrastructure.",
      description:
        "Develop the digital experiences and workflows that support better communication, more efficient execution and informed decisions.",
    },
  ],
  /** "In Practice" (PDF), shown with the image. Person-free existing asset. */
  inPractice: {
    label: "IN PRACTICE",
    title: "A clear point of view. A consistent standard of work.",
    body: "The details matter: the argument behind a headline, the hierarchy of a page, the relevance of a campaign and the experience after someone responds. CULT.URE approaches each with the same consideration.",
    image: {
      src: "/images/work/project-04.jpg",
      alt: "Bright workspace with a laptop beside floor-to-ceiling windows",
    },
  },
  tagline: "Beyond the noise. Into the culture.",
};

export const aboutPerspective = {
  eyebrow: "WHAT CULT.URE DOES",
  title: "Four disciplines. One connected practice.",
  pillars: [
    { id: "brand-strategy-communications", description: "Defining how a business is positioned, presented and understood." },
    { id: "content-creative", description: "Developing the written and visual communication that gives a business its voice." },
    {
      id: "digital-marketing-growth",
      description: "Connecting businesses with relevant audiences through digital channels and measurable marketing activity.",
    },
    { id: "technology-automation", description: "Building digital platforms and workflows that support the wider business and its marketing." },
  ].map((p, i) => ({
    number: String(i + 1).padStart(2, "0"),
    title: disciplines.find((d) => d.id === p.id)!.name,
    description: p.description,
    href: disciplineHref(p.id),
  })),
  cta: { label: "Explore services", href: "/services" },
};

export const aboutPrinciples = {
  eyebrow: "OUR PRINCIPLES",
  title: "The standards behind the work.",
  items: [
    {
      number: "I",
      title: "Clarity over complexity.",
      detail: "Good communication makes the important things easier to understand. It does not hide the message behind jargon.",
    },
    {
      number: "II",
      title: "Substance over spectacle.",
      detail: "A strong idea should have more to offer than a moment of attention. Relevance, credibility and quality matter.",
    },
    {
      number: "III",
      title: "Intent before activity.",
      detail: "Every campaign, channel and deliverable should have a reason to exist and a role to play.",
    },
    {
      number: "IV",
      title: "Craft in every detail.",
      detail: "The standard of the work is visible in the details: the thinking, the writing, the design and the execution.",
    },
  ],
};

export const aboutCta = {
  eyebrow: "START A CONVERSATION",
  headline: "Have something worth putting into the world?",
  lead: "Whether the priority is a stronger market position, a more effective marketing function or a new business initiative, start with the objective.",
  primaryAction: { label: "Get in touch", href: "/contact" },
  secondaryAction: { label: "Explore services", href: "/services" },
};
