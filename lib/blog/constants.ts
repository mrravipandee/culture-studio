/**
 * Blog — shared constants. CLIENT-SAFE (no data, no server imports).
 * Used by the model, validation, service, public pages and the admin UI.
 */

import { BLOG_CATEGORIES, BLOG_DEFAULT_AUTHOR } from "@/lib/admin/types";
import type { BlogTopicId } from "@/lib/content/blog";

export { BLOG_CATEGORIES, BLOG_DEFAULT_AUTHOR };
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type BlogPostStatus = (typeof BLOG_STATUSES)[number];

/** Admin category label ↔ public topic id (the Blog page's "Explore by Topic" chips). */
export const BLOG_CATEGORY_TOPIC: Record<BlogCategory, BlogTopicId> = {
  "Brand Strategy": "brand-strategy",
  Marketing: "marketing",
  Content: "content",
  Growth: "growth",
  Design: "design",
};

export const BLOG_LIMITS = {
  title: 120,
  slug: 80,
  excerpt: 300,
  tag: 30,
  tags: 8,
  author: 60,
  alt: 160,
  caption: 200,
  seoTitle: 70,
  seoDescription: 200,
  /** Serialised article body (JSON) cap, and structural caps for the sanitiser. */
  contentBytes: 200 * 1024,
  contentNodes: 5000,
  contentDepth: 12,
  contentImages: 40,
  textLength: 20_000,
  previousSlugs: 20,
  search: 120,
} as const;

/** Cache tag on every cached public blog read (listing, article, redirects, sitemap). */
export const BLOG_CACHE_TAG = "blog";

/** Request body caps (bytes): content + metadata, with JSON overhead. */
export const BLOG_BODY_MAX = 320 * 1024;
export const BLOG_LIST_MAX = 1000;
export const BLOG_BULK_MAX = 100;

/** Public listing page size (Blog page grid). */
export const BLOG_PUBLIC_PAGE_SIZE = 9;
