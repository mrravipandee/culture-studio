/**
 * Blog — domain rules (pure). CLIENT-SAFE.
 * Publishing readiness, SEO fallbacks, reading time, and mapping a stored record to the admin
 * DTOs and to the public article shape the Blog components already render.
 */

import { countWords, hasContent, inspectDoc, readingMinutes, readingTimeLabel, type RichNode } from "@/lib/rich-text";
import type { BlogArticle } from "@/lib/content/blog";
import type { BlogPost, BlogSummary } from "@/lib/admin/types";
import { BLOG_CATEGORY_TOPIC, BLOG_LIMITS as L, type BlogCategory, type BlogPostStatus } from "./constants";

export interface BlogCover {
  url: string;
  publicId?: string;
  alt: string;
  caption: string;
}

/** Everything an admin edits. */
export interface BlogContent {
  title: string;
  slug: string;
  excerpt: string;
  content: RichNode;
  category?: BlogCategory;
  tags: string[];
  author: string;
  coverImage: BlogCover | null;
  displayDate: string | null;
  seo: { title?: string; description?: string };
}

export interface BlogRecord extends BlogContent {
  id: string;
  status: BlogPostStatus;
  publishedAt: Date | null;
  firstPublishedAt: Date | null;
  previousSlugs: string[];
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  migration: { key: string; hash: string; appliedAt: Date } | null;
}

export type PublishIssues = Record<string, string>;

/**
 * A complete, safe article: title, slug, excerpt, category, a body with text or images,
 * alt text on every image, no H1 inside the body (the title is the page's H1), and a cover
 * image with alt text. SEO fields are optional (fallback: title / excerpt).
 */
export function blogPublishIssues(p: BlogContent): PublishIssues {
  const e: PublishIssues = {};
  if (!p.title.trim()) e.title = "Enter a title.";
  if (!p.slug) e.slug = "Enter a slug.";
  if (!p.excerpt.trim()) e.excerpt = "Write a short excerpt before publishing.";
  if (!p.category) e.category = "Choose a category before publishing.";
  const issues = inspectDoc(p.content);
  if (!hasContent(p.content)) e.content = "Write the article before publishing.";
  else if (issues.unknownTypes.length || issues.unsafeLinks || issues.unsafeImages) e.content = "The article contains content that can't be published.";
  else if (issues.imagesWithoutAlt) e.content = `Add alt text to ${issues.imagesWithoutAlt === 1 ? "the image" : `${issues.imagesWithoutAlt} images`} in the article.`;
  else if (issues.h1Count) e.content = "Use H2 for sections: the article title is already the page's H1.";
  if (!p.coverImage) e.coverImage = "Add a cover image before publishing.";
  else if (!p.coverImage.alt.trim()) e.coverImageAlt = "Describe the cover image for screen readers.";
  return e;
}

export const blogSeoFor = (p: Pick<BlogContent, "title" | "excerpt" | "seo">) => ({
  title: p.seo.title || p.title,
  description: p.seo.description || p.excerpt,
});

export const wordCountOf = (doc: RichNode) => countWords(doc);

const iso = (d: Date | null) => (d ? d.toISOString() : null);
/** YYYY-MM-DD in India time. */
export const istDay = (d: Date) => new Date(d.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);

export function toBlogSummary(r: BlogRecord): BlogSummary {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    coverImage: r.coverImage?.url ?? null,
    coverImagePublicId: r.coverImage?.publicId ?? null,
    coverImageAlt: r.coverImage?.alt ?? "",
    coverCaption: r.coverImage?.caption ?? "",
    category: r.category ?? "",
    tags: [...r.tags],
    author: r.author,
    status: r.status,
    seoTitle: r.seo.title ?? "",
    seoDescription: r.seo.description ?? "",
    displayDate: r.displayDate,
    publishedAt: iso(r.publishedAt),
    firstPublishedAt: iso(r.firstPublishedAt),
    previousSlugs: [...r.previousSlugs],
    wordCount: r.wordCount,
    readingMinutes: readingMinutes(r.wordCount),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    publicSlug: r.status === "PUBLISHED" ? r.slug : null,
  };
}

export const toBlogPost = (r: BlogRecord): BlogPost => ({ ...toBlogSummary(r), content: r.content });

/** Public article (the shape BlogCard / FeaturedArticle / the article page render). */
export interface PublicBlogArticle extends BlogArticle {
  author: string;
  caption: string;
  seo: { title: string; description: string };
  publishedAt: string;
  updatedAt: string;
}

export function toPublicArticle(r: BlogRecord): PublicBlogArticle {
  const published = r.publishedAt ?? r.updatedAt;
  const seo = blogSeoFor(r);
  return {
    slug: r.slug,
    topic: r.category ? BLOG_CATEGORY_TOPIC[r.category] : "brand-strategy",
    title: r.title,
    description: r.excerpt,
    date: r.displayDate ?? istDay(published),
    readingTime: r.wordCount ? readingTimeLabel(r.wordCount) : "",
    image: { src: r.coverImage?.url ?? "", alt: r.coverImage?.alt ?? "" },
    content: r.content,
    tags: [...r.tags],
    author: r.author,
    caption: r.coverImage?.caption ?? "",
    seo: { title: seo.title.slice(0, L.title), description: seo.description },
    publishedAt: published.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/** Public order: newest shown date first, then newest publication. */
export const comparePublicBlog = (a: PublicBlogArticle, b: PublicBlogArticle) => b.date.localeCompare(a.date) || b.publishedAt.localeCompare(a.publishedAt);

/* Public article resolution ------------------------------------------------------------- */

export type ArticlePageResult =
  | { kind: "found"; article: PublicBlogArticle; next: PublicBlogArticle | null }
  | { kind: "redirect"; slug: string }
  | { kind: "missing" };

/** current slug wins; an old slug redirects once to a live article. */
export function resolveArticlePage(all: PublicBlogArticle[], slug: string, redirectTarget: string | null): ArticlePageResult {
  const index = all.findIndex((a) => a.slug === slug);
  if (index !== -1) return { kind: "found", article: all[index], next: all.length > 1 ? all[(index + 1) % all.length] : null };
  if (redirectTarget && redirectTarget !== slug && all.some((a) => a.slug === redirectTarget)) return { kind: "redirect", slug: redirectTarget };
  return { kind: "missing" };
}

