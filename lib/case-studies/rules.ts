/**
 * Case Studies — domain rules. Pure functions, no I/O. CLIENT-SAFE.
 *
 * Publishing readiness, SEO fallbacks, slug suggestions, redirect history and the mapping
 * from a stored record to the admin DTO and the public view. The service layer and the
 * admin form both use these, so a rule exists in exactly one place.
 */

import { disciplineById, type DisciplineId } from "@/lib/content/disciplines";
import type { CaseStudyFigure } from "@/lib/content/case-studies";
import {
  CASE_STUDY_LIMITS as L,
  CASE_STUDY_SLUG_PATTERN,
  RESERVED_SLUGS,
  caseStudyGroupLabels,
  isAllowedImageUrl,
  slugifyCaseStudy,
  type CaseStudyStatus,
} from "./constants";
import type { AdminCaseStudy, CaseStudyContent, PublicCaseStudy, PublicFigureSection, PublishIssues } from "./types";

/** A stored case study as the service sees it (repository output). */
export interface CaseStudyRecord extends CaseStudyContent {
  id: string;
  status: CaseStudyStatus;
  publishedAt: Date | null;
  firstPublishedAt: Date | null;
  previousSlugs: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  migration: { key: string; hash: string; appliedAt: Date } | null;
}

/* Publishing readiness --------------------------------------------------------------------- */

/**
 * Everything that must be true before a case study goes public. Results are optional (a
 * project can be scope-focused); no figure is ever required. SEO title / description are
 * optional with a documented fallback (title → "<Title> — Case Study", description → the
 * project highlight), but if set they must fit search-result lengths.
 */
export function publishIssues(c: CaseStudyContent): PublishIssues {
  const issues: PublishIssues = {};
  if (!c.title.trim()) issues.title = "Add a project title.";
  if (!c.slug || !CASE_STUDY_SLUG_PATTERN.test(c.slug) || c.slug.length > L.slug || RESERVED_SLUGS.has(c.slug)) issues.slug = "Set a valid slug.";
  if (!c.projectHighlight.trim()) issues.projectHighlight = "Add the project highlight.";
  if (!c.overview.trim()) issues.overview = "Add the overview.";
  if (c.services.length === 0) issues.services = "Add at least one service.";
  else if (c.services.some((s) => !s.name.trim())) issues.services = "Every service needs a name.";
  if (!c.category || !disciplineById(c.category)) issues.category = "Choose a category.";

  const cover = c.coverImage;
  if (cover.kind === "NONE") issues.coverImage = "Choose a cover: an image, or the typographic cover.";
  else if (cover.kind === "IMAGE") {
    if (!cover.url || !isAllowedImageUrl(cover.url)) issues["coverImage.url"] = "Choose a valid cover image.";
    if (!cover.alt.trim()) issues["coverImage.alt"] = "Describe the cover image for screen readers.";
  }
  c.gallery.forEach((g, i) => {
    if (!g.alt.trim()) issues[`gallery.${i}.alt`] = "Describe this gallery image.";
  });
  if (c.seo.ogImage && !isAllowedImageUrl(c.seo.ogImage)) issues["seo.ogImage"] = "Choose a valid social image.";

  const seo = seoFor(c);
  if (seo.title.length > L.seoTitle) issues["seo.title"] = `The page title would be ${seo.title.length} characters. Add an SEO title under ${L.seoTitle}.`;
  if (seo.description.length > L.seoDescription) issues["seo.description"] = `The description would be ${seo.description.length} characters. Add an SEO description under ${L.seoDescription}.`;
  return issues;
}

export const canPublish = (c: CaseStudyContent) => Object.keys(publishIssues(c)).length === 0;

/** SEO values actually used on the page (documented fallbacks). */
export function seoFor(c: Pick<CaseStudyContent, "title" | "projectHighlight" | "seo" | "coverImage">) {
  return {
    title: c.seo.title || `${c.title} — Case Study`,
    description: c.seo.description || c.projectHighlight,
    ogImage: c.seo.ogImage ?? (c.coverImage.kind === "IMAGE" ? c.coverImage.url : undefined),
  };
}

/* Slugs ---------------------------------------------------------------------------------------- */

/** Slug from the title; never empty (falls back to "case-study"). */
export const slugFromTitle = (title: string) => {
  const slug = slugifyCaseStudy(title);
  return slug && !RESERVED_SLUGS.has(slug) ? slug : "case-study";
};

/** First free "<base>-2", "<base>-3", … (kept within the slug length limit). */
export function suggestSlug(base: string, isTaken: (slug: string) => boolean): string {
  for (let n = 2; n < 1000; n++) {
    const suffix = `-${n}`;
    const candidate = `${base.slice(0, L.slug - suffix.length).replace(/-+$/, "")}${suffix}`;
    if (!isTaken(candidate)) return candidate;
  }
  return `${base.slice(0, L.slug - 9)}-${Date.now().toString(36).slice(-8)}`;
}

/**
 * Redirect history after a slug change. The old slug is kept only if the page was ever
 * public (otherwise nothing could link to it). The new slug is removed from the history so
 * a record never redirects to itself, and the list is capped (oldest dropped).
 */
export function nextPreviousSlugs(record: Pick<CaseStudyRecord, "slug" | "previousSlugs" | "firstPublishedAt">, newSlug: string): string[] {
  if (newSlug === record.slug) return record.previousSlugs;
  const list = record.previousSlugs.filter((s) => s !== newSlug && s !== record.slug);
  if (record.firstPublishedAt) list.push(record.slug);
  return list.slice(-L.previousSlugs);
}

/* Mapping ---------------------------------------------------------------------------------------- */

const iso = (d: Date | null) => (d ? d.toISOString() : null);

export function toAdminCaseStudy(r: CaseStudyRecord): AdminCaseStudy {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    projectHighlight: r.projectHighlight,
    overview: r.overview,
    ...(r.category ? { category: r.category } : {}),
    group: r.group,
    filters: [...r.filters],
    services: r.services.map((s) => ({ ...s })),
    scope: r.scope.map((s) => ({ ...s })),
    results: r.results.map((s) => ({ ...s })),
    coverImage: { ...r.coverImage },
    gallery: r.gallery.map((g) => ({ ...g })),
    featured: r.featured,
    sortOrder: r.sortOrder,
    seo: { ...r.seo },
    status: r.status,
    publishedAt: iso(r.publishedAt),
    firstPublishedAt: iso(r.firstPublishedAt),
    previousSlugs: [...r.previousSlugs],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    deletedAt: iso(r.deletedAt),
    migrated: r.migration !== null,
  };
}

/**
 * Sections shown on the project page, in this order: Project Scope, then Results (each only
 * when it has items). Cards use one of them as the key figures: Results when present.
 */
export function figureSections(c: Pick<CaseStudyContent, "scope" | "results">): PublicFigureSection[] {
  const sections: PublicFigureSection[] = [];
  if (c.scope.length) sections.push({ label: "Project Scope", items: c.scope.map((s) => ({ value: s.value ?? "", label: s.title, ...(s.description ? { description: s.description } : {}) })) });
  if (c.results.length) sections.push({ label: "Results", items: c.results.map((r) => ({ value: r.value, label: r.label })) });
  return sections;
}

/**
 * Public view. `position` is the 1-based place in the published order (shown as "01"…);
 * the listing, cards and detail page all render this shape.
 */
export function toPublicCaseStudy(r: CaseStudyRecord, position: number): PublicCaseStudy {
  const sections = figureSections(r);
  const key = sections.find((s) => s.label === "Results") ?? sections[0];
  const figures: CaseStudyFigure[] = key ? key.items.filter((i) => i.value).map((i) => ({ value: i.value, label: i.label })) : [];
  const seo = seoFor(r);
  const cover = r.coverImage;
  const publishedAt = r.publishedAt ?? r.updatedAt;
  return {
    number: String(position).padStart(2, "0"),
    slug: r.slug,
    title: r.title,
    highlight: r.projectHighlight,
    overview: r.overview,
    services: r.services.map((s) => s.name),
    serviceIds: r.services.flatMap((s) => (s.serviceId ? [s.serviceId] : [])),
    figuresLabel: key?.label ?? "Results",
    figures,
    group: r.group,
    discipline: (r.category ?? "brand-strategy-communications") as DisciplineId,
    filters: [...r.filters],
    image:
      cover.kind === "IMAGE" && cover.url
        ? { src: cover.url, alt: cover.alt, ...(cover.illustrative ? { temporary: true } : {}), ...(cover.position ? { position: cover.position } : {}) }
        : { src: null, alt: "" },
    figureSections: sections,
    gallery: r.gallery.map((g) => ({ src: g.url, alt: g.alt })),
    seo: { title: seo.title, description: seo.description, ...(seo.ogImage ? { ogImage: seo.ogImage } : {}) },
    featured: r.featured,
    publishedAt: publishedAt.toISOString(),
    firstPublishedAt: (r.firstPublishedAt ?? publishedAt).toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/** Public ordering: sortOrder ascending, then first publication, then title. */
export const comparePublicOrder = (a: Pick<CaseStudyRecord, "sortOrder" | "firstPublishedAt" | "title">, b: typeof a) =>
  a.sortOrder - b.sortOrder || (a.firstPublishedAt?.getTime() ?? 0) - (b.firstPublishedAt?.getTime() ?? 0) || a.title.localeCompare(b.title);

export const groupTitle = (group: CaseStudyContent["group"]) => caseStudyGroupLabels[group];

/* Public detail resolution --------------------------------------------------------------------- */

export type CaseStudyPageResult =
  | { kind: "found"; project: PublicCaseStudy; next: PublicCaseStudy | null; total: number }
  | { kind: "redirect"; slug: string }
  | { kind: "missing" };

/**
 * Which page a slug gets, from the published set (public order) and the redirect lookup:
 * a current published slug always wins; an old slug redirects only to a slug that is
 * currently published and different (one hop, never a loop); anything else is missing.
 */
export function resolveCaseStudyPage(published: PublicCaseStudy[], slug: string, redirectTarget: string | null): CaseStudyPageResult {
  const index = published.findIndex((p) => p.slug === slug);
  if (index !== -1) return { kind: "found", project: published[index], next: published.length > 1 ? published[(index + 1) % published.length] : null, total: published.length };
  if (redirectTarget && redirectTarget !== slug && published.some((p) => p.slug === redirectTarget)) return { kind: "redirect", slug: redirectTarget };
  return { kind: "missing" };
}
