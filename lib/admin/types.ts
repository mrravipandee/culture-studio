/**
 * Admin data types and labels. Client-safe: contains no records, so interactive
 * components can import it without bundling the demo dataset (lib/admin/data.ts).
 */

import type { DisciplineId } from "@/lib/content/disciplines";
import type { RichNode } from "@/lib/rich-text";

export type EnquiryStatus = "NEW" | "READ" | "REPLIED" | "CLOSED";
export type ServiceId = DisciplineId | "other";

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  website?: string;
  /** Only present when the enquirer supplied one (never invented). */
  phone?: string;
  service: ServiceId;
  message: string;
  status: EnquiryStatus;
  /** ISO 8601 */
  createdAt: string;
}

/** Service filter and labels: CULT.URE's four disciplines (lib/content/disciplines.ts) plus "Other". */
export const serviceLabels: Record<ServiceId, string> = {
  "brand-strategy-communications": "Brand Strategy",
  "content-creative": "Content & Creative",
  "digital-marketing-growth": "Digital Marketing",
  "technology-automation": "Technology",
  other: "Other",
};

export const enquiryStatusLabels: Record<EnquiryStatus, string> = {
  NEW: "New",
  READ: "Read",
  REPLIED: "Replied",
  CLOSED: "Closed",
};

export const ENQUIRY_STATUSES: EnquiryStatus[] = ["NEW", "READ", "REPLIED", "CLOSED"];

/* ---------------------------------------------------------------
   Case studies (admin view of lib/content/case-studies.ts)
---------------------------------------------------------------- */

export type CaseStudyStatus = "DRAFT" | "PUBLISHED";
export type CaseStudyFiguresLabel = "Project Scope" | "Results";

export interface AdminCaseStudy {
  /** Stable id: approved projects use `cs-<slug>`, records created in the admin `local-<n>`. */
  id: string;
  slug: string;
  /** Display number of approved projects ("01"–"09"); null for local records. */
  number: string | null;
  title: string;
  highlight: string;
  overview: string;
  services: string[];
  /** Discipline name, e.g. "Brand Strategy & Communications". */
  category: string;
  coverImage: string | null;
  coverAlt: string;
  /** Cover is a temporary illustrative image (not client work). */
  coverIsTemporary: boolean;
  status: CaseStudyStatus;
  /** Which heading the public page uses for the figures. */
  figuresLabel: CaseStudyFiguresLabel;
  /** Each item is the exact supplied line, e.g. "25% Sales Growth". */
  scope: string[];
  results: string[];
  /** Not recorded for approved projects (null); set for local edits and records. */
  createdAt: string | null;
  updatedAt: string | null;
  /**
   * The slug under which this project is live on the public website, read from the
   * publishing allowlist (lib/content/case-studies-publishing.ts); null when not public.
   * Read-only in the admin: local edits never change it.
   */
  publicSlug: string | null;
  /** Created in this browser tab (not approved content). */
  isLocal: boolean;
}

export const caseStudyStatusLabels: Record<CaseStudyStatus, string> = { DRAFT: "Draft", PUBLISHED: "Published" };

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
