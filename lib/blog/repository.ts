import "server-only";

/**
 * Blog — MongoDB repository (implements BlogRepository). SERVER-ONLY.
 * Lean reads with explicit projections (listings never load bodies); writes are single
 * conditional findOneAndUpdate calls (atomic on deletedAt, updatedAt and status);
 * `activeSlug` mirrors `slug` for non-deleted posts (unique partial index).
 */

import { Types, isValidObjectId, type QueryFilter } from "mongoose";
import { withDb } from "@/lib/db/mongoose";
import { BlogPostModel, type BlogPostDoc } from "@/lib/db/models/BlogPost";
import { isDuplicateKeyError } from "@/lib/server/errors";
import { escapeRegex } from "@/lib/case-studies/repository";
import { emptyDoc, isRichDoc } from "@/lib/rich-text";
import { BLOG_LIST_MAX } from "./constants";
import type { BlogRecord } from "./rules";
import { DuplicateSlugError, type BlogPatch, type BlogRepository, type BlogWriteGuard, type NewBlogPost } from "./service";

const ACTIVE = { deletedAt: null } as const;
const FULL_FIELDS = "-createdBy -updatedBy -deletedBy -activeSlug";
const SUMMARY_FIELDS = `${FULL_FIELDS} -content`;

type LeanBlog = Omit<BlogPostDoc, "createdBy" | "updatedBy" | "deletedBy" | "activeSlug">;

export function toBlogRecord(d: Omit<LeanBlog, "content"> & { content?: unknown }): BlogRecord {
  return {
    id: d._id.toString(),
    title: d.title,
    slug: d.slug,
    excerpt: d.excerpt ?? "",
    content: isRichDoc(d.content) ? d.content : emptyDoc(),
    ...(d.category ? { category: d.category } : {}),
    tags: d.tags ?? [],
    author: d.author,
    coverImage: d.coverImage ? { url: d.coverImage.url, ...(d.coverImage.publicId ? { publicId: d.coverImage.publicId } : {}), alt: d.coverImage.alt ?? "", caption: d.coverImage.caption ?? "" } : null,
    displayDate: d.displayDate ?? null,
    seo: { ...(d.seo?.title ? { title: d.seo.title } : {}), ...(d.seo?.description ? { description: d.seo.description } : {}) },
    status: d.status,
    publishedAt: d.publishedAt ?? null,
    firstPublishedAt: d.firstPublishedAt ?? null,
    previousSlugs: d.previousSlugs ?? [],
    wordCount: d.wordCount ?? 0,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    deletedAt: d.deletedAt ?? null,
    migration: d.migration ? { key: d.migration.key, hash: d.migration.hash, appliedAt: d.migration.appliedAt } : null,
  };
}

const oid = (id: string) => new Types.ObjectId(id);

async function slugSafe<T>(write: () => Promise<T>): Promise<T> {
  try {
    return await write();
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new DuplicateSlugError();
    throw error;
  }
}

export const mongoBlogRepository: BlogRepository = {
  async findById(id) {
    if (!isValidObjectId(id) || !/^[a-f0-9]{24}$/.test(id)) return null;
    const doc = await withDb(() => BlogPostModel.findOne({ _id: oid(id), ...ACTIVE }).select(FULL_FIELDS).lean<LeanBlog>());
    return doc ? toBlogRecord(doc) : null;
  },

  async takenSlugs(slugs, exceptId) {
    if (!slugs.length) return new Set();
    const docs = await withDb(() =>
      BlogPostModel.find({ activeSlug: { $in: slugs }, ...(exceptId ? { _id: { $ne: oid(exceptId) } } : {}) })
        .select("activeSlug")
        .lean<{ activeSlug?: string }[]>(),
    );
    return new Set(docs.map((d) => d.activeSlug).filter((s): s is string => Boolean(s)));
  },

  async slugsLike(base) {
    const docs = await withDb(() =>
      BlogPostModel.find({ activeSlug: { $regex: `^${escapeRegex(base)}(?:-\\d+)?$` } })
        .select("activeSlug")
        .limit(1000)
        .lean<{ activeSlug?: string }[]>(),
    );
    return new Set(docs.map((d) => d.activeSlug).filter((s): s is string => Boolean(s)));
  },

  async listSummaries() {
    const docs = await withDb(() =>
      BlogPostModel.find(ACTIVE)
        .select(SUMMARY_FIELDS)
        .sort({ updatedAt: -1, _id: -1 })
        .limit(BLOG_LIST_MAX + 1)
        .lean<Omit<LeanBlog, "content">[]>(),
    );
    return { items: docs.slice(0, BLOG_LIST_MAX).map(toBlogRecord), truncated: docs.length > BLOG_LIST_MAX };
  },

  async insert(post: NewBlogPost) {
    const doc = await withDb(() =>
      slugSafe(() => BlogPostModel.create({ ...post, activeSlug: post.slug, createdBy: oid(post.createdBy), updatedBy: oid(post.updatedBy) })),
    );
    return toBlogRecord(doc.toObject<LeanBlog>());
  },

  async update(id, guard: BlogWriteGuard, patch: BlogPatch) {
    if (!isValidObjectId(id)) return null;
    const filter: QueryFilter<BlogPostDoc> = { _id: oid(id), ...ACTIVE };
    if (guard.updatedAt) filter.updatedAt = guard.updatedAt;
    if (guard.status) filter.status = { $in: [...guard.status] };

    const { updatedBy, deletedBy, category, deletedAt, ...rest } = patch;
    const $set: Record<string, unknown> = { updatedBy: oid(updatedBy) };
    for (const [key, value] of Object.entries(rest)) if (value !== undefined) $set[key] = value;
    const $unset: Record<string, ""> = {};
    if (category === null) $unset.category = "";
    else if (category !== undefined) $set.category = category;
    if (rest.slug !== undefined) $set.activeSlug = rest.slug;
    if (deletedAt) {
      $set.deletedAt = deletedAt;
      if (deletedBy) $set.deletedBy = oid(deletedBy);
      $unset.activeSlug = "";
    }

    const doc = await withDb(() =>
      slugSafe(() =>
        BlogPostModel.findOneAndUpdate(filter, { $set, ...(Object.keys($unset).length ? { $unset } : {}) }, { returnDocument: "after", runValidators: true })
          .select(FULL_FIELDS)
          .lean<LeanBlog>(),
      ),
    );
    return doc ? toBlogRecord(doc) : null;
  },
};

/** Dashboard counts (non-deleted). */
export async function countBlogPosts(): Promise<{ total: number; published: number; drafts: number }> {
  const [total, published] = await withDb(() => Promise.all([BlogPostModel.countDocuments(ACTIVE), BlogPostModel.countDocuments({ ...ACTIVE, status: "PUBLISHED" })]));
  return { total, published, drafts: total - published };
}

/** Recent posts for the dashboard (no bodies). */
export async function recentBlogPosts(limit = 3): Promise<BlogRecord[]> {
  const docs = await withDb(() => BlogPostModel.find(ACTIVE).select(SUMMARY_FIELDS).sort({ updatedAt: -1 }).limit(limit).lean<Omit<LeanBlog, "content">[]>());
  return docs.map(toBlogRecord);
}
