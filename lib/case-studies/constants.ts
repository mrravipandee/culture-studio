/**
 * Case Studies — shared constants. CLIENT-SAFE (no data, no server imports).
 *
 * One definition of statuses, limits, groups, listing filters and the image rules, used by
 * the Mongoose model, the Zod schemas, the service layer and the admin UI.
 */

import { disciplines, type DisciplineId } from "@/lib/content/disciplines";

/* Status ---------------------------------------------------------------------------------- */

export const CASE_STUDY_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type CaseStudyStatus = (typeof CASE_STUDY_STATUSES)[number];

export const caseStudyStatusLabels: Record<CaseStudyStatus, string> = { DRAFT: "Draft", PUBLISHED: "Published", ARCHIVED: "Archived" };

/** Dedicated status actions (never a generic content update). */
export const CASE_STUDY_ACTIONS = ["publish", "unpublish", "archive", "restore"] as const;
export type CaseStudyAction = (typeof CASE_STUDY_ACTIONS)[number];

/**
 * Allowed status transitions (anything else is rejected):
 *   publish    DRAFT → PUBLISHED, ARCHIVED → PUBLISHED   (always after full publishing validation)
 *   unpublish  PUBLISHED → DRAFT
 *   archive    PUBLISHED → ARCHIVED
 *   restore    ARCHIVED → DRAFT                          (a soft-deleted record of any status
 *                                                         also comes back through `restore`,
 *                                                         always as DRAFT)
 */
export const CASE_STUDY_TRANSITIONS: Record<CaseStudyAction, { from: readonly CaseStudyStatus[]; to: CaseStudyStatus }> = {
  publish: { from: ["DRAFT", "ARCHIVED"], to: "PUBLISHED" },
  unpublish: { from: ["PUBLISHED"], to: "DRAFT" },
  archive: { from: ["PUBLISHED"], to: "ARCHIVED" },
  restore: { from: ["ARCHIVED"], to: "DRAFT" },
};

export const canTransition = (action: CaseStudyAction, from: CaseStudyStatus) => CASE_STUDY_TRANSITIONS[action].from.includes(from);

/* Listing groups and filters (public Case Studies page) ---------------------------------- */

export const CASE_STUDY_GROUPS = ["selected", "growth"] as const;
export type CaseStudyGroupId = (typeof CASE_STUDY_GROUPS)[number];
export const caseStudyGroupLabels: Record<CaseStudyGroupId, string> = { selected: "Selected projects", growth: "Growth & Performance Marketing" };

export const CASE_STUDY_FILTER_IDS = ["branding", "social-media", "website-seo", "performance-marketing"] as const;
export type CaseStudyFilterId = (typeof CASE_STUDY_FILTER_IDS)[number];
export const caseStudyFilterLabels: Record<CaseStudyFilterId, string> = {
  branding: "Branding",
  "social-media": "Social Media",
  "website-seo": "Website & SEO",
  "performance-marketing": "Performance Marketing",
};

/* Category and services (CULT.URE taxonomy, lib/content/disciplines.ts) ------------------- */

export const CASE_STUDY_CATEGORY_IDS = disciplines.map((d) => d.id) as [DisciplineId, ...DisciplineId[]];
export const caseStudyCategoryLabel = (id: string | null | undefined) => disciplines.find((d) => d.id === id)?.name ?? "";

/** Every service id in the catalog (optional link from a project's service label). */
export const CATALOG_SERVICE_IDS = disciplines.flatMap((d) => d.services.map((s) => s.id));
export const catalogServiceName = (id: string) => disciplines.flatMap((d) => d.services).find((s) => s.id === id)?.name ?? "";

/* Field limits ----------------------------------------------------------------------------- */

export const CASE_STUDY_LIMITS = {
  title: 120,
  slug: 80,
  highlight: 220,
  overview: 1500,
  serviceName: 80,
  services: 12,
  scopeItems: 12,
  scopeTitle: 120,
  scopeDescription: 300,
  results: 8,
  resultValue: 24,
  resultLabel: 80,
  alt: 160,
  gallery: 12,
  seoTitle: 70,
  seoDescription: 160,
  previousSlugs: 20,
  sortOrder: 9999,
  search: 120,
} as const;

/* Slugs -------------------------------------------------------------------------------------- */

export const CASE_STUDY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Lowercase, hyphen-separated, accents and punctuation removed, "&" → "and". May return "". */
export const slugifyCaseStudy = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, CASE_STUDY_LIMITS.slug)
    .replace(/-+$/g, "");

/** Paths that must never be used as a slug (they collide with routes or look like placeholders). */
export const RESERVED_SLUGS = new Set(["new", "edit", "admin", "api", "unpublished", "placeholder", "preview", "draft"]);

/* Images ------------------------------------------------------------------------------------ */

/**
 * Image storage boundary. Two kinds of image reference are accepted, nothing else:
 *  1. an existing site image under /public/images ("/images/…");
 *  2. an image uploaded to Cloudinary through the admin (https://res.cloudinary.com/<cloud>/
 *     image/upload/…), stored together with its Cloudinary public id.
 * blob: and data: URIs, other hosts and path traversal are rejected, so nothing is stored that
 * would not survive a reload or a deploy. This pattern is the shape check shared with the
 * browser; the server additionally verifies Cloudinary images against the configured cloud,
 * the upload folder and the Cloudinary API (lib/media/cloudinary.ts) before saving.
 */
export const SITE_IMAGE_PATTERN = /^\/images\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+(?:\.[a-z0-9_-]+)*\.(?:jpe?g|png|webp|avif)$/i;
export const CLOUDINARY_IMAGE_PATTERN = /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/image\/upload\/(?:v\d+\/)?(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:jpe?g|png|webp)$/;
/** Either kind; used by the Mongoose model. */
export const IMAGE_URL_PATTERN = new RegExp(`(?:${SITE_IMAGE_PATTERN.source})|(?:${CLOUDINARY_IMAGE_PATTERN.source})`, "i");
export const isCloudinaryUrl = (url: string) => CLOUDINARY_IMAGE_PATTERN.test(url);
export const isAllowedImageUrl = (url: string) => !url.includes("..") && (SITE_IMAGE_PATTERN.test(url) || CLOUDINARY_IMAGE_PATTERN.test(url));

/** Upload rules (enforced in the browser, by the signed Cloudinary request and again on save). */
export const MEDIA_UPLOAD = {
  formats: ["jpg", "png", "webp"] as const,
  mimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  maxBytes: 5 * 1024 * 1024,
  /** Cloudinary folder for case study images. */
  folder: "culture-studio/case-studies",
} as const;

/** Cloudinary upload folder per feature. A signature is issued for exactly one of these. */
export const MEDIA_FOLDERS = {
  "case-study": MEDIA_UPLOAD.folder,
  blog: "culture-studio/blog",
} as const;
export type MediaPurpose = keyof typeof MEDIA_FOLDERS;
export const MEDIA_PURPOSES = Object.keys(MEDIA_FOLDERS) as MediaPurpose[];

/** Approved existing assets offered in the admin picker (all present in /public/images). */
export const CASE_STUDY_IMAGE_LIBRARY: readonly { url: string; label: string }[] = [
  { url: "/images/case-studies/the-dco-architecture.jpg", label: "Glass towers (architecture)" },
  { url: "/images/case-studies/motion-media-camera.jpg", label: "Camera and lenses" },
  { url: "/images/case-studies/xlar-media-screens.jpg", label: "Wall of screens" },
  { url: "/images/case-studies/linkedin-workspace.jpg", label: "Laptop by the window" },
  { url: "/images/case-studies/fashion-editorial.jpg", label: "Editorial fabric portrait" },
  { url: "/images/case-studies/hero-burgundy-material.jpg", label: "Burgundy material texture" },
  { url: "/images/blog/hero-burgundy-architecture.jpg", label: "Burgundy architecture" },
  { url: "/images/blog/article-abstract-burgundy-ivory.jpg", label: "Burgundy and ivory abstract" },
  { url: "/images/blog/featured-studio-interior.jpg", label: "Studio interior" },
  { url: "/images/hero/detail.jpg", label: "Gallery wall of frames" },
];

/** NONE: not configured yet (drafts only). TYPOGRAPHIC: the branded typographic visual. */
export const COVER_KINDS = ["NONE", "IMAGE", "TYPOGRAPHIC"] as const;
export type CoverKind = (typeof COVER_KINDS)[number];

/** CSS object-position, e.g. "50% 40%". */
export const OBJECT_POSITION_PATTERN = /^(?:100|[1-9]?\d)% (?:100|[1-9]?\d)%$/;

/* Admin listing -------------------------------------------------------------------------- */

export const CASE_STUDY_PAGE_SIZE = 9;
export const CASE_STUDY_PAGE_SIZE_MAX = 50;
export const CASE_STUDY_SORTS = ["newest", "oldest", "updated", "order", "title"] as const;
export type CaseStudySort = (typeof CASE_STUDY_SORTS)[number];

/** Cache tag on every cached public read (listing, detail, redirects, sitemap, Home). */
export const CASE_STUDIES_CACHE_TAG = "case-studies";

/** Request body caps (bytes). */
export const CASE_STUDY_BODY_MAX = 32 * 1024;
