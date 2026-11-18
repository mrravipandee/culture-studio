/**
 * CULT.URE Admin — DEMO DATA. SERVER-ONLY (imported by the dashboard Server Component).
 *
 * Nothing here is real: every enquiry, subscriber and analytics value is fictional
 * sample data for the dashboard UI, so it can be designed and tested before the backend
 * exists. People, companies and emails are invented (emails use example.com / .test).
 *
 * Replace each collection with a MongoDB/API query later; the dashboard reads only the
 * exported collections through lib/admin/dashboard-utils.ts.
 *
 * Case studies are NOT demo data and are not duplicated here: `caseStudies` maps the real,
 * approved projects (lib/content/case-studies.ts) and reads their public visibility from the
 * publishing allowlist (lib/content/case-studies-publishing.ts), which stays the only source
 * of truth for the public website.
 */

import { caseStudies as approvedCaseStudies, caseStudyCategory } from "@/lib/content/case-studies";
import { disciplines } from "@/lib/content/disciplines";
import { isCaseStudyPublished } from "@/lib/content/case-studies-publishing";
import { blogArticles, featuredArticle } from "@/lib/content/blog";

export const IS_DEMO_DATA = true;

/** The demo dataset covers the 90 days ending on this date (fixed, so it never looks live). */
export const DEMO_DATA_END = "2026-11-14";
export const DEMO_DATA_DAYS = 90;

/* ---------------------------------------------------------------
   Types
---------------------------------------------------------------- */

import { BLOG_DEFAULT_AUTHOR, type AdminCaseStudy, type BlogPost, type Enquiry, type EnquiryStatus, type ServiceId, type Subscriber } from "./types";
import { emptyDoc } from "@/lib/rich-text";
import { isBlogPublished } from "@/lib/content/blog-publishing";
export type { AdminCaseStudy, BlogPost, BlogStatus, Subscriber, SubscriberSource, SubscriberStatus } from "./types";
export type { Enquiry, EnquiryStatus, ServiceId } from "./types";
export { serviceLabels } from "./types";

/** Dashboard name for blog records (same type as the Blog admin). */
export type AdminBlog = BlogPost;




/* ---------------------------------------------------------------
   Enquiries
---------------------------------------------------------------- */

/** Hand-written recent enquiries (DEMO DATA: fictional people and companies). */
const recentEnquiries: Enquiry[] = [
  { id: "enq-1001", name: "Rahul Mehta", email: "rahul.mehta@example.com", company: "Mehta Interiors Studio", website: "https://mehta-interiors.example.com", service: "brand-strategy-communications", message: "Looking to build a brand for our new interior design studio, from positioning to identity.", status: "NEW", createdAt: "2026-11-14T10:24:00+05:30" },
  { id: "enq-1002", name: "Simran Desai", email: "simran.desai@example.com", company: "Desai Organics", service: "digital-marketing-growth", message: "Need support with performance marketing for our D2C skincare launch next quarter.", status: "NEW", createdAt: "2026-11-14T08:02:00+05:30" },
  { id: "enq-1003", name: "Arjun Patil", email: "arjun.patil@example.com", company: "Patil Logistics", service: "content-creative", message: "Interested in a content strategy and LinkedIn presence for our leadership team.", status: "NEW", createdAt: "2026-11-13T16:45:00+05:30" },
  { id: "enq-1004", name: "Neha Sharma", email: "neha.sharma@example.com", company: "Sharma & Co. Advisory", website: "https://sharma-advisory.example.com", service: "technology-automation", message: "Would like to discuss a new website and CRM automation for our consultancy.", status: "READ", createdAt: "2026-11-12T12:10:00+05:30" },
  { id: "enq-1005", name: "Karan Verma", email: "karan.verma@example.com", company: "Verma Hospitality Group", service: "brand-strategy-communications", message: "Need a complete brand build for two boutique hotel properties opening in 2027.", status: "NEW", createdAt: "2026-11-11T19:30:00+05:30" },
  { id: "enq-1006", name: "Priya Nair", email: "priya.nair@example.com", company: "Nair Dental Clinic", service: "content-creative", message: "Looking for monthly social media content and short-form video for our clinic.", status: "REPLIED", createdAt: "2026-11-10T11:05:00+05:30" },
  { id: "enq-1007", name: "Vikram Joshi", email: "vikram.joshi@example.com", company: "Joshi Precision Tools", service: "digital-marketing-growth", message: "We want to generate more B2B leads through Google Ads and SEO.", status: "READ", createdAt: "2026-11-09T15:40:00+05:30" },
  { id: "enq-1008", name: "Ananya Iyer", email: "ananya.iyer@example.com", company: "Iyer Architecture Lab", service: "brand-strategy-communications", message: "Rebranding our architecture practice ahead of an international expansion.", status: "REPLIED", createdAt: "2026-11-08T09:15:00+05:30" },
  { id: "enq-1009", name: "Rohan Kulkarni", email: "rohan.kulkarni@example.com", company: "Kulkarni Fintech Labs", service: "technology-automation", message: "Need help automating our lead qualification and email follow-ups.", status: "NEW", createdAt: "2026-11-08T17:55:00+05:30" },
  { id: "enq-1010", name: "Meera Reddy", email: "meera.reddy@example.com", company: "Reddy Textiles", service: "digital-marketing-growth", message: "Our marketplace sales have plateaued. Looking for a growth audit.", status: "REPLIED", createdAt: "2026-11-06T13:20:00+05:30" },
  { id: "enq-1011", name: "Aditya Bansal", email: "aditya.bansal@example.com", company: "Bansal Realty", service: "content-creative", message: "Interested in a video series showcasing our residential projects.", status: "READ", createdAt: "2026-11-05T10:00:00+05:30" },
  { id: "enq-1012", name: "Kavya Menon", email: "kavya.menon@example.com", company: "Menon Wellness", service: "brand-strategy-communications", message: "Starting a wellness brand and need naming, positioning and visual identity.", status: "REPLIED", createdAt: "2026-11-04T18:35:00+05:30" },
  { id: "enq-1013", name: "Siddharth Rao", email: "siddharth.rao@example.com", company: "Rao Engineering Works", service: "other", message: "Can you help with a corporate presentation and investor deck?", status: "REPLIED", createdAt: "2026-11-03T14:50:00+05:30" },
  { id: "enq-1015", name: "Riya Kapoor", email: "riya.kapoor@example.com", company: "Kapoor Textiles", service: "digital-marketing-growth", message: "Help with a launch campaign and go-to-market strategy for our new handloom collection.", status: "CLOSED", createdAt: "2026-11-10T09:40:00+05:30" },
  { id: "enq-1016", name: "Dev Malhotra", email: "dev.malhotra@example.com", company: "Malhotra Wealth Partners", website: "https://malhotra-wealth.example.com", service: "brand-strategy-communications", message: "We are a boutique wealth advisory and want our brand to feel more premium and trustworthy for HNI clients.", status: "CLOSED", createdAt: "2026-11-07T12:25:00+05:30" },
  { id: "enq-1014", name: "Ishita Gupta", email: "ishita.gupta@example.com", company: "Gupta Foods", service: "digital-marketing-growth", message: "Need a performance campaign plan for our festive season launch.", status: "NEW", createdAt: "2026-11-02T20:05:00+05:30" },
];

/** Deterministic pseudo-random generator (same output on every render and build). */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["Aarav", "Diya", "Kabir", "Isha", "Manav", "Riya", "Tanvi", "Yash", "Nikhil", "Pooja", "Harsh", "Sneha", "Omkar", "Devika", "Varun", "Aditi", "Sameer", "Nidhi"];
const LAST = ["Shah", "Kapoor", "Pillai", "Chopra", "Deshmukh", "Malhotra", "Bhat", "Saxena", "Shetty", "Agarwal", "Kaur", "Pandit", "Jain", "Sinha"];
const COMPANY = ["Studio", "Foods", "Clinic", "Realty", "Textiles", "Labs", "Consulting", "Interiors", "Logistics", "Wellness", "Ventures", "Exports"];
const SERVICE_WEIGHTS: [ServiceId, number][] = [
  ["brand-strategy-communications", 0.34],
  ["digital-marketing-growth", 0.28],
  ["content-creative", 0.2],
  ["technology-automation", 0.11],
  ["other", 0.07],
];
const MESSAGES: Record<ServiceId, string[]> = {
  "brand-strategy-communications": ["Looking for brand positioning support for a new business.", "Need help refreshing our brand identity and messaging.", "Planning a rebrand and would like to discuss scope."],
  "digital-marketing-growth": ["Want to improve lead generation through paid campaigns.", "Looking for SEO and performance marketing support.", "Need help scaling online sales."],
  "content-creative": ["Interested in monthly social media content.", "Looking for a content strategy for LinkedIn.", "Need video content for an upcoming launch."],
  "technology-automation": ["Need a new website for our business.", "Want to automate our enquiry follow-ups.", "Looking for help with CRM setup."],
  other: ["Would like to discuss a project. Please get in touch.", "Have a few questions about working together."],
};

const pick = <T,>(list: T[], r: number) => list[Math.floor(r * list.length) % list.length];
/** Older enquiries were handled already: mostly replied, some closed, a few only read. */
const olderStatus = (r: number): EnquiryStatus => (r < 0.55 ? "REPLIED" : r < 0.8 ? "CLOSED" : "READ");

/** Older demo enquiries, generated deterministically for the 90-day chart. */
function generateOlderEnquiries(): Enquiry[] {
  const rand = seeded(20261114);
  const end = new Date(`${DEMO_DATA_END}T00:00:00+05:30`);
  const out: Enquiry[] = [];
  let n = 0;
  // Every day of the 90-day window. Generated records are timed early in the day (06:00–07:59)
  // so the hand-written records above stay the most recent on their days.
  for (let back = DEMO_DATA_DAYS - 1; back >= 0; back--) {
    const day = new Date(end.getTime() - back * 86_400_000);
    const weekday = day.getUTCDay();
    const trend = 0.6 + (DEMO_DATA_DAYS - back) / 110; // gently rising volume
    const count = Math.floor(rand() * 5 * trend + (weekday === 0 ? 0 : 1));
    for (let i = 0; i < count; i++) {
      const r = rand();
      let acc = 0;
      const service = SERVICE_WEIGHTS.find(([, w]) => (acc += w) >= r)?.[0] ?? "other";
      const first = pick(FIRST, rand());
      const last = pick(LAST, rand());
      const hour = 6 + Math.floor(rand() * 2);
      const created = new Date(day.getTime() + hour * 3_600_000 + Math.floor(rand() * 60) * 60_000);
      n += 1;
      out.push({
        id: `enq-${String(n).padStart(4, "0")}`,
        name: `${first} ${last}`,
        email: `${first}.${last}`.toLowerCase() + `${n}@example.com`,
        company: `${last} ${pick(COMPANY, rand())}`,
        service,
        message: pick(MESSAGES[service], rand()),
        status: olderStatus(rand()),
        createdAt: created.toISOString(),
      });
    }
  }
  return out;
}

export const enquiries: Enquiry[] = [...recentEnquiries, ...generateOlderEnquiries()];

/* ---------------------------------------------------------------
   Case studies (real, approved projects; not duplicated)
---------------------------------------------------------------- */

export const caseStudies: AdminCaseStudy[] = approvedCaseStudies.map((project) => {
  const lines = project.figures.map((f) => `${f.value} ${f.label}`);
  const isPublic = isCaseStudyPublished(project.slug);
  return {
    id: `cs-${project.slug}`,
    slug: project.slug,
    number: project.number,
    title: project.title,
    highlight: project.highlight,
    overview: project.overview,
    services: [...project.services],
    category: caseStudyCategory(project),
    coverImage: project.image.src,
    coverAlt: project.image.alt,
    coverIsTemporary: project.image.temporary === true,
    status: isPublic ? "PUBLISHED" : "DRAFT",
    figuresLabel: project.figuresLabel,
    scope: project.figuresLabel === "Project Scope" ? lines : [],
    results: project.figuresLabel === "Results" ? lines : [],
    createdAt: null,
    updatedAt: null,
    publicSlug: isPublic ? project.slug : null,
    isLocal: false,
  };
});

/** Options for the admin case study form: the four disciplines, and every service name in
 *  the CULT.URE taxonomy plus the labels already used by approved projects. */
export const caseStudyCategoryOptions = disciplines.map((d) => d.name);
export const caseStudyServiceOptions = [
  ...new Set([...disciplines.flatMap((d) => d.services.map((s) => s.name)), ...approvedCaseStudies.flatMap((p) => p.services)]),
].sort((a, b) => a.localeCompare(b));

/* ---------------------------------------------------------------
   Blogs (the Blog page sample articles; DRAFT unless on the blog publishing list with a body)
---------------------------------------------------------------- */

const topicLabel: Record<string, string> = {
  "brand-strategy": "Brand Strategy",
  marketing: "Marketing",
  content: "Content",
  growth: "Growth",
  design: "Design",
};

export const blogs: BlogPost[] = [featuredArticle, ...blogArticles].map((article) => {
  const isPublic = isBlogPublished(article.slug) && article.content !== null;
  return {
    id: `blog-${article.slug}`,
    title: article.title,
    slug: article.slug,
    excerpt: article.description,
    content: article.content ?? emptyDoc(),
    coverImage: article.image.src,
    coverImageAlt: article.image.alt,
    coverCaption: "",
    category: topicLabel[article.topic] ?? article.topic,
    tags: [...article.tags],
    author: BLOG_DEFAULT_AUTHOR,
    status: isPublic ? "PUBLISHED" : "DRAFT",
    seoTitle: "",
    seoDescription: "",
    publishedAt: isPublic ? `${article.date}T10:00:00+05:30` : null,
    createdAt: `${article.date}T10:00:00+05:30`,
    updatedAt: `${article.date}T16:00:00+05:30`,
    publicSlug: isPublic ? article.slug : null,
    isLocal: false,
  };
});

/** Site images offered by the blog image pickers (existing local assets; replace with a media library later). */
export const blogImageLibrary = [
  ...new Map(
    [featuredArticle, ...blogArticles, { image: { src: "/images/blog/hero-burgundy-architecture.jpg", alt: "Burgundy-toned architecture" } }].map((a) => [a.image.src, { src: a.image.src, alt: a.image.alt }]),
  ).values(),
];

/* ---------------------------------------------------------------
   Subscribers (fictional; reserved example domains)
---------------------------------------------------------------- */

/** DEMO DATA: fictional people on reserved example domains. Not real sign-ups. */
export const subscribers: Subscriber[] = [
  { id: "sub-01", name: "Aisha Khan", email: "aisha.khan@example.com", status: "ACTIVE", source: "WEBSITE", subscribedAt: "2026-08-18T09:12:00+05:30", verifiedAt: "2026-08-18T09:15:00+05:30", createdAt: "2026-08-18T09:12:00+05:30", updatedAt: "2026-08-18T09:15:00+05:30" },
  { id: "sub-02", email: "reader.two@example.org", status: "ACTIVE", source: "BLOG", subscribedAt: "2026-08-27T21:40:00+05:30", createdAt: "2026-08-27T21:40:00+05:30", updatedAt: "2026-08-27T21:40:00+05:30" },
  { id: "sub-03", name: "Harsh Vardhan", email: "harsh.vardhan@example.net", status: "UNSUBSCRIBED", source: "WEBSITE", subscribedAt: "2026-09-04T11:05:00+05:30", verifiedAt: "2026-09-04T11:09:00+05:30", unsubscribedAt: "2026-10-21T08:30:00+05:30", createdAt: "2026-09-04T11:05:00+05:30", updatedAt: "2026-10-21T08:30:00+05:30" },
  { id: "sub-04", name: "Meghna Iyer", email: "meghna.iyer@example.com", status: "ACTIVE", source: "CASE_STUDY", subscribedAt: "2026-09-16T16:20:00+05:30", verifiedAt: "2026-09-16T16:26:00+05:30", createdAt: "2026-09-16T16:20:00+05:30", updatedAt: "2026-09-16T16:26:00+05:30" },
  { id: "sub-05", name: "Tushar Gokhale", email: "tushar.gokhale@example.com", status: "ACTIVE", source: "WEBSITE", subscribedAt: "2026-09-29T10:45:00+05:30", unsubscribedAt: "2026-10-05T19:00:00+05:30", reactivatedAt: "2026-10-28T12:10:00+05:30", createdAt: "2026-09-29T10:45:00+05:30", updatedAt: "2026-10-28T12:10:00+05:30" },
  { id: "sub-06", email: "studio.lead@example.test", status: "ACTIVE", source: "MANUAL", subscribedAt: "2026-10-03T14:00:00+05:30", createdAt: "2026-10-03T14:00:00+05:30", updatedAt: "2026-10-03T14:00:00+05:30" },
  { id: "sub-07", name: "Nandini Rao", email: "nandini.rao@example.org", status: "ACTIVE", source: "BLOG", subscribedAt: "2026-10-09T08:55:00+05:30", verifiedAt: "2026-10-09T09:01:00+05:30", createdAt: "2026-10-09T08:55:00+05:30", updatedAt: "2026-10-09T09:01:00+05:30" },
  { id: "sub-08", name: "Kunal Sethi", email: "kunal.sethi@example.com", status: "UNSUBSCRIBED", source: "BLOG", subscribedAt: "2026-10-14T20:30:00+05:30", unsubscribedAt: "2026-11-02T10:15:00+05:30", createdAt: "2026-10-14T20:30:00+05:30", updatedAt: "2026-11-02T10:15:00+05:30" },
  { id: "sub-09", name: "Ritika Ahuja", email: "ritika.ahuja@example.net", status: "ACTIVE", source: "WEBSITE", subscribedAt: "2026-10-19T12:12:00+05:30", verifiedAt: "2026-10-19T12:20:00+05:30", createdAt: "2026-10-19T12:12:00+05:30", updatedAt: "2026-10-19T12:20:00+05:30" },
  { id: "sub-10", name: "Sahil Chandra", email: "sahil.chandra@example.com", status: "ACTIVE", source: "CASE_STUDY", subscribedAt: "2026-10-24T17:48:00+05:30", createdAt: "2026-10-24T17:48:00+05:30", updatedAt: "2026-10-24T17:48:00+05:30" },
  { id: "sub-11", name: "Pallavi Menon", email: "pallavi.menon@example.org", status: "ACTIVE", source: "WEBSITE", subscribedAt: "2026-10-30T09:30:00+05:30", verifiedAt: "2026-10-30T09:33:00+05:30", createdAt: "2026-10-30T09:30:00+05:30", updatedAt: "2026-10-30T09:33:00+05:30" },
  { id: "sub-12", name: "Gaurav Bhatia", email: "gaurav.bhatia@example.com", status: "UNSUBSCRIBED", source: "WEBSITE", subscribedAt: "2026-11-03T13:05:00+05:30", verifiedAt: "2026-11-03T13:09:00+05:30", unsubscribedAt: "2026-11-12T18:40:00+05:30", createdAt: "2026-11-03T13:05:00+05:30", updatedAt: "2026-11-12T18:40:00+05:30" },
  { id: "sub-13", name: "Shreya Kulkarni", email: "shreya.kulkarni@example.com", status: "ACTIVE", source: "BLOG", subscribedAt: "2026-11-06T11:25:00+05:30", verifiedAt: "2026-11-06T11:31:00+05:30", createdAt: "2026-11-06T11:25:00+05:30", updatedAt: "2026-11-06T11:31:00+05:30" },
  { id: "sub-14", email: "marketing.team@example.net", status: "ACTIVE", source: "WEBSITE", subscribedAt: "2026-11-09T15:50:00+05:30", createdAt: "2026-11-09T15:50:00+05:30", updatedAt: "2026-11-09T15:50:00+05:30" },
  { id: "sub-15", name: "Arnav Saxena", email: "arnav.saxena@example.com", status: "ACTIVE", source: "CASE_STUDY", subscribedAt: "2026-11-11T10:05:00+05:30", verifiedAt: "2026-11-11T10:11:00+05:30", createdAt: "2026-11-11T10:05:00+05:30", updatedAt: "2026-11-11T10:11:00+05:30" },
  { id: "sub-16", name: "Ishaan Mehra", email: "ishaan.mehra@example.org", status: "ACTIVE", source: "MANUAL", subscribedAt: "2026-11-13T16:40:00+05:30", createdAt: "2026-11-13T16:40:00+05:30", updatedAt: "2026-11-13T16:40:00+05:30" },
  { id: "sub-17", name: "Tanya D’Souza", email: "tanya.dsouza@example.com", status: "ACTIVE", source: "WEBSITE", subscribedAt: "2026-11-14T10:24:00+05:30", verifiedAt: "2026-11-14T10:25:00+05:30", createdAt: "2026-11-14T10:24:00+05:30", updatedAt: "2026-11-14T10:25:00+05:30" },
  { id: "sub-18", name: "Varun Pillai", email: "varun.pillai@example.com", status: "ACTIVE", source: "BLOG", subscribedAt: "2026-11-16T19:10:00+05:30", createdAt: "2026-11-16T19:10:00+05:30", updatedAt: "2026-11-16T19:10:00+05:30" },
];

/* ---------------------------------------------------------------
   Analytics (derived from the enquiries above, so charts and KPIs always agree)
---------------------------------------------------------------- */

export interface DailyEnquiries {
  /** YYYY-MM-DD (India time). */
  date: string;
  count: number;
  byService: Record<ServiceId, number>;
}

const istDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

const emptyBreakdown = (): Record<ServiceId, number> => ({
  "brand-strategy-communications": 0,
  "content-creative": 0,
  "digital-marketing-growth": 0,
  "technology-automation": 0,
  other: 0,
});

function buildDailyAnalytics(list: Enquiry[]): DailyEnquiries[] {
  const end = new Date(`${DEMO_DATA_END}T12:00:00Z`);
  const days: DailyEnquiries[] = [];
  const index = new Map<string, DailyEnquiries>();
  for (let back = DEMO_DATA_DAYS - 1; back >= 0; back--) {
    const date = new Date(end.getTime() - back * 86_400_000).toISOString().slice(0, 10);
    const day = { date, count: 0, byService: emptyBreakdown() };
    days.push(day);
    index.set(date, day);
  }
  for (const enquiry of list) {
    if (Number.isNaN(Date.parse(enquiry.createdAt))) continue;
    const day = index.get(istDate(enquiry.createdAt));
    if (!day) continue;
    day.count += 1;
    day.byService[enquiry.service] += 1;
  }
  return days;
}

export const analytics = { enquiriesByDay: buildDailyAnalytics(enquiries) };
