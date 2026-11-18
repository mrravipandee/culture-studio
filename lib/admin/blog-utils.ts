/**
 * Blog admin helpers: counts, search/filters, form values, validation, SEO defaults.
 * Pure and client-safe (types only + rich-text helpers).
 */

import { BLOG_CATEGORIES, BLOG_DEFAULT_AUTHOR, type BlogPost, type BlogStatus } from "./types";
import { countWords, emptyDoc, hasContent, inspectDoc, isSafeImageSrc, readingTimeLabel, type RichNode } from "@/lib/rich-text";
import { SLUG_PATTERN, slugify } from "./case-study-utils";

export { slugify, SLUG_PATTERN };

/* Counts ---------------------------------------------------------------------------------- */

export const getTotalBlogs = (list: BlogPost[]) => list.length;
export const getPublishedBlogCount = (list: BlogPost[]) => list.filter((b) => b.status === "PUBLISHED").length;
export const getDraftBlogCount = (list: BlogPost[]) => list.filter((b) => b.status === "DRAFT").length;
export const getBlogsWithBody = (list: BlogPost[]) => list.filter((b) => hasContent(b.content)).length;

/* Search and filters -------------------------------------------------------------------------- */

export interface BlogFilters {
  search: string;
  status: BlogStatus | "all";
  category: string | "all";
}

export const emptyBlogFilters: BlogFilters = { search: "", status: "all", category: "all" };
export const hasBlogFilters = (f: BlogFilters) => f.search.trim() !== "" || f.status !== "all" || f.category !== "all";

/** Case-insensitive search over title, slug, category, tags and author. */
export function matchesBlog(b: BlogPost, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [b.title, b.slug, b.category, b.author, ...b.tags].some((field) => field.toLowerCase().includes(q));
}

const time = (iso: string | null) => (iso ? Date.parse(iso) || 0 : 0);

/** Newest activity first. */
export const sortBlogs = (list: BlogPost[]) => [...list].sort((a, b) => time(b.updatedAt) - time(a.updatedAt));

export const filterBlogs = (list: BlogPost[], f: BlogFilters) =>
  sortBlogs(list.filter((b) => (f.status === "all" || b.status === f.status) && (f.category === "all" || b.category === f.category) && matchesBlog(b, f.search)));

export const BLOG_PAGE_SIZE = 6;

/* Form ------------------------------------------------------------------------------------- */

export interface BlogFormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: RichNode;
  coverImage: string | null;
  coverImageAlt: string;
  coverCaption: string;
  category: string;
  tags: string[];
  author: string;
  /** YYYY-MM-DD; empty = today when publishing. */
  publishDate: string;
  seoTitle: string;
  seoDescription: string;
}

export const BLOG_LIMITS = {
  title: 120,
  excerpt: 300,
  excerptIdeal: [120, 180] as const,
  tag: 30,
  tags: 8,
  author: 60,
  alt: 160,
  caption: 200,
  seoTitle: 70,
  seoTitleIdeal: 60,
  seoDescription: 200,
  seoDescriptionIdeal: 160,
} as const;

export const emptyBlogForm = (): BlogFormValues => ({
  title: "",
  slug: "",
  excerpt: "",
  content: emptyDoc(),
  coverImage: null,
  coverImageAlt: "",
  coverCaption: "",
  category: "",
  tags: [],
  author: BLOG_DEFAULT_AUTHOR,
  publishDate: "",
  seoTitle: "",
  seoDescription: "",
});

const isoDay = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");

export const blogToForm = (b: BlogPost): BlogFormValues => ({
  title: b.title,
  slug: b.slug,
  excerpt: b.excerpt,
  content: b.content,
  coverImage: b.coverImage,
  coverImageAlt: b.coverImageAlt,
  coverCaption: b.coverCaption,
  category: b.category,
  tags: [...b.tags],
  author: b.author,
  publishDate: isoDay(b.publishedAt),
  seoTitle: b.seoTitle,
  seoDescription: b.seoDescription,
});

/** Trim free text. */
export const normaliseBlogForm = (v: BlogFormValues): BlogFormValues => ({
  ...v,
  title: v.title.trim(),
  slug: v.slug.trim(),
  excerpt: v.excerpt.trim(),
  coverImageAlt: v.coverImageAlt.trim(),
  coverCaption: v.coverCaption.trim(),
  author: v.author.trim() || BLOG_DEFAULT_AUTHOR,
  tags: v.tags.map((t) => t.trim()).filter(Boolean),
  seoTitle: v.seoTitle.trim(),
  seoDescription: v.seoDescription.trim(),
});

/** Tag input: trimmed, collapsed spaces, length-limited. Returns an error message or the clean tag. */
export function cleanTag(raw: string, existing: string[]): { tag?: string; error?: string } {
  const tag = raw.replace(/\s+/g, " ").trim();
  if (!tag) return { error: "Type a tag first." };
  if (tag.length > BLOG_LIMITS.tag) return { error: `Keep tags under ${BLOG_LIMITS.tag} characters.` };
  if (existing.some((t) => t.toLowerCase() === tag.toLowerCase())) return { error: "That tag is already added." };
  if (existing.length >= BLOG_LIMITS.tags) return { error: `Use up to ${BLOG_LIMITS.tags} tags.` };
  return { tag };
}

export type BlogFormErrors = Partial<Record<keyof BlogFormValues, string>>;

/**
 * Drafts only need a valid title and slug (work in progress is fine). Publishing needs a
 * complete, safe article: excerpt, body, category, cover with alt text, valid links/images
 * and no H1 inside the body (the title is the page's H1).
 */
export function validateBlog(raw: BlogFormValues, opts: { takenSlugs: string[]; intent: "draft" | "publish"; today?: string }): BlogFormErrors {
  const v = normaliseBlogForm(raw);
  const e: BlogFormErrors = {};
  const publishing = opts.intent === "publish";

  if (!v.title) e.title = "Enter a title.";
  else if (v.title.length > BLOG_LIMITS.title) e.title = `Keep the title under ${BLOG_LIMITS.title} characters.`;

  if (!v.slug) e.slug = "Enter a slug.";
  else if (!SLUG_PATTERN.test(v.slug)) e.slug = "Use lowercase letters, numbers and single hyphens only.";
  else if (opts.takenSlugs.includes(v.slug)) e.slug = "Another article already uses this slug.";

  if (v.excerpt.length > BLOG_LIMITS.excerpt) e.excerpt = `Keep the excerpt under ${BLOG_LIMITS.excerpt} characters.`;
  else if (publishing && !v.excerpt) e.excerpt = "Write a short excerpt before publishing.";

  if (v.category && !(BLOG_CATEGORIES as readonly string[]).includes(v.category)) e.category = "Choose a category from the list.";
  else if (publishing && !v.category) e.category = "Choose a category before publishing.";

  if (new Set(v.tags.map((t) => t.toLowerCase())).size !== v.tags.length) e.tags = "Remove duplicate tags.";
  else if (v.tags.some((t) => t.length > BLOG_LIMITS.tag)) e.tags = `Keep tags under ${BLOG_LIMITS.tag} characters.`;

  if (v.author.length > BLOG_LIMITS.author) e.author = `Keep the author name under ${BLOG_LIMITS.author} characters.`;

  // Content
  const issues = inspectDoc(v.content, true);
  if (issues.unknownTypes.length) e.content = "The article contains content that can't be published. Remove the unsupported block and try again.";
  else if (issues.unsafeLinks) e.content = `${issues.unsafeLinks === 1 ? "A link uses" : `${issues.unsafeLinks} links use`} an invalid or unsafe address. Edit or remove ${issues.unsafeLinks === 1 ? "it" : "them"}.`;
  else if (issues.unsafeImages) e.content = "An image in the article has an invalid address. Replace or remove it.";
  else if (publishing && !hasContent(v.content)) e.content = "Write the article before publishing.";
  else if (publishing && issues.imagesWithoutAlt) e.content = `Add alt text to ${issues.imagesWithoutAlt === 1 ? "the image" : `${issues.imagesWithoutAlt} images`} in the article.`;
  else if (publishing && issues.h1Count) e.content = "Use H2 for sections: the article title is already the page's H1.";

  // Cover
  if (v.coverImage && !isSafeImageSrc(v.coverImage, true)) e.coverImage = "The cover image address is not valid.";
  else if (publishing && !v.coverImage) e.coverImage = "Add a cover image before publishing.";
  if (v.coverImage && !v.coverImageAlt && publishing) e.coverImageAlt = "Describe the cover image for screen readers.";
  else if (v.coverImageAlt.length > BLOG_LIMITS.alt) e.coverImageAlt = `Keep this under ${BLOG_LIMITS.alt} characters.`;
  if (v.coverCaption.length > BLOG_LIMITS.caption) e.coverCaption = `Keep the caption under ${BLOG_LIMITS.caption} characters.`;

  // Date: no scheduling (publishing is immediate); a past date is allowed for back-dating.
  if (v.publishDate) {
    const t = Date.parse(`${v.publishDate}T00:00:00Z`);
    const today = opts.today ?? new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.publishDate) || Number.isNaN(t)) e.publishDate = "Enter a valid date.";
    else if (v.publishDate > today) e.publishDate = "Scheduling isn't available yet. Choose today or an earlier date.";
  }

  // SEO
  if (v.seoTitle.length > BLOG_LIMITS.seoTitle) e.seoTitle = `Keep the SEO title under ${BLOG_LIMITS.seoTitle} characters.`;
  if (v.seoDescription.length > BLOG_LIMITS.seoDescription) e.seoDescription = `Keep the meta description under ${BLOG_LIMITS.seoDescription} characters.`;

  return e;
}

export const hasBlogErrors = (e: BlogFormErrors) => Object.keys(e).length > 0;

/* SEO and stats -------------------------------------------------------------------------------- */

export const seoTitleFor = (v: Pick<BlogFormValues, "seoTitle" | "title">) => v.seoTitle.trim() || v.title.trim();
export const seoDescriptionFor = (v: Pick<BlogFormValues, "seoDescription" | "excerpt">) => v.seoDescription.trim() || v.excerpt.trim();
export const canonicalFor = (siteUrl: string, slug: string) => `${siteUrl.replace(/\/$/, "")}/blog/${slug || "your-slug"}`;

export const blogStats = (content: RichNode) => {
  const words = countWords(content);
  return { words, readingTime: words ? readingTimeLabel(words) : "—" };
};

/* Display ---------------------------------------------------------------------------------------- */

const IST = "Asia/Kolkata";
export const formatBlogAdminDate = (iso: string | null, withTime = false) => {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const d = new Date(t);
  const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: IST }).format(d);
  return withTime ? `${date} at ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: IST }).format(d)}` : date;
};
