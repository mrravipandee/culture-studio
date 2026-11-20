import "server-only";

/**
 * BlogPost — one article (collection: blog_posts). SERVER-ONLY.
 *
 * - strict: "throw": unknown top-level properties are never persisted.
 * - `content` is the article body as rich-text JSON. It is the one free-form field (a
 *   recursive document tree), and it is only ever written after the whitelist sanitiser
 *   (lib/blog/content.ts) has rebuilt it; size is capped there.
 * - status DRAFT | PUBLISHED, changed only by the service's publish / unpublish actions.
 *   publishedAt = start of the current publication; firstPublishedAt is kept for good.
 *   displayDate = optional date shown on the site (back-dating), YYYY-MM-DD.
 * - wordCount is derived from the body on every save (listings don't load bodies).
 * - Soft delete: deletedAt set and `activeSlug` removed; `activeSlug` carries the unique index
 *   so a slug is unique among non-deleted posts.
 * - previousSlugs: earlier public slugs that 308-redirect to the current one.
 * - migration: set only on posts created by scripts/migrate-blog.mjs.
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";
import { BLOG_CATEGORIES, BLOG_LIMITS as L, BLOG_STATUSES, type BlogCategory, type BlogPostStatus } from "@/lib/blog/constants";
import { CASE_STUDY_SLUG_PATTERN, IMAGE_URL_PATTERN } from "@/lib/case-studies/constants";
import type { RichNode } from "@/lib/rich-text";

export interface BlogPostDoc {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  activeSlug?: string;
  previousSlugs: string[];
  excerpt: string;
  content: RichNode;
  category?: BlogCategory;
  tags: string[];
  author: string;
  coverImage: { url: string; publicId?: string; alt: string; caption: string } | null;
  displayDate: string | null;
  seo: { title?: string; description?: string };
  status: BlogPostStatus;
  publishedAt: Date | null;
  firstPublishedAt: Date | null;
  wordCount: number;
  createdBy: Types.ObjectId | null;
  updatedBy: Types.ObjectId | null;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
  migration?: { key: string; hash: string; appliedAt: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}

const sub = { _id: false, strict: "throw" } as const;
const slugField = { type: String, trim: true, lowercase: true, maxlength: L.slug, match: CASE_STUDY_SLUG_PATTERN };

const coverSchema = new Schema(
  {
    url: { type: String, required: true, trim: true, maxlength: 400, match: IMAGE_URL_PATTERN },
    publicId: { type: String, trim: true, maxlength: 200 },
    alt: { type: String, trim: true, maxlength: L.alt, default: "" },
    caption: { type: String, trim: true, maxlength: L.caption, default: "" },
  },
  sub,
);
const seoSchema = new Schema({ title: { type: String, trim: true, maxlength: L.seoTitle }, description: { type: String, trim: true, maxlength: L.seoDescription } }, sub);
const migrationSchema = new Schema({ key: { type: String, required: true, maxlength: 120 }, hash: { type: String, required: true, match: /^[a-f0-9]{64}$/ }, appliedAt: { type: Date, required: true } }, sub);

const blogPostSchema = new Schema<BlogPostDoc>(
  {
    title: { type: String, required: true, trim: true, maxlength: L.title },
    slug: { ...slugField, required: true },
    activeSlug: slugField,
    previousSlugs: { type: [slugField], default: [], validate: { validator: (v: string[]) => v.length <= L.previousSlugs, message: "Too many previous slugs." } },
    excerpt: { type: String, trim: true, maxlength: L.excerpt, default: "" },
    // Sanitised rich-text JSON (lib/blog/content.ts). Mixed by necessity: a recursive tree.
    content: { type: Schema.Types.Mixed, required: true },
    category: { type: String, enum: BLOG_CATEGORIES },
    tags: { type: [{ type: String, trim: true, maxlength: L.tag }], default: [], validate: { validator: (v: string[]) => v.length <= L.tags, message: "Too many tags." } },
    author: { type: String, trim: true, maxlength: L.author, required: true },
    coverImage: { type: coverSchema, default: null },
    displayDate: { type: String, match: /^\d{4}-\d{2}-\d{2}$/, default: null },
    seo: { type: seoSchema, default: () => ({}) },
    status: { type: String, enum: BLOG_STATUSES, required: true, default: "DRAFT" },
    publishedAt: { type: Date, default: null },
    firstPublishedAt: { type: Date, default: null },
    wordCount: { type: Number, required: true, default: 0, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    migration: { type: migrationSchema, default: null },
  },
  { collection: "blog_posts", timestamps: true, versionKey: false, strict: "throw", minimize: false },
);

blogPostSchema.index({ activeSlug: 1 }, { name: "active_slug_unique", unique: true, partialFilterExpression: { activeSlug: { $type: "string" } } });
blogPostSchema.index({ previousSlugs: 1 }, { name: "previous_slugs" });
// Public listing / sitemap (published, newest first) and admin listing.
blogPostSchema.index({ status: 1, deletedAt: 1, publishedAt: -1 }, { name: "status_published" });
blogPostSchema.index({ deletedAt: 1, updatedAt: -1 }, { name: "active_recent" });
blogPostSchema.index({ "migration.key": 1 }, { name: "migration_key_unique", unique: true, partialFilterExpression: { "migration.key": { $type: "string" } } });

export const BlogPostModel: Model<BlogPostDoc> = (mongoose.models.BlogPost as Model<BlogPostDoc> | undefined) ?? mongoose.model<BlogPostDoc>("BlogPost", blogPostSchema);
