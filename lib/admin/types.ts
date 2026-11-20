/**
 * Admin data types and labels. Client-safe: contains no records, so interactive
 * components can import it without bundling the demo dataset (lib/admin/data.ts).
 */

import type { DisciplineId } from "@/lib/content/disciplines";
import type { RichNode } from "@/lib/rich-text";

export type EnquiryStatus = "NEW" | "READ" | "REPLIED" | "CLOSED";
/** The public form's service values: the four discipline ids plus "not-sure" (never anything else). */
export type ServiceId = DisciplineId | "not-sure";
export type EnquirySource = "CONTACT_PAGE" | "HOME" | "ABOUT";

export interface EnquiryStatusChange {
  from: EnquiryStatus | null;
  to: EnquiryStatus;
  /** ISO 8601 */
  at: string;
}

/** Admin list row (MongoDB). `message` is a short preview in lists; full text in detail. */
export interface Enquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  website?: string;
  services: ServiceId[];
  message: string;
  status: EnquiryStatus;
  source: EnquirySource;
  /** ISO 8601 */
  createdAt: string;
  updatedAt: string;
}

/** Full record for the detail panel. */
export interface EnquiryDetail extends Enquiry {
  statusHistory: EnquiryStatusChange[];
}

/** Service filter and labels: CULT.URE's four disciplines (lib/content/disciplines.ts) plus "Not sure yet". */
export const serviceLabels: Record<ServiceId, string> = {
  "brand-strategy-communications": "Brand Strategy",
  "content-creative": "Content & Creative",
  "digital-marketing-growth": "Digital Marketing",
  "technology-automation": "Technology",
  "not-sure": "Not sure yet",
};

export const enquirySourceLabels: Record<EnquirySource, string> = {
  CONTACT_PAGE: "Contact page",
  HOME: "Home page",
  ABOUT: "About page",
};

export const enquiryStatusLabels: Record<EnquiryStatus, string> = {
  NEW: "New",
  READ: "Read",
  REPLIED: "Replied",
  CLOSED: "Closed",
};

export const ENQUIRY_STATUSES: EnquiryStatus[] = ["NEW", "READ", "REPLIED", "CLOSED"];

/* ---------------------------------------------------------------
   Case studies: MongoDB-backed (lib/case-studies). Re-exported for admin components.
---------------------------------------------------------------- */

export type { AdminCaseStudy, CaseStudyCounts, CaseStudyListResult, CaseStudyStatusFilter } from "@/lib/case-studies/types";
export { caseStudyStatusLabels, type CaseStudyStatus } from "@/lib/case-studies/constants";

/* ---------------------------------------------------------------
   Blog posts (MongoDB: lib/blog; admin API /api/admin/blogs)
---------------------------------------------------------------- */

export type BlogStatus = "DRAFT" | "PUBLISHED";

export const BLOG_CATEGORIES = ["Brand Strategy", "Marketing", "Content", "Growth", "Design"] as const;
export const BLOG_DEFAULT_AUTHOR = "CULT.URE";

/** Full admin record (editor). Dates are ISO 8601. */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** Body as rich-text JSON (lib/rich-text.ts), sanitised on the server. */
  content: RichNode;
  coverImage: string | null;
  /** Cloudinary public id when the cover was uploaded; null for site images. */
  coverImagePublicId: string | null;
  coverImageAlt: string;
  coverCaption: string;
  /** One of BLOG_CATEGORIES, or "" when not chosen yet. */
  category: string;
  tags: string[];
  author: string;
  status: BlogStatus;
  /** Empty = use the title / excerpt. */
  seoTitle: string;
  seoDescription: string;
  /** Date shown on the site (YYYY-MM-DD) when set by the editor; otherwise the publish date. */
  displayDate: string | null;
  /** Start of the current publication; null while a draft. */
  publishedAt: string | null;
  /** First publication ever (kept through unpublish / republish). */
  firstPublishedAt: string | null;
  /** Earlier public slugs that redirect (308) to `slug`. */
  previousSlugs: string[];
  wordCount: number;
  readingMinutes: number;
  createdAt: string;
  updatedAt: string;
  /** Live address slug (= slug while PUBLISHED), else null. */
  publicSlug: string | null;
}

/** List row: everything except the body (kept small). */
export type BlogSummary = Omit<BlogPost, "content">;

export const blogStatusLabels: Record<BlogStatus, string> = { DRAFT: "Draft", PUBLISHED: "Published" };

/* ---------------------------------------------------------------
   Newsletter subscribers
---------------------------------------------------------------- */

export type SubscriberStatus = "ACTIVE" | "UNSUBSCRIBED";
export type SubscriberSource = "WEBSITE" | "BLOG" | "CASE_STUDY" | "MANUAL";

export interface Subscriber {
  id: string;
  /** Optional: many sign-up forms only ask for an email. */
  name?: string;
  /** Always stored trimmed and lower-case. */
  email: string;
  status: SubscriberStatus;
  source: SubscriberSource;
  subscribedAt: string;
  /** Present only when the address was actually verified (never assumed). */
  verifiedAt?: string;
  /** Most recent unsubscribe; kept as history after a reactivation. */
  unsubscribedAt?: string;
  /** Set when an unsubscribed address is re-activated. */
  reactivatedAt?: string;
  createdAt: string;
  updatedAt: string;
  /** Added by hand in this browser tab (not from a sign-up form). */
  isLocal?: boolean;
}

export const subscriberStatusLabels: Record<SubscriberStatus, string> = { ACTIVE: "Active", UNSUBSCRIBED: "Unsubscribed" };
export const subscriberSourceLabels: Record<SubscriberSource, string> = { WEBSITE: "Website", BLOG: "Blog", CASE_STUDY: "Case Study", MANUAL: "Manual" };
export const SUBSCRIBER_SOURCES = Object.keys(subscriberSourceLabels) as SubscriberSource[];
