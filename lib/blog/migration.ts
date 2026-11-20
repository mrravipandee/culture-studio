/**
 * Blog launch-article migration — records and planning (pure; used by scripts/migrate-blog.mjs
 * and the tests).
 *
 * Source: the four launch articles in lib/content/blog.ts (featured + three) and their bodies
 * (lib/content/blog-bodies.ts), exactly as written; nothing is added. Status: PUBLISHED only
 * for slugs on lib/content/blog-publishing.ts that have a body, otherwise DRAFT. The shown
 * date is the article's own date. Bodies go through the same sanitiser as admin saves.
 * Stable keys + content hashes make re-runs safe (see the case-study migration for the
 * same rules: never duplicates, never overwrites admin edits or deletions).
 */

import { featuredArticle, blogArticles, type BlogArticle } from "@/lib/content/blog";
import { publishedBlogSlugs } from "@/lib/content/blog-publishing";
import { contentHash, planMigration, summarize, type ExistingMigrated, type MigrationStep } from "@/lib/case-studies/migration";
import { BLOG_CATEGORY_TOPIC, BLOG_DEFAULT_AUTHOR, type BlogCategory } from "./constants";
import { sanitizeRichDoc } from "./content";
import type { BlogContent } from "./rules";

export const BLOG_MIGRATION_PREFIX = "blog-launch-2026-11";
export const blogMigrationKey = (slug: string) => `${BLOG_MIGRATION_PREFIX}:${slug}`;

const categoryFor = (topic: BlogArticle["topic"]) => (Object.entries(BLOG_CATEGORY_TOPIC).find(([, id]) => id === topic)?.[0] ?? undefined) as BlogCategory | undefined;

export interface BlogMigrationRecord {
  key: string;
  hash: string;
  status: "DRAFT" | "PUBLISHED";
  content: BlogContent;
  sanitizeErrors: string[];
}

export function toBlogMigrationContent(a: BlogArticle): { content: BlogContent; errors: string[] } {
  const body = sanitizeRichDoc(a.content ?? { type: "doc", content: [{ type: "paragraph" }] });
  const category = categoryFor(a.topic);
  return {
    errors: body.errors,
    content: {
      title: a.title,
      slug: a.slug,
      excerpt: a.description,
      content: body.doc,
      ...(category ? { category } : {}),
      tags: [...a.tags],
      author: BLOG_DEFAULT_AUTHOR,
      coverImage: { url: a.image.src, alt: a.image.alt, caption: "" },
      displayDate: a.date,
      seo: {},
    },
  };
}

export function buildBlogMigrationRecords(source: readonly BlogArticle[] = [featuredArticle, ...blogArticles], approved: readonly string[] = publishedBlogSlugs): BlogMigrationRecord[] {
  return source.map((a) => {
    const { content, errors } = toBlogMigrationContent(a);
    const status = approved.includes(a.slug) && a.content !== null ? "PUBLISHED" : "DRAFT";
    return { key: blogMigrationKey(a.slug), hash: contentHash({ content, status }), status, content, sanitizeErrors: errors };
  });
}

/** Same planner as case studies (insert / update / skip-edited / skip-deleted / conflict). */
export const planBlogMigration = (records: BlogMigrationRecord[], existingByKey: Map<string, ExistingMigrated>, activeSlugs: Set<string>): MigrationStep<BlogMigrationRecord>[] =>
  planMigration(records, existingByKey, activeSlugs);

export { summarize };
