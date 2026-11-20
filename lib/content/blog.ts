/**
 * CULT.URE — Blog: page copy, shared types, and the four launch articles (SOURCE CONTENT).
 *
 * Since the Blog CMS, MongoDB (collection blog_posts) is the source of truth for what the
 * site shows: lib/blog/public.ts reads PUBLISHED posts only. The launch articles below are
 * kept as the source the migration imports (scripts/migrate-blog.mjs → lib/blog/migration.ts).
 * Their cover images are temporary graded crops of existing site photos (/public/images/blog/).
 */

import { countWords, readingTimeLabel, type RichNode } from "@/lib/rich-text";
import { contentThatConvertsBody, memorableBrandBody, performanceVsBrandBody, positioningBody } from "./blog-bodies";

/**
 * The launch articles' copy is awaiting the team's review. While true, article pages are
 * noindex and left out of the sitemap (they are still readable at /blog/<slug>).
 * Set to false once the text is approved.
 */
export const BLOG_COPY_IN_REVIEW = true;

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
  content: memorableBrandBody,
  tags: [],
};

/** Topics in display order (the admin categories). Counts are computed from published posts. */
export const blogTopics: { id: BlogTopicId; label: string }[] = [
  { id: "brand-strategy", label: "Brand Strategy" },
  { id: "marketing", label: "Marketing" },
  { id: "content", label: "Content" },
  { id: "growth", label: "Growth" },
  { id: "design", label: "Design" },
];

export const blogTopicLabel = (id: string) => blogTopics.find((t) => t.id === id)?.label ?? "";

/** Topic chips with real counts (only topics that have articles). */
export const topicCounts = (articles: readonly Pick<BlogArticle, "topic">[]) =>
  blogTopics.map((t) => ({ ...t, count: articles.filter((a) => a.topic === t.id).length })).filter((t) => t.count > 0);

export const blogArticles: BlogArticle[] = [
  {
    slug: "brand-positioning-foundation-for-scalable-growth",
    topic: "brand-strategy",
    title: "Brand Positioning: The Foundation for Scalable Growth",
    description: "Why clear positioning matters and how it helps you attract the right audience.",
    date: "2026-11-10",
    readingTime: "5 min read",
    image: { src: "/images/blog/article-workspace-laptop.jpg", alt: "A laptop on a long desk by tall windows" },
    content: positioningBody,
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
    content: performanceVsBrandBody,
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
    content: contentThatConvertsBody,
    tags: [],
  },
];

export const blogNewsletter = {
  eyebrow: "Stay in the loop",
  title: "Ideas, Insights & Updates.",
  description: "Get our latest articles on brand, marketing and growth.",
  placeholder: "Enter your email",
  button: "Subscribe",
  /** Shown after a successful sign-up (the address is saved; no email is sent). */
  success: { title: "Thank you for subscribing.", body: "Your email has been added to the CULT.URE list." },
};

/** "Nov 14, 2026" */
export const formatBlogDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** Reading time from the body when it exists, otherwise the stored label. */
export const articleReadingTime = (a: Pick<BlogArticle, "content" | "readingTime">) => (a.content ? readingTimeLabel(countWords(a.content)) : a.readingTime);
