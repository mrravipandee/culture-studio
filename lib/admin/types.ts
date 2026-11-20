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
   Blog posts (admin view of lib/content/blog.ts)
---------------------------------------------------------------- */

export type BlogStatus = "DRAFT" | "PUBLISHED";

export const BLOG_CATEGORIES = ["Brand Strategy", "Marketing", "Content", "Growth", "Design"] as const;
export const BLOG_DEFAULT_AUTHOR = "CULT.URE";

export interface BlogPost {
  /** Stable id: `blog-<slug>` for existing articles, `local-…` for records created in the admin. */
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** Body as rich-text JSON (lib/rich-text.ts). Empty doc when not written yet. */
  content: RichNode;
  coverImage: string | null;
  coverImageAlt: string;
  coverCaption: string;
  category: string;
  tags: string[];
  author: string;
  status: BlogStatus;
  /** Empty = use the title / excerpt. */
  seoTitle: string;
  seoDescription: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Slug under which the article is live (lib/content/blog-publishing.ts); null when not public. Read-only. */
  publicSlug: string | null;
  /** Created in this browser tab. */
  isLocal: boolean;
}

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
