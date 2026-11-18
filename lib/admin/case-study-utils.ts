/**
 * Case study helpers for the admin. Pure and client-safe (types only), so they work for the
 * local preview now and for API data later.
 */

import type { AdminCaseStudy, CaseStudyFiguresLabel, CaseStudyStatus } from "./types";

/* Counts ---------------------------------------------------------------- */

export const getTotalCaseStudies = (list: AdminCaseStudy[]) => list.length;
export const getPublishedCount = (list: AdminCaseStudy[]) => list.filter((c) => c.status === "PUBLISHED").length;
export const getDraftCount = (list: AdminCaseStudy[]) => list.filter((c) => c.status === "DRAFT").length;
export const getWithCoverCount = (list: AdminCaseStudy[]) => list.filter((c) => c.coverImage).length;

/** Distinct categories actually used by the records, alphabetically. */
export const getCategories = (list: AdminCaseStudy[]) => [...new Set(list.map((c) => c.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));

/* Search and filters --------------------------------------------------------- */

export interface CaseStudyFilters {
  search: string;
  status: CaseStudyStatus | "all";
  category: string | "all";
}

export const emptyCaseStudyFilters: CaseStudyFilters = { search: "", status: "all", category: "all" };
export const hasCaseStudyFilters = (f: CaseStudyFilters) => f.search.trim() !== "" || f.status !== "all" || f.category !== "all";

/** Case-insensitive search over title, highlight, overview, services, category and slug. */
export function matchesCaseStudy(c: AdminCaseStudy, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [c.title, c.highlight, c.overview, c.category, c.slug, ...c.services].some((field) => field.toLowerCase().includes(q));
}

export const filterCaseStudies = (list: AdminCaseStudy[], f: CaseStudyFilters) =>
  list.filter((c) => (f.status === "all" || c.status === f.status) && (f.category === "all" || c.category === f.category) && matchesCaseStudy(c, f.search));

export const CASE_STUDY_PAGE_SIZE = 9;

/* Slugs ------------------------------------------------------------------------ */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/* Form values and validation ------------------------------------------------------ */

export interface CaseStudyFormValues {
  title: string;
  slug: string;
  highlight: string;
  overview: string;
  category: string;
  services: string[];
  figuresLabel: CaseStudyFiguresLabel;
  scope: string[];
  results: string[];
  coverImage: string | null;
  coverAlt: string;
}

export type CaseStudyFormErrors = Partial<Record<keyof CaseStudyFormValues | "items", string>> & {
  scopeItems?: Record<number, string>;
  resultItems?: Record<number, string>;
};

export const LIMITS = { title: 120, slug: 80, highlight: 220, overview: 1200, item: 120, alt: 160 } as const;

export const emptyCaseStudyForm: CaseStudyFormValues = {
  title: "",
  slug: "",
  highlight: "",
  overview: "",
  category: "",
  services: [],
  figuresLabel: "Results",
  scope: [],
  results: [],
  coverImage: null,
  coverAlt: "",
};

export const toFormValues = (c: AdminCaseStudy): CaseStudyFormValues => ({
  title: c.title,
  slug: c.slug,
  highlight: c.highlight,
  overview: c.overview,
  category: c.category,
  services: [...c.services],
  figuresLabel: c.figuresLabel,
  scope: [...c.scope],
  results: [...c.results],
  coverImage: c.coverImage,
  coverAlt: c.coverAlt,
});

/** Trim text and drop nothing else (empty list items are reported, not silently removed). */
export const normaliseForm = (v: CaseStudyFormValues): CaseStudyFormValues => ({
  ...v,
  title: v.title.trim(),
  slug: v.slug.trim(),
  highlight: v.highlight.trim(),
  overview: v.overview.trim(),
  category: v.category.trim(),
  scope: v.scope.map((s) => s.trim()),
  results: v.results.map((s) => s.trim()),
  coverAlt: v.coverAlt.trim(),
});

export function validateCaseStudy(raw: CaseStudyFormValues, takenSlugs: string[], categories: string[]): CaseStudyFormErrors {
  const v = normaliseForm(raw);
  const e: CaseStudyFormErrors = {};

  if (!v.title) e.title = "Enter a project title.";
  else if (v.title.length > LIMITS.title) e.title = `Keep the title under ${LIMITS.title} characters.`;

  if (!v.slug) e.slug = "Enter a slug.";
  else if (!SLUG_PATTERN.test(v.slug)) e.slug = "Use lowercase letters, numbers and single hyphens only (e.g. brand-refresh).";
  else if (v.slug.length > LIMITS.slug) e.slug = `Keep the slug under ${LIMITS.slug} characters.`;
  else if (takenSlugs.includes(v.slug)) e.slug = "Another case study already uses this slug.";

  if (!v.highlight) e.highlight = "Enter the project highlight.";
  else if (v.highlight.length > LIMITS.highlight) e.highlight = `Keep the highlight under ${LIMITS.highlight} characters.`;

  if (!v.overview) e.overview = "Enter an overview.";
  else if (v.overview.length > LIMITS.overview) e.overview = `Keep the overview under ${LIMITS.overview} characters.`;

  if (!v.category) e.category = "Choose a category.";
  else if (!categories.includes(v.category)) e.category = "Choose a category from the list.";

  if (v.services.length === 0) e.services = "Add at least one service.";
  else if (new Set(v.services).size !== v.services.length) e.services = "Each service can only be added once.";

  const itemErrors = (items: string[]) => {
    const out: Record<number, string> = {};
    items.forEach((item, i) => {
      if (!item) out[i] = "Fill in this item or remove it.";
      else if (item.length > LIMITS.item) out[i] = `Keep this under ${LIMITS.item} characters.`;
    });
    return Object.keys(out).length ? out : undefined;
  };
  e.scopeItems = itemErrors(v.scope);
  e.resultItems = itemErrors(v.results);
  if (!e.scopeItems) delete e.scopeItems;
  if (!e.resultItems) delete e.resultItems;

  const figures = v.figuresLabel === "Project Scope" ? v.scope : v.results;
  if (figures.length === 0) e.items = `Add at least one ${v.figuresLabel === "Project Scope" ? "scope item" : "result"} (shown on the project page).`;

  if (v.coverImage && !v.coverAlt) e.coverAlt = "Describe the cover image for screen readers.";
  else if (v.coverAlt.length > LIMITS.alt) e.coverAlt = `Keep the description under ${LIMITS.alt} characters.`;

  return e;
}

export const hasErrors = (e: CaseStudyFormErrors) => Object.keys(e).length > 0;

/* Images ------------------------------------------------------------------------------- */

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export function validateImageFile(file: { type: string; size: number; name: string }): string | null {
  const extOk = /\.(png|jpe?g|webp)$/i.test(file.name);
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type) || !extOk) return "Use a PNG, JPG or WebP image.";
  if (file.size > IMAGE_MAX_BYTES) return `Image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 2 MB.`;
  if (file.size === 0) return "This file is empty.";
  return null;
}

/* Display ------------------------------------------------------------------------------ */

export const formatAdminDate = (iso: string | null) => {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(t));
};

/** The figures shown on the public page (scope or results, per figuresLabel). */
export const publicFigures = (c: Pick<AdminCaseStudy, "figuresLabel" | "scope" | "results">) => (c.figuresLabel === "Project Scope" ? c.scope : c.results);
