import "server-only";

/**
 * Case Studies — public reads for the website (listing, detail, redirects, sitemap, Home).
 * SERVER-ONLY.
 *
 * Only PUBLISHED, non-deleted records are ever read here; drafts, archived and deleted
 * records cannot reach a public page or API. Results are cached with `'use cache'`, tagged
 * CASE_STUDIES_CACHE_TAG (invalidated immediately by every admin change that affects the
 * public site, see ./server.ts) and refreshed hourly as a safety net for out-of-band changes
 * (e.g. the migration script). Admin audit fields are never selected.
 */

import { cacheLife, cacheTag } from "next/cache";
import { withDb } from "@/lib/db/mongoose";
import { CaseStudyModel } from "@/lib/db/models/CaseStudy";
import { CASE_STUDIES_CACHE_TAG, CASE_STUDY_SLUG_PATTERN } from "./constants";
import { toRecord } from "./repository";
import { comparePublicOrder, resolveCaseStudyPage, toPublicCaseStudy, type CaseStudyPageResult } from "./rules";
import type { PublicCaseStudy, PublicCaseStudyListQuery } from "./types";

const PUBLIC = { status: "PUBLISHED", deletedAt: null } as const;
const PUBLIC_FIELDS = "-createdBy -updatedBy -deletedBy -activeSlug -migration";

/** Every published case study in public order (sortOrder, then first publication). */
export async function getPublishedCaseStudies(): Promise<PublicCaseStudy[]> {
  "use cache";
  cacheTag(CASE_STUDIES_CACHE_TAG);
  cacheLife("hours");
  const docs = await withDb(() => CaseStudyModel.find(PUBLIC).select(PUBLIC_FIELDS).lean());
  return docs
    .map((d) => toRecord({ ...d, migration: null }))
    .sort(comparePublicOrder)
    .map((record, i) => toPublicCaseStudy(record, i + 1));
}

/** Current slug of the published record that used to live at `oldSlug`, if any. */
export async function findCaseStudyRedirect(oldSlug: string): Promise<string | null> {
  "use cache";
  cacheTag(CASE_STUDIES_CACHE_TAG);
  cacheLife("hours");
  if (!CASE_STUDY_SLUG_PATTERN.test(oldSlug)) return null;
  const doc = await withDb(() => CaseStudyModel.findOne({ ...PUBLIC, previousSlugs: oldSlug }).select("slug").lean<{ slug: string }>());
  return doc && doc.slug !== oldSlug ? doc.slug : null;
}

/**
 * Detail page lookup. A current published slug always wins; otherwise an old slug of a
 * published record redirects to its current slug (one hop, never to itself). Everything
 * else (unknown, draft, archived, deleted) is "missing" → 404.
 */
export async function getCaseStudyPage(slug: string): Promise<CaseStudyPageResult> {
  if (!CASE_STUDY_SLUG_PATTERN.test(slug)) return { kind: "missing" };
  const all = await getPublishedCaseStudies();
  if (all.some((p) => p.slug === slug)) return resolveCaseStudyPage(all, slug, null);
  return resolveCaseStudyPage(all, slug, await findCaseStudyRedirect(slug));
}

/** Public API listing over the cached published set (filters, search, paging). */
export async function listPublicCaseStudies(q: PublicCaseStudyListQuery) {
  const all = await getPublishedCaseStudies();
  const needle = q.search?.toLowerCase();
  const matching = all.filter(
    (p) =>
      (!q.category || p.discipline === q.category) &&
      (!q.filter || p.filters.includes(q.filter)) &&
      (q.featured === undefined || p.featured === q.featured) &&
      (!q.serviceId || p.serviceIds.includes(q.serviceId)) &&
      (!needle || p.title.toLowerCase().includes(needle) || p.highlight.toLowerCase().includes(needle)),
  );
  const ordered = q.sort === "newest" ? [...matching].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)) : matching;
  const start = (q.page - 1) * q.pageSize;
  return {
    items: ordered.slice(start, start + q.pageSize),
    total: ordered.length,
    page: q.page,
    pageSize: q.pageSize,
    pages: Math.max(1, Math.ceil(ordered.length / q.pageSize)),
  };
}
