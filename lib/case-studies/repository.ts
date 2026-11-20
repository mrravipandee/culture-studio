import "server-only";

/**
 * Case Studies — MongoDB repository (implements CaseStudyRepository). SERVER-ONLY.
 *
 * - Every query is built from validated, typed values; user text only ever reaches MongoDB
 *   as an escaped, anchored or literal regex, never as an operator object (no NoSQL injection).
 * - Writes are single conditional findOneAndUpdate calls (atomic check-and-set on deletedAt,
 *   updatedAt and status), so no transaction is needed.
 * - `activeSlug` mirrors `slug` for non-deleted records (unique partial index); a duplicate
 *   becomes DuplicateSlugError, any other driver error DatabaseUnavailableError (withDb).
 * - Lean reads with explicit projections; nothing is populated (no N+1).
 */

import { Types, isValidObjectId, type QueryFilter, type UpdateQuery } from "mongoose";
import { withDb } from "@/lib/db/mongoose";
import { CaseStudyModel, type CaseStudyDoc } from "@/lib/db/models/CaseStudy";
import { isDuplicateKeyError } from "@/lib/server/errors";
import type { CaseStudyRecord } from "./rules";
import { DuplicateSlugError, type CaseStudyPatch, type CaseStudyRepository, type NewCaseStudy, type WriteGuard } from "./service";
import type { CaseStudyCounts, CaseStudyListQuery } from "./types";
import type { CaseStudySort } from "./constants";

const ACTIVE = { deletedAt: null } as const;
/** Everything except audit/actor fields (never returned to clients). */
const RECORD_FIELDS = "-createdBy -updatedBy -deletedBy -activeSlug";

export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type LeanCaseStudy = Omit<CaseStudyDoc, "createdBy" | "updatedBy" | "deletedBy" | "activeSlug">;

const compact = <T extends object>(value: T): T => Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== null)) as T;

export function toRecord(d: LeanCaseStudy): CaseStudyRecord {
  return {
    id: d._id.toString(),
    title: d.title,
    slug: d.slug,
    projectHighlight: d.projectHighlight,
    overview: d.overview,
    ...(d.category ? { category: d.category } : {}),
    group: d.group,
    filters: d.filters ?? [],
    services: (d.services ?? []).map(compact),
    scope: (d.scope ?? []).map(compact),
    results: (d.results ?? []).map(compact),
    coverImage: { kind: d.coverImage?.kind ?? "NONE", alt: d.coverImage?.alt ?? "", illustrative: d.coverImage?.illustrative ?? false, ...compact({ url: d.coverImage?.url, publicId: d.coverImage?.publicId, position: d.coverImage?.position }) },
    gallery: (d.gallery ?? []).map(compact),
    featured: d.featured,
    sortOrder: d.sortOrder,
    seo: compact({ ...(d.seo ?? {}) }),
    status: d.status,
    publishedAt: d.publishedAt ?? null,
    firstPublishedAt: d.firstPublishedAt ?? null,
    previousSlugs: d.previousSlugs ?? [],
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    deletedAt: d.deletedAt ?? null,
    createdBy: null,
    updatedBy: null,
    migration: d.migration ? { key: d.migration.key, hash: d.migration.hash, appliedAt: d.migration.appliedAt } : null,
  };
}

const SORTS: Record<CaseStudySort, Record<string, 1 | -1>> = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  updated: { updatedAt: -1, _id: -1 },
  order: { sortOrder: 1, createdAt: 1, _id: 1 },
  title: { title: 1, _id: 1 },
};

/** Admin list filter from a validated query. Exported for tests. */
export function listFilter(q: CaseStudyListQuery): QueryFilter<CaseStudyDoc> {
  const filter: QueryFilter<CaseStudyDoc> = q.status === "deleted" ? { deletedAt: { $ne: null } } : { ...ACTIVE };
  if (q.status !== "all" && q.status !== "deleted") filter.status = q.status;
  if (q.featured !== undefined) filter.featured = q.featured;
  if (q.category) filter.category = q.category;
  if (q.serviceId) filter["services.serviceId"] = q.serviceId;
  if (q.from || q.to) filter.createdAt = { ...(q.from ? { $gte: q.from } : {}), ...(q.to ? { $lt: q.to } : {}) };
  if (q.search) {
    const pattern = new RegExp(escapeRegex(q.search), "i");
    filter.$or = [{ title: pattern }, { slug: pattern }];
  }
  return filter;
}

const toObjectId = (id: string) => new Types.ObjectId(id);

/** Turns a duplicate active-slug write into DuplicateSlugError (other errors pass through). */
async function slugSafe<T>(write: () => Promise<T>): Promise<T> {
  try {
    return await write();
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new DuplicateSlugError();
    throw error;
  }
}

export const mongoCaseStudyRepository: CaseStudyRepository = {
  async findById(id, options = {}) {
    if (!isValidObjectId(id) || !/^[a-f0-9]{24}$/.test(id)) return null;
    const doc = await withDb(() =>
      CaseStudyModel.findOne({ _id: toObjectId(id), ...(options.includeDeleted ? {} : ACTIVE) })
        .select(RECORD_FIELDS)
        .lean<LeanCaseStudy>(),
    );
    return doc ? toRecord(doc) : null;
  },

  async takenSlugs(slugs, exceptId) {
    if (slugs.length === 0) return new Set();
    const docs = await withDb(() =>
      CaseStudyModel.find({ activeSlug: { $in: slugs }, ...(exceptId ? { _id: { $ne: toObjectId(exceptId) } } : {}) })
        .select("activeSlug")
        .lean<{ activeSlug?: string }[]>(),
    );
    return new Set(docs.map((d) => d.activeSlug).filter((s): s is string => Boolean(s)));
  },

  async slugsLike(base) {
    const docs = await withDb(() =>
      CaseStudyModel.find({ activeSlug: { $regex: `^${escapeRegex(base)}(?:-\\d+)?$` } })
        .select("activeSlug")
        .limit(1000)
        .lean<{ activeSlug?: string }[]>(),
    );
    return new Set(docs.map((d) => d.activeSlug).filter((s): s is string => Boolean(s)));
  },

  async list(q) {
    const filter = listFilter(q);
    const [items, filtered] = await withDb(() =>
      Promise.all([
        CaseStudyModel.find(filter)
          .select(RECORD_FIELDS)
          .sort(SORTS[q.sort])
          .skip((q.page - 1) * q.pageSize)
          .limit(q.pageSize)
          .lean<LeanCaseStudy[]>(),
        CaseStudyModel.countDocuments(filter),
      ]),
    );
    return { items: items.map(toRecord), filtered };
  },

  async counts() {
    const rows = await withDb(() =>
      CaseStudyModel.aggregate<{ _id: { deleted: boolean; status: string }; n: number; withImage: number }>([
        {
          $group: {
            _id: { deleted: { $ne: [{ $ifNull: ["$deletedAt", null] }, null] }, status: "$status" },
            n: { $sum: 1 },
            withImage: { $sum: { $cond: [{ $eq: ["$coverImage.kind", "IMAGE"] }, 1, 0] } },
          },
        },
      ]),
    );
    const counts: CaseStudyCounts = { all: 0, DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0, deleted: 0, withImage: 0 };
    for (const row of rows) {
      if (row._id.deleted) {
        counts.deleted += row.n;
        continue;
      }
      counts.all += row.n;
      counts.withImage += row.withImage;
      if (row._id.status === "DRAFT" || row._id.status === "PUBLISHED" || row._id.status === "ARCHIVED") counts[row._id.status] += row.n;
    }
    return counts;
  },

  async insert(record: NewCaseStudy) {
    const doc = await withDb(() =>
      slugSafe(() =>
        CaseStudyModel.create({
          ...record,
          activeSlug: record.slug,
          createdBy: toObjectId(record.createdBy),
          updatedBy: toObjectId(record.updatedBy),
        }),
      ),
    );
    return toRecord(doc.toObject<LeanCaseStudy>());
  },

  async update(id, guard: WriteGuard, patch: CaseStudyPatch) {
    if (!isValidObjectId(id)) return null;
    const filter: QueryFilter<CaseStudyDoc> = { _id: toObjectId(id), deletedAt: guard.deleted ? { $ne: null } : null };
    if (guard.updatedAt) filter.updatedAt = guard.updatedAt;
    if (guard.status) filter.status = { $in: [...guard.status] };

    const { updatedBy, deletedBy, category, deletedAt, ...rest } = patch;
    const $set: Record<string, unknown> = { ...rest, updatedBy: toObjectId(updatedBy) };
    const $unset: Record<string, ""> = {};
    for (const [key, value] of Object.entries($set)) if (value === undefined) delete $set[key];

    if (category === null) $unset.category = "";
    else if (category !== undefined) $set.category = category;

    if (deletedAt instanceof Date) {
      $set.deletedAt = deletedAt;
      $unset.activeSlug = ""; // frees the slug while deleted
    } else if (deletedAt === null) {
      $set.deletedAt = null;
    }
    if (deletedBy !== undefined) $set.deletedBy = deletedBy ? toObjectId(deletedBy) : null;
    // Keep the unique mirror in step whenever the record is (or becomes) active.
    if (patch.slug !== undefined && !(deletedAt instanceof Date)) $set.activeSlug = patch.slug;

    const update: UpdateQuery<CaseStudyDoc> = { $set, ...(Object.keys($unset).length ? { $unset } : {}) };
    const doc = await withDb(() =>
      slugSafe(() => CaseStudyModel.findOneAndUpdate(filter, update, { returnDocument: "after", runValidators: true }).select(RECORD_FIELDS).lean<LeanCaseStudy>()),
    );
    return doc ? toRecord(doc) : null;
  },
};
