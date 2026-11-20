import "server-only";

/**
 * Blog — public reads (listing, article, redirects, sitemap). SERVER-ONLY.
 * Only PUBLISHED, non-deleted posts are read. Cached with `'use cache'` under BLOG_CACHE_TAG
 * (expired immediately by every admin change that affects the public site) and refreshed
 * hourly as a safety net for out-of-band changes (the migration script).
 */

import { cacheLife, cacheTag } from "next/cache";
import { withDb } from "@/lib/db/mongoose";
import { BlogPostModel } from "@/lib/db/models/BlogPost";
import { CASE_STUDY_SLUG_PATTERN } from "@/lib/case-studies/constants";
import { BLOG_CACHE_TAG } from "./constants";
import { toBlogRecord } from "./repository";
import { comparePublicBlog, resolveArticlePage, toPublicArticle, type ArticlePageResult, type PublicBlogArticle } from "./rules";

const PUBLIC = { status: "PUBLISHED", deletedAt: null } as const;
const PUBLIC_FIELDS = "-createdBy -updatedBy -deletedBy -activeSlug -migration";

/** Every published article, newest first (with bodies: the set is small and fully cached). */
export async function getPublishedArticles(): Promise<PublicBlogArticle[]> {
  "use cache";
  cacheTag(BLOG_CACHE_TAG);
  cacheLife("hours");
  const docs = await withDb(() => BlogPostModel.find(PUBLIC).select(PUBLIC_FIELDS).lean());
  return docs
    .map((d) => toPublicArticle(toBlogRecord({ ...d, migration: null })))
    .filter((a) => a.image.src) // published posts always have a cover; guard against bad data
    .sort(comparePublicBlog);
}

/** Current slug of the published article that used to live at `oldSlug`, if any. */
export async function findArticleRedirect(oldSlug: string): Promise<string | null> {
  "use cache";
  cacheTag(BLOG_CACHE_TAG);
  cacheLife("hours");
  if (!CASE_STUDY_SLUG_PATTERN.test(oldSlug)) return null;
  const doc = await withDb(() => BlogPostModel.findOne({ ...PUBLIC, previousSlugs: oldSlug }).select("slug").lean<{ slug: string }>());
  return doc && doc.slug !== oldSlug ? doc.slug : null;
}

export async function getArticlePage(slug: string): Promise<ArticlePageResult> {
  if (!CASE_STUDY_SLUG_PATTERN.test(slug)) return { kind: "missing" };
  const all = await getPublishedArticles();
  if (all.some((a) => a.slug === slug)) return resolveArticlePage(all, slug, null);
  return resolveArticlePage(all, slug, await findArticleRedirect(slug));
}
