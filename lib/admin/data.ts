import "server-only";

/**
 * CULT.URE Admin — static admin data. SERVER-ONLY.
 *
 * No records live here any more: enquiries, subscribers, case studies and blog posts are all
 * MongoDB collections (lib/enquiries, lib/subscribers, lib/case-studies, lib/blog). What
 * remains is the list of existing site images offered by the blog image pickers (alongside
 * Cloudinary uploads).
 */

import { blogArticles, featuredArticle } from "@/lib/content/blog";

export type { BlogPost, BlogStatus, BlogSummary, Subscriber, SubscriberSource, SubscriberStatus } from "./types";

/** Site images offered by the blog image pickers (existing files under /public/images). */
export const blogImageLibrary = [
  ...new Map(
    [featuredArticle, ...blogArticles, { image: { src: "/images/blog/hero-burgundy-architecture.jpg", alt: "Burgundy-toned architecture" } }].map((a) => [a.image.src, { src: a.image.src, alt: a.image.alt }]),
  ).values(),
];
