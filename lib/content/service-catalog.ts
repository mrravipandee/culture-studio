/**
 * CULT.URE — Official service catalog (single source of truth).
 *
 * Nine confirmed services in four categories. Names are official: do not rename.
 * Every page (home, services, about, case studies, footer, contact form) reads from here.
 *
 * "possibleDeliverables" describe typical scope components of each service type.
 * They are not promises: actual scope is agreed per engagement.
 * No pricing, guarantees, clients or results are stated anywhere in this file.
 */

import type { ContentImage } from "./home";

export type ServiceCategoryId =
  | "brand-presence"
  | "digital-marketing-growth"
  | "search-customer-engagement"
  | "technology-experience";

export type ServiceId =
  | "social-media-marketing"
  | "email-lifecycle-marketing"
  | "personal-branding-linkedin-marketing"
  | "seo-geo-aeo"
  | "ai-business-automation"
  | "website-design-development"
  | "performance-growth-marketing"
  | "ecommerce-marketing-growth"
  | "pr-event-marketing";

export type ServiceCategory = {
  id: ServiceCategoryId;
  name: string;
  /** One line for navigation and the homepage. */
  summary: string;
  /** Short paragraph introducing the category on /services. */
  intro: string;
  image: ContentImage;
  services: ServiceId[];
};

export type Service = {
  id: ServiceId;
  /** Official service name. */
  name: string;
  category: ServiceCategoryId;
  /** One or two sentences for compact listings. */
  summary: string;
  /** What it is. */
  what: string;
  /** The problem it addresses. */
  problem: string;
  /** What CULT.URE provides. */
  provides: string[];
  /** Typical scope components; agreed per engagement. */
  possibleDeliverables: string[];
};

export const services: Record<ServiceId, Service> = {
  "personal-branding-linkedin-marketing": {
    id: "personal-branding-linkedin-marketing",
    name: "Personal Branding & LinkedIn Marketing",
    category: "brand-presence",
    summary: "A clear public position for founders and leaders, built consistently on LinkedIn and beyond.",
    what: "Defining how a founder, executive or expert is seen in public, then building that presence on LinkedIn and the other platforms their audience uses.",
    problem: "Expertise often stays invisible. Profiles are incomplete, posting is irregular and the message changes from week to week, so the right people never form a clear picture.",
    provides: [
      "Positioning and narrative for the individual",
      "Voice and tone guidance",
      "LinkedIn profile and content strategy",
      "Content planning, writing support and publishing rhythm",
    ],
    possibleDeliverables: [
      "Personal positioning document",
      "Optimised LinkedIn profile",
      "Content pillars and editorial calendar",
      "Post and article drafts",
    ],
  },
  "pr-event-marketing": {
    id: "pr-event-marketing",
    name: "PR & Event Marketing",
    category: "brand-presence",
    summary: "Media coverage and events that put the brand in front of the right people.",
    what: "Shaping the stories a brand tells to media and the experiences it creates in person, so that coverage and events reinforce the same position.",
    problem: "Announcements go unnoticed and events are planned in isolation, so the attention they create fades without building lasting recognition.",
    provides: [
      "PR narrative and story angles",
      "Media outreach planning",
      "Event concept, communication and promotion",
      "Coordination of messaging before, during and after events",
    ],
    possibleDeliverables: [
      "Press materials and media kit",
      "Outreach plan",
      "Event communication plan",
      "Pre and post event content",
    ],
  },
  "social-media-marketing": {
    id: "social-media-marketing",
    name: "Social Media Marketing",
    category: "digital-marketing-growth",
    summary: "Social media strategy, content and community management, with a clear purpose behind every post.",
    what: "Planning, creating and managing social media for a brand, with each platform used for what it does best.",
    problem: "Posting without a plan produces activity rather than results: inconsistent visuals, unclear messaging and no link between content and business goals.",
    provides: [
      "Social strategy by platform",
      "Content planning and creative direction",
      "Content production and publishing",
      "Community management and reporting",
    ],
    possibleDeliverables: [
      "Social media strategy",
      "Monthly content calendar",
      "Post, reel and story creatives",
      "Performance reports",
    ],
  },
  "performance-growth-marketing": {
    id: "performance-growth-marketing",
    name: "Performance & Growth Marketing",
    category: "digital-marketing-growth",
    summary: "Paid campaigns and growth experiments, planned and measured against clear objectives.",
    what: "Running paid campaigns and structured growth experiments across channels, with spend and creative decisions guided by measurement.",
    problem: "Ad budgets get spent without clear tracking or testing, so it is hard to tell what is working and where the next unit of growth should come from.",
    provides: [
      "Channel and campaign planning",
      "Paid media setup and management",
      "Creative and landing page testing",
      "Tracking, analytics and reporting",
    ],
    possibleDeliverables: [
      "Growth plan",
      "Campaign structures and ad creatives",
      "Tracking and conversion setup",
      "Performance dashboards and reports",
    ],
  },
  "ecommerce-marketing-growth": {
    id: "ecommerce-marketing-growth",
    name: "E-commerce Marketing & Growth",
    category: "digital-marketing-growth",
    summary: "Marketing for online stores, covering acquisition, conversion and repeat purchase.",
    what: "Growing online stores by connecting traffic, product presentation, conversion and retention into one plan.",
    problem: "Stores often bring in visitors without converting them, or win first orders without earning repeat customers.",
    provides: [
      "E-commerce growth strategy",
      "Product page and storefront improvements",
      "Campaigns for launches and seasonal moments",
      "Retention and repeat purchase planning",
    ],
    possibleDeliverables: [
      "Store audit",
      "Conversion recommendations",
      "Campaign calendar",
      "Retention flows and offers",
    ],
  },
  "seo-geo-aeo": {
    id: "seo-geo-aeo",
    name: "SEO, GEO & AEO",
    category: "search-customer-engagement",
    summary: "Visibility in search engines, AI-generated answers and answer engines.",
    what: "Search Engine Optimisation, Generative Engine Optimisation and Answer Engine Optimisation: making a brand discoverable on search engines and in the answers produced by AI assistants.",
    problem: "Customers now search in more places than one results page. Brands that are hard to crawl, unclear in their content or absent from trusted sources are left out of both search results and AI answers.",
    provides: [
      "Technical and content audits",
      "Keyword, topic and question research",
      "On-page and structured data improvements",
      "Content built to be cited by search and AI answers",
    ],
    possibleDeliverables: [
      "SEO, GEO and AEO audit",
      "Keyword and topic map",
      "Optimised pages and structured data",
      "Content briefs",
    ],
  },
  "email-lifecycle-marketing": {
    id: "email-lifecycle-marketing",
    name: "Email & Lifecycle Marketing",
    category: "search-customer-engagement",
    summary: "Email and automated messages that take people from first sign-up to loyal customer.",
    what: "Designing email and lifecycle communication that reaches people at the right moment: welcome, nurture, purchase, re-engagement and beyond.",
    problem: "Lists grow but sit idle, or receive generic blasts that are ignored, so an owned channel never contributes what it could.",
    provides: [
      "Lifecycle strategy and segmentation",
      "Automated flows",
      "Newsletter and campaign design",
      "Copywriting and reporting",
    ],
    possibleDeliverables: [
      "Lifecycle map",
      "Automated email flows",
      "Email templates",
      "Campaign calendar",
    ],
  },
  "website-design-development": {
    id: "website-design-development",
    name: "Website Design & Development",
    category: "technology-experience",
    summary: "Fast, accessible websites designed around the brand and built to convert.",
    what: "Designing and building websites that express the brand clearly and are fast, accessible and easy to manage.",
    problem: "An outdated or slow website undermines everything else: it weakens first impressions, loses visitors and makes campaigns harder to convert.",
    provides: [
      "Information architecture and UX",
      "Visual and interface design",
      "Front-end and CMS development",
      "Performance, accessibility and SEO foundations",
    ],
    possibleDeliverables: [
      "Sitemap and wireframes",
      "Design system and page designs",
      "Developed and launched website",
      "Handover documentation",
    ],
  },
  "ai-business-automation": {
    id: "ai-business-automation",
    name: "AI & Business Automation",
    category: "technology-experience",
    summary: "AI tools and automated workflows that take repetitive work off your team.",
    what: "Identifying repetitive processes in marketing and operations and replacing them with AI-assisted tools and automated workflows.",
    problem: "Teams lose hours to manual, repetitive tasks, which slows delivery and leaves less time for strategic and creative work.",
    provides: [
      "Process and workflow review",
      "AI tool selection and setup",
      "Workflow automation between existing tools",
      "Team guidance and documentation",
    ],
    possibleDeliverables: [
      "Automation opportunity map",
      "Configured workflows and integrations",
      "AI assistants for defined tasks",
      "Process documentation",
    ],
  },
};

export const serviceCategories: ServiceCategory[] = [
  {
    id: "brand-presence",
    name: "Brand & Presence",
    summary: "How a brand and its people are seen, talked about and remembered.",
    intro: "Reputation is built in public. These services shape how a brand, and the people who lead it, are seen on LinkedIn, in the press and at events.",
    image: {
      src: "/images/services/personal-branding.jpg",
      alt: "Portrait lit in blue light against a violet background",
      placeholderLabel: "Visual — Brand & Presence",
    },
    services: ["personal-branding-linkedin-marketing", "pr-event-marketing"],
  },
  {
    id: "digital-marketing-growth",
    name: "Digital Marketing & Growth",
    summary: "Content, campaigns and commerce working towards measurable growth.",
    intro: "Attention only matters when it leads to action. These services connect social media, paid campaigns and online stores to clear commercial goals.",
    image: {
      src: "/images/work/project-03.jpg",
      alt: "Glass office towers seen from street level",
      placeholderLabel: "Visual — Digital Marketing & Growth",
    },
    services: ["social-media-marketing", "performance-growth-marketing", "ecommerce-marketing-growth"],
  },
  {
    id: "search-customer-engagement",
    name: "Search & Customer Engagement",
    summary: "Being found when people search, and staying in touch once they arrive.",
    intro: "Customers search, compare and come back. These services make a brand easy to find in search engines and AI answers, and worth hearing from in the inbox.",
    image: {
      src: "/images/work/project-04.jpg",
      alt: "Bright workspace with a laptop beside floor-to-ceiling windows",
      placeholderLabel: "Visual — Search & Customer Engagement",
    },
    services: ["seo-geo-aeo", "email-lifecycle-marketing"],
  },
  {
    id: "technology-experience",
    name: "Technology & Experience",
    summary: "The websites and systems that everything else runs on.",
    intro: "Every campaign lands somewhere. These services build the websites and automated systems that the rest of your marketing depends on.",
    image: {
      src: "/images/services/ai-automation.jpg",
      alt: "Abstract layered gradient shapes",
      placeholderLabel: "Visual — Technology & Experience",
    },
    services: ["website-design-development", "ai-business-automation"],
  },
];

/** All nine services in category order. */
export const allServices: Service[] = serviceCategories.flatMap((c) => c.services.map((id) => services[id]));

export const categoryOf = (id: ServiceId) => serviceCategories.find((c) => c.services.includes(id))!;

/** Anchor on /services for a service or a category. */
export const serviceHref = (id: ServiceId | ServiceCategoryId) => `/services#${id}`;

/** Inquiry link that preselects the service in the contact form. */
export const inquiryHref = (id?: ServiceId) => (id ? `/?service=${id}#contact` : "/#contact");

/** Agency positioning, reused in metadata and copy. */
export const positioning = {
  descriptor: "Digital growth, marketing and creative agency",
  oneLiner:
    "CULT.URE is a digital growth, marketing and creative agency combining strategy, creative and technology to build brands that people remember.",
  tagline: "Beyond the noise. Into the culture.",
};
