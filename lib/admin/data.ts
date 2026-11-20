import "server-only";

/**
 * CULT.URE Admin — DEMO DATA. SERVER-ONLY (imported by the dashboard Server Component).
 *
 * Only the Blog admin's preview data remains here. Subscribers and enquiries are NOT here: they are
 * real records in MongoDB (lib/enquiries/repository.ts).
 *
 * Replace each collection with a MongoDB/API query later; the dashboard reads only the
 * exported collections through lib/admin/dashboard-utils.ts.
 *
 * Case studies are NOT here: they are MongoDB records (lib/case-studies, collection
 * case_studies), managed in /admin/case-studies and migrated from the approved content by
 * scripts/migrate-case-studies.mjs.
 */

import { blogArticles, featuredArticle } from "@/lib/content/blog";

export const IS_DEMO_DATA = true;


/* ---------------------------------------------------------------
   Types
---------------------------------------------------------------- */

import { BLOG_DEFAULT_AUTHOR, type BlogPost } from "./types";
import { emptyDoc } from "@/lib/rich-text";
import { isBlogPublished } from "@/lib/content/blog-publishing";
export type { BlogPost, BlogStatus, Subscriber, SubscriberSource, SubscriberStatus } from "./types";

/** Dashboard name for blog records (same type as the Blog admin). */
export type AdminBlog = BlogPost;




/* Enquiries: no longer here. Real enquiries live in MongoDB (lib/enquiries/repository.ts);
   the fictional demo set moved to the dev-only seed script scripts/seed-dev-enquiries.mjs. */

/* ---------------------------------------------------------------
   Blogs (the Blog page sample articles; DRAFT unless on the blog publishing list with a body)
---------------------------------------------------------------- */

const topicLabel: Record<string, string> = {
  "brand-strategy": "Brand Strategy",
  marketing: "Marketing",
  content: "Content",
  growth: "Growth",
  design: "Design",
};

export const blogs: BlogPost[] = [featuredArticle, ...blogArticles].map((article) => {
  const isPublic = isBlogPublished(article.slug) && article.content !== null;
  return {
    id: `blog-${article.slug}`,
    title: article.title,
    slug: article.slug,
    excerpt: article.description,
    content: article.content ?? emptyDoc(),
    coverImage: article.image.src,
    coverImageAlt: article.image.alt,
    coverCaption: "",
    category: topicLabel[article.topic] ?? article.topic,
    tags: [...article.tags],
    author: BLOG_DEFAULT_AUTHOR,
    status: isPublic ? "PUBLISHED" : "DRAFT",
    seoTitle: "",
    seoDescription: "",
    publishedAt: isPublic ? `${article.date}T10:00:00+05:30` : null,
    createdAt: `${article.date}T10:00:00+05:30`,
    updatedAt: `${article.date}T16:00:00+05:30`,
    publicSlug: isPublic ? article.slug : null,
    isLocal: false,
  };
});

/** Site images offered by the blog image pickers (existing local assets; replace with a media library later). */
export const blogImageLibrary = [
  ...new Map(
    [featuredArticle, ...blogArticles, { image: { src: "/images/blog/hero-burgundy-architecture.jpg", alt: "Burgundy-toned architecture" } }].map((a) => [a.image.src, { src: a.image.src, alt: a.image.alt }]),
  ).values(),
];

/* Subscribers: no longer here. Real subscribers live in MongoDB (lib/subscribers/repository.ts). */

