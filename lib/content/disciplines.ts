/**
 * CULT.URE — Service disciplines (client copy deck, B2B positioning).
 *
 * Source of truth: "CULTURE_Complete_Website_Copy_B2B.pdf" (Home and Services sections).
 * Four disciplines, 26 services, 166 scope items. Names, descriptions and scope items
 * are the client's exact copy: do not rename or rewrite.
 *
 * Used by: Home (services story, enquiry form) and the Services page (chapters,
 * index, Service JSON-LD).
 *
 * TRANSITION NOTE
 * The Footer and case-study service tags still read the previous nine-service
 * catalog in lib/content/service-catalog.ts until they are migrated. Their links
 * keep working through the legacy anchors defined at the bottom of this file.
 */

import type { ContentImage } from "./home";
import type { ServiceCategoryId, ServiceId } from "./service-catalog";

export type DisciplineId =
  | "brand-strategy-communications"
  | "content-creative"
  | "digital-marketing-growth"
  | "technology-automation";

export type DisciplineService = {
  /** Section ID on /services (/services#<id>). */
  id: string;
  /** Client's exact service name. */
  name: string;
  /** Client's description (PDF: Services). */
  description: string;
  /** "Scope includes" items (PDF: Services). Examples, tailored per engagement. */
  scope: string[];
};

export type Discipline = {
  /** Section ID on /services (/services#<id>). */
  id: DisciplineId;
  /** Client's exact discipline name. */
  name: string;
  /** One line used on the Home page (PDF: Home, 02 — Services). */
  summary: string;
  /** One line used in the Services page index (PDF: Services, Four Disciplines). */
  indexLine: string;
  /** Chapter headline on the Services page. */
  headline: string;
  /** Chapter introduction on the Services page. */
  intro: string;
  services: DisciplineService[];
  image: ContentImage;
};

export const disciplines: Discipline[] = [
  {
    id: "brand-strategy-communications",
    name: "Brand Strategy & Communications",
    summary: "Define the position, identity and language that distinguish a business in its market.",
    indexLine: "The position, identity and communication that shape how a business is understood.",
    headline: "Define what the business stands for. Make it clear to the market.",
    intro:
      "A distinctive brand is built on more than a visual identity. It needs a clear position, a coherent message and a recognisable way of communicating. CULT.URE develops the strategic and communication foundations that help B2B businesses present themselves with clarity and consistency.",
    services: [
      {
        id: "brand-strategy-positioning",
        name: "Brand Strategy & Positioning",
        description:
          "Establishing a brand's position requires an understanding of its business model, competitive environment, audience and genuine points of difference.",
        scope: [
          "Brand and market assessment",
          "Audience and competitor research",
          "Positioning and value proposition",
          "Brand purpose and strategic direction",
          "Brand architecture, where required",
        ],
      },
      {
        id: "brand-identity-development",
        name: "Brand Identity & Development",
        description:
          "Developing the visual foundations of a brand, from its core identity to the design elements that create consistency across its applications.",
        scope: [
          "Visual identity development",
          "Logo and identity systems",
          "Colour and typography direction",
          "Brand guidelines",
          "Brand collateral and applications",
        ],
      },
      {
        id: "brand-messaging-communications",
        name: "Brand Messaging & Communications",
        description:
          "Developing the language a business uses to explain its offering, communicate its difference and speak to different audiences.",
        scope: [
          "Brand narrative and messaging framework",
          "Value propositions and key messages",
          "Tone of voice development",
          "Corporate and product communication",
          "Website and marketing messaging direction",
        ],
      },
      {
        id: "personal-branding-executive-positioning",
        name: "Personal Branding & Executive Positioning",
        description:
          "Positioning founders, executives and subject-matter experts around their experience, expertise and perspective.",
        scope: [
          "Executive positioning",
          "Professional narrative development",
          "Personal brand messaging",
          "Profile and biography development",
          "Communication direction for public platforms",
        ],
      },
      {
        id: "public-relations-reputation-management",
        name: "Public Relations & Reputation Management",
        description:
          "Developing communication strategies that help businesses share meaningful stories, engage relevant media and manage their public reputation.",
        scope: [
          "PR strategy and communication planning",
          "Media narratives and story angles",
          "Press releases and media materials",
          "Media outreach planning",
          "Reputation and issue communication support",
        ],
      },
      {
        id: "event-corporate-communications",
        name: "Event & Corporate Communications",
        description:
          "Planning the communication and visual expression surrounding corporate events, exhibitions, launches and business announcements.",
        scope: [
          "Event communication strategy",
          "Event branding and visual direction",
          "Event posters and promotional creatives",
          "Exhibition and stall graphics",
          "Backdrops, standees and signage",
          "Invitations and event collateral",
          "Event-specific brochures and presentations",
          "Corporate announcements",
          "Pre-event and post-event communication",
        ],
      },
    ],
    image: {
      src: "/images/services/personal-branding.jpg",
      alt: "Portrait lit in blue light against a violet background",
      placeholderLabel: "Visual — Brand Strategy & Communications",
    },
  },
  {
    id: "content-creative",
    name: "Content & Creative",
    summary:
      "Turn expertise, ideas and commercial priorities into communication that earns the attention of relevant audiences.",
    indexLine:
      "The ideas, language and creative assets that bring a business's expertise and proposition to its audience.",
    headline: "Give the business something worth saying. Then say it well.",
    intro:
      "Content should reflect the quality of the business behind it. It needs a clear editorial direction, a recognisable voice and a reason to exist. CULT.URE develops written and visual communication for B2B brands across digital platforms, business channels and marketing touchpoints.",
    services: [
      {
        id: "content-strategy-marketing",
        name: "Content Strategy & Marketing",
        description:
          "Planning content around business objectives, audience interests and the questions that influence consideration and decision-making.",
        scope: [
          "Content strategy and editorial direction",
          "Audience and topic research",
          "Content pillars and messaging themes",
          "Editorial calendars",
          "Long-form and short-form content",
          "Content distribution planning",
        ],
      },
      {
        id: "founder-executive-ghostwriting",
        name: "Founder & Executive Ghostwriting",
        description:
          "Developing a distinct professional voice for founders and business leaders, with content that reflects their experience, perspective and industry knowledge.",
        scope: [
          "LinkedIn posts and articles",
          "Executive thought leadership",
          "Professional storytelling",
          "Opinion-led content",
          "Founder narratives and personal perspectives",
          "Editorial planning and voice development",
        ],
      },
      {
        id: "social-media-strategy-management",
        name: "Social Media Strategy & Management",
        description:
          "Building a consistent social media presence through platform strategy, editorial planning, creative development and ongoing management.",
        scope: [
          "Platform-specific strategy",
          "Content planning and calendars",
          "Social media copywriting",
          "Creative direction and production",
          "Publishing and account management",
          "Community engagement and reporting",
        ],
      },
      {
        id: "website-content-copywriting",
        name: "Website Content & Copywriting",
        description:
          "Developing website content that explains the business, communicates its value and helps visitors understand the next step.",
        scope: [
          "Website messaging and page architecture",
          "Website copywriting",
          "Landing pages",
          "Product and service descriptions",
          "Website content optimisation",
          "Conversion-focused calls to action",
        ],
      },
      {
        id: "creative-campaign-development",
        name: "Creative Campaign Development",
        description:
          "Developing campaign concepts and communication that connect a business objective with a relevant audience and a consistent creative direction.",
        scope: [
          "Campaign concepts and themes",
          "Creative strategy and direction",
          "Campaign messaging",
          "Product and service launch communication",
          "Brand awareness campaigns",
          "Seasonal and promotional campaigns",
          "Multi-channel creative planning",
        ],
      },
      {
        id: "graphic-design-creative-production",
        name: "Graphic Design & Creative Production",
        description:
          "Designing visual assets that make business communication clear, recognisable and consistent across digital and physical touchpoints.",
        scope: [
          "Social media graphics and carousels",
          "Advertising creatives",
          "Corporate and company profile brochures",
          "Product and service brochures",
          "Catalogues and marketing collateral",
          "Presentations and pitch decks",
          "Posters and promotional materials",
          "Exhibition and stall graphics",
          "Print and digital design assets",
        ],
      },
    ],
    image: {
      src: "/images/services/content-strategy.jpg",
      alt: "Camera body and lenses laid out on a dark surface",
      placeholderLabel: "Visual — Content & Creative",
    },
  },
  {
    id: "digital-marketing-growth",
    name: "Digital Marketing & Growth",
    summary:
      "Reach relevant audiences, strengthen discoverability and create more effective paths from interest to a qualified business conversation.",
    indexLine:
      "The channels, campaigns and customer journeys that build visibility, engagement and commercial opportunity.",
    headline: "Reach the right audience. Earn consideration. Create momentum.",
    intro:
      "Digital marketing is most effective when channels are selected for a reason and evaluated against meaningful objectives. CULT.URE plans and executes digital marketing activity around audience behaviour, business priorities and the opportunities within each channel.",
    services: [
      {
        id: "marketing-strategy",
        name: "Marketing Strategy",
        description:
          "Developing a marketing plan that connects business objectives with audience priorities, positioning, channels and execution.",
        scope: [
          "Business and marketing assessment",
          "Audience and market analysis",
          "Marketing objectives and priorities",
          "Channel and campaign strategy",
          "Budget and activity planning",
          "Performance measurement framework",
        ],
      },
      {
        id: "search-engine-optimisation",
        name: "Search Engine Optimisation (SEO)",
        description:
          "Improving the technical structure, relevance and content of a website to strengthen its visibility in organic search.",
        scope: [
          "SEO audits",
          "Keyword and search intent research",
          "On-page optimisation",
          "Technical SEO recommendations",
          "Content optimisation",
          "Search performance monitoring",
        ],
      },
      {
        id: "geo-aeo",
        name: "Generative Engine Optimisation (GEO) & Answer Engine Optimisation (AEO)",
        description:
          "Improving how business information is structured, understood and represented across AI-powered search and answer experiences.",
        scope: [
          "AI search visibility assessment",
          "Topic and question research",
          "Content structure and optimisation",
          "Entity and brand information consistency",
          "Structured data recommendations",
          "Monitoring of relevant search visibility",
        ],
      },
      {
        id: "performance-marketing",
        name: "Performance Marketing",
        description:
          "Planning, managing and optimising digital campaigns with attention to audience quality, creative performance, conversion and return on investment.",
        scope: [
          "Campaign strategy and setup",
          "Paid media management",
          "Audience targeting",
          "Creative and landing page testing",
          "Conversion tracking",
          "Campaign analysis and optimisation",
        ],
      },
      {
        id: "lead-demand-generation",
        name: "Lead Generation & Demand Generation",
        description:
          "Developing programmes that create awareness, attract relevant prospects and support their progression towards a business conversation.",
        scope: [
          "Lead generation strategy",
          "Demand generation planning",
          "Audience and account research",
          "Lead capture and landing pages",
          "Campaign and content alignment",
          "Lead nurturing recommendations",
        ],
      },
      {
        id: "ecommerce-marketing-growth",
        name: "E-commerce Marketing & Growth",
        description:
          "Developing marketing strategies for online stores, with attention to acquisition, product presentation, conversion and customer retention.",
        scope: [
          "E-commerce marketing strategy",
          "Product and category page optimisation",
          "Storefront content and creative",
          "Paid and organic acquisition",
          "Launch and promotional campaigns",
          "Retention and repeat purchase planning",
        ],
      },
      {
        id: "email-lifecycle-marketing",
        name: "Email & Lifecycle Marketing",
        description:
          "Planning email communication around the different stages of a customer relationship, from initial interest to conversion, retention and re-engagement.",
        scope: [
          "Email marketing strategy",
          "Audience segmentation",
          "Newsletter planning and copywriting",
          "Automated email journeys",
          "Customer lifecycle communication",
          "Campaign reporting and optimisation",
        ],
      },
    ],
    image: {
      src: "/images/work/project-03.jpg",
      alt: "Glass office towers seen from street level",
      placeholderLabel: "Visual — Digital Marketing & Growth",
    },
  },
  {
    id: "technology-automation",
    name: "Technology & Automation",
    summary:
      "Build the digital experiences and connected workflows that make marketing and business operations work better.",
    indexLine: "The digital platforms and connected systems that support effective marketing and business operations.",
    headline: "Build the digital infrastructure behind better work.",
    intro:
      "Technology should solve a defined problem. From the website a prospect visits to the systems a team uses every day, the right digital infrastructure can improve the way a business operates and communicates.",
    services: [
      {
        id: "website-design-development",
        name: "Website Design & Development",
        description:
          "Designing and developing websites that combine clear information architecture, considered user experience and reliable technical foundations.",
        scope: [
          "Website strategy and sitemap",
          "UX and interface design",
          "Responsive website development",
          "CMS integration",
          "Performance and accessibility foundations",
          "Website maintenance and improvements",
        ],
      },
      {
        id: "ai-integration-implementation",
        name: "AI Integration & Implementation",
        description:
          "Identifying relevant AI applications and integrating them into defined business and marketing processes.",
        scope: [
          "AI opportunity assessment",
          "Tool and platform selection",
          "AI-assisted content and research workflows",
          "AI integrations",
          "Use-case development",
          "Implementation and documentation",
        ],
      },
      {
        id: "marketing-automation",
        name: "Marketing Automation",
        description:
          "Connecting marketing activities through automated workflows that support lead capture, communication, follow-up and reporting.",
        scope: [
          "Marketing workflow assessment",
          "Campaign automation",
          "Lead capture and routing",
          "Automated follow-up sequences",
          "Platform integrations",
          "Workflow documentation",
        ],
      },
      {
        id: "crm-lead-management",
        name: "CRM & Lead Management",
        description:
          "Structuring customer and prospect information so teams can manage enquiries, follow-ups and opportunities more effectively.",
        scope: [
          "CRM selection and setup",
          "Pipeline configuration",
          "Contact and lead organisation",
          "Lead assignment and tracking",
          "Sales follow-up workflows",
          "CRM reporting",
        ],
      },
      {
        id: "chatbots-conversational-automation",
        name: "Chatbots & Conversational Automation",
        description:
          "Developing conversational experiences that answer common questions, collect relevant information and direct enquiries to the right next step.",
        scope: [
          "Chatbot strategy and planning",
          "Conversation flow design",
          "FAQ and knowledge-base setup",
          "Lead qualification flows",
          "Website and messaging integrations",
          "Testing and refinement",
        ],
      },
      {
        id: "business-workflow-automation",
        name: "Business Workflow Automation",
        description:
          "Automating repetitive tasks and connecting business tools to reduce manual work and improve operational continuity.",
        scope: [
          "Workflow assessment",
          "Process mapping",
          "Tool and platform integrations",
          "Automated task sequences",
          "Notifications and internal handovers",
          "Documentation and testing",
        ],
      },
      {
        id: "marketing-analytics-reporting",
        name: "Marketing Analytics & Reporting",
        description:
          "Creating a clearer view of marketing activity, channel performance and progress against business objectives.",
        scope: [
          "Measurement planning",
          "Analytics and tracking setup",
          "Dashboard development",
          "Campaign and channel reporting",
          "Performance interpretation",
          "Recommendations for improvement",
        ],
      },
    ],
    image: {
      src: "/images/services/ai-automation.jpg",
      alt: "Abstract layered gradient shapes",
      placeholderLabel: "Visual — Technology & Automation",
    },
  },
];

/** Total service count across the four disciplines (26). */
export const serviceCount = disciplines.reduce((n, d) => n + d.services.length, 0);

export const disciplineById = (id: string) => disciplines.find((d) => d.id === id);

/** Section on /services for a discipline or a service. */
export const disciplineHref = (id: string) => `/services#${id}`;

/** Enquiry link: the Contact page, with the discipline preselected in the form. */
export const enquiryHref = (id: DisciplineId) => `/contact?service=${id}`;

/**
 * Old nine-service IDs → new discipline, so existing "Enquire about this service"
 * links (/?service=<old id>#contact) still preselect the right discipline.
 */
export const legacyServiceDiscipline: Record<ServiceId, DisciplineId> = {
  "personal-branding-linkedin-marketing": "brand-strategy-communications",
  "pr-event-marketing": "brand-strategy-communications",
  "social-media-marketing": "content-creative",
  "performance-growth-marketing": "digital-marketing-growth",
  "ecommerce-marketing-growth": "digital-marketing-growth",
  "seo-geo-aeo": "digital-marketing-growth",
  "email-lifecycle-marketing": "digital-marketing-growth",
  "website-design-development": "technology-automation",
  "ai-business-automation": "technology-automation",
};

/**
 * Legacy /services anchors (old category and service IDs) → the section that now
 * covers them. Rendered as hidden anchors on /services so old links (Footer,
 * case-study tags, external links) keep landing in the right place.
 * IDs that are unchanged in the new structure are not listed.
 */
export const legacyAnchors: Partial<Record<ServiceCategoryId | ServiceId, string>> = {
  "brand-presence": "brand-strategy-communications",
  "search-customer-engagement": "digital-marketing-growth",
  "technology-experience": "technology-automation",
  "personal-branding-linkedin-marketing": "personal-branding-executive-positioning",
  "pr-event-marketing": "public-relations-reputation-management",
  "social-media-marketing": "social-media-strategy-management",
  "performance-growth-marketing": "performance-marketing",
  "seo-geo-aeo": "search-engine-optimisation",
  "ai-business-automation": "ai-integration-implementation",
};

/** Legacy IDs that should resolve to a given new section ID. */
export const legacyAnchorsFor = (targetId: string) =>
  Object.entries(legacyAnchors)
    .filter(([, target]) => target === targetId)
    .map(([legacy]) => legacy);
