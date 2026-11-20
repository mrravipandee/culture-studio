/**
 * Case Studies — data shapes shared by the API, the admin UI and the public pages.
 * CLIENT-SAFE (types only). Dates are ISO 8601 strings; ids are 24-char hex strings.
 */

import type { DisciplineId } from "@/lib/content/disciplines";
import type { CaseStudy } from "@/lib/content/case-studies";
import type { CaseStudyFilterId, CaseStudyGroupId, CaseStudySort, CaseStudyStatus, CoverKind } from "./constants";

export interface CaseStudyServiceItem {
  /** The project's own service label, e.g. "Brand Positioning". */
  name: string;
  /** Optional link to a service in the CULT.URE catalog (lib/content/disciplines.ts). */
  serviceId?: string;
}

/** A scope line. `value` is an optional headline figure ("360°", "03"). */
export interface CaseStudyScopeItem {
  value?: string;
  title: string;
  description?: string;
}

/** A supplied result: `value` + " " + `label` reproduces the exact line ("25% Sales Growth"). */
export interface CaseStudyResultItem {
  value: string;
  label: string;
}

/**
 * Cover. IMAGE needs a site image (url) and alt text. TYPOGRAPHIC is the branded
 * typographic visual (no photograph), chosen deliberately when no approved image exists.
 */
export interface CaseStudyCover {
  kind: CoverKind;
  url?: string;
  /** Reserved for a future image store (e.g. Cloudinary public id). */
  publicId?: string;
  alt: string;
  /** Temporary illustrative photograph, not the client's work (captioned on the site). */
  illustrative: boolean;
  /** CSS object-position for the crop, e.g. "50% 40%". */
  position?: string;
}

export interface CaseStudyGalleryImage {
  url: string;
  publicId?: string;
  alt: string;
}

export interface CaseStudySeo {
  title?: string;
  description?: string;
  ogImage?: string;
}

/** Everything an admin edits (create / update body). Status is never part of it. */
export interface CaseStudyContent {
  title: string;
  slug: string;
  projectHighlight: string;
  overview: string;
  category?: DisciplineId;
  group: CaseStudyGroupId;
  filters: CaseStudyFilterId[];
  services: CaseStudyServiceItem[];
  scope: CaseStudyScopeItem[];
  results: CaseStudyResultItem[];
  coverImage: CaseStudyCover;
  gallery: CaseStudyGalleryImage[];
  featured: boolean;
  sortOrder: number;
  seo: CaseStudySeo;
}

/** Admin record (API response). Internal audit ids and migration bookkeeping are not exposed. */
export interface AdminCaseStudy extends CaseStudyContent {
  id: string;
  status: CaseStudyStatus;
  /** Start of the current publication; null while not published. */
  publishedAt: string | null;
  /** First time it was ever published (kept through unpublish / republish). */
  firstPublishedAt: string | null;
  /** Earlier public slugs that now redirect to `slug`. */
  previousSlugs: string[];
  createdAt: string;
  updatedAt: string;
  /** Set only on soft-deleted records (visible in the "Deleted" view). */
  deletedAt: string | null;
  /** Created by the approved-content migration (not typed in the admin). */
  migrated: boolean;
}

export interface CaseStudyCounts {
  all: number;
  DRAFT: number;
  PUBLISHED: number;
  ARCHIVED: number;
  deleted: number;
  withImage: number;
}

export interface CaseStudyListResult {
  items: AdminCaseStudy[];
  /** Matching the current filters. */
  filtered: number;
  page: number;
  pageSize: number;
  pages: number;
  counts: CaseStudyCounts;
}

export type CaseStudyStatusFilter = CaseStudyStatus | "all" | "deleted";

export interface CaseStudyListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status: CaseStudyStatusFilter;
  featured?: boolean;
  category?: DisciplineId;
  serviceId?: string;
  from?: Date;
  to?: Date;
  sort: CaseStudySort;
}

/** Publishing readiness: field → message. Empty when the record can be published. */
export type PublishIssues = Record<string, string>;

/* Public --------------------------------------------------------------------------------- */

export interface PublicFigureSection {
  label: "Project Scope" | "Results";
  items: { value: string; label: string; description?: string }[];
}

/**
 * Public case study: the existing `CaseStudy` view shape used by every public component,
 * plus the sections, gallery and SEO data read from the database.
 */
export interface PublicCaseStudy extends CaseStudy {
  /** Catalog service ids linked from the project's service labels (for filtering). */
  serviceIds: string[];
  figureSections: PublicFigureSection[];
  gallery: { src: string; alt: string }[];
  seo: { title: string; description: string; ogImage?: string };
  featured: boolean;
  publishedAt: string;
  firstPublishedAt: string;
  updatedAt: string;
}

export interface PublicCaseStudyListQuery {
  page: number;
  pageSize: number;
  search?: string;
  category?: DisciplineId;
  filter?: CaseStudyFilterId;
  serviceId?: string;
  featured?: boolean;
  sort: "order" | "newest";
}
