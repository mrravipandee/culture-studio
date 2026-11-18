/**
 * CULT.URE — Blog (UI preview). MOCK DATA ONLY.
 *
 * Everything here is temporary sample content for the Blog page design: the articles
 * are not published, topic counts and the page count are illustrative, and images are
 * temporary graded crops of existing site photos (/public/images/blog/), not article
 * photography. Replace this file with CMS data later; the components only read from it.
 *
 * The page is noindex and left out of the sitemap while this is sample content.
 * An article is public at /blog/<slug> only when its slug is in lib/content/blog-publishing.ts
 * AND it has a body (`content`).
 */

import type { RichNode } from "@/lib/rich-text";
import { isBlogPublished } from "./blog-publishing";

export type BlogTopicId = "brand-strategy" | "marketing" | "content" | "growth" | "design";

export interface BlogImage {
  src: string;
  alt: string;
  /** CSS object-position for the crop. */
  position?: string;
}

export interface BlogArticle {
  slug: string;
  topic: BlogTopicId;
  title: string;
  /** Excerpt: shown on cards and as the default meta description. */
  description: string;
  /** ISO date (sample). */
  date: string;
  /** Listing label for the sample cards. Real articles compute it from `content`. */
  readingTime: string;
  image: BlogImage;
  /** Article body (lib/rich-text.ts JSON). null = not written yet (none of the samples have a body). */
  content: RichNode | null;
  tags: string[];
}

/** Shown on every article (no individual authors yet). */
export const blogAuthor = { name: "CULT.URE", initial: "C" };

export const blogHero = {
  eyebrow: "The blog",
  title: "The CULT.URE",
  accent: "Journal",
  description: "Ideas, insights and stories at the intersection of brand, marketing, content and culture.",
  image: { src: "/images/blog/hero-burgundy-architecture.jpg", alt: "" },
};

export const featuredArticle: BlogArticle = {
  slug: "how-to-build-a-brand-people-remember",
  topic: "brand-strategy",
  title: "How to Build a Brand That People Actually Remember",
  description: "A practical look at the key elements of memorable brand building in a noisy digital world.",
  date: "2026-11-14",
  readingTime: "6 min read",
  image: {
    src: "/images/blog/featured-studio-interior.jpg",
    alt: "A studio wall of framed prints in warm burgundy light",
    position: "50% 40%",
  },
  content: null,
  tags: [],
};

/** Illustrative topic list and counts (UI preview; replace with real counts). */
export const blogTopics: { id: BlogTopicId; label: string; count: number }[] = [
  { id: "brand-strategy", label: "Brand Strategy", count: 6 },
  { id: "marketing", label: "Marketing", count: 5 },
  { id: "content", label: "Content", count: 4 },
  { id: "growth", label: "Growth", count: 4 },
  { id: "design", label: "Design", count: 3 },
];

/** Illustrative totals for the "All Posts" chip and pagination. */
export const blogTotals = { posts: 24, pages: 8 };

export const blogArticles: BlogArticle[] = [
  {
    slug: "brand-positioning-foundation-for-scalable-growth",
    topic: "brand-strategy",
    title: "Brand Positioning: The Foundation for Scalable Growth",
    description: "Why clear positioning matters and how it helps you attract the right audience.",
    date: "2026-11-10",
    readingTime: "5 min read",
    image: { src: "/images/blog/article-workspace-laptop.jpg", alt: "A laptop on a long desk by tall windows" },
    content: null,
    tags: [],
  },
  {
    slug: "performance-marketing-vs-brand-marketing",
    topic: "marketing",
    title: "Performance Marketing vs Brand Marketing: Where to Invest?",
    description: "A simple framework to decide when to focus on performance, brand or both.",
    date: "2026-11-07",
    readingTime: "6 min read",
    image: { src: "/images/blog/article-abstract-burgundy-ivory.jpg", alt: "Abstract burgundy and ivory curves" },
    content: null,
    tags: [],
  },
  {
    slug: "content-that-converts-a-practical-playbook",
    topic: "content",
    title: "Content That Converts: A Practical Playbook",
    description: "How to plan, create and distribute content that drives real business results.",
    date: "2026-11-03",
    readingTime: "5 min read",
    image: { src: "/images/blog/article-creative-tools.jpg", alt: "A camera and lenses on a dark desk", position: "50% 35%" },
    content: null,
    tags: [],
  },
];

export const blogNewsletter = {
  eyebrow: "Stay in the loop",
  title: "Ideas, Insights & Updates.",
  description: "Get our latest articles on brand, marketing and growth.",
  placeholder: "Enter your email",
  button: "Subscribe",
  /** Shown on submit: nothing is sent. */
  notConnected: "Newsletter sign-up isn’t connected yet, so nothing was sent. Please check back soon.",
};

/** "Nov 14, 2026" */
export const formatBlogDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/* ---------------------------------------------------------------
   Public articles: on the publishing list AND with a body.
---------------------------------------------------------------- */


export const publicBlogArticles = [featuredArticle, ...blogArticles].filter((a) => isBlogPublished(a.slug) && a.content !== null);
export const isBlogArticlePublic = (slug: string) => publicBlogArticles.some((a) => a.slug === slug);
