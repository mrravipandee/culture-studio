import "server-only";

/**
 * CaseStudy — one project (collection: case_studies). SERVER-ONLY.
 *
 * - strict: "throw": unknown properties are never persisted.
 * - Structured subdocuments (services, scope, results, cover, gallery, seo), no Mixed.
 * - status: DRAFT | PUBLISHED | ARCHIVED. Changed only by the service's dedicated actions.
 * - publishedAt: start of the current publication (null when not public);
 *   firstPublishedAt: first publication ever (kept through unpublish / republish).
 * - Soft delete: deletedAt set and `activeSlug` removed. `activeSlug` mirrors `slug` on every
 *   non-deleted record and carries the unique index, so slugs are unique among active
 *   records while deleted ones keep their old slug for a safe restore.
 * - previousSlugs: earlier public slugs that 308-redirect to the current one.
 * - migration: set only on records created by scripts/migrate-case-studies.mjs (stable key +
 *   content hash), so the migration can be re-run without duplicates or overwriting edits.
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";
import {
  CASE_STUDY_CATEGORY_IDS,
  CASE_STUDY_FILTER_IDS,
  CASE_STUDY_GROUPS,
  CASE_STUDY_LIMITS as L,
  CASE_STUDY_SLUG_PATTERN,
  CASE_STUDY_STATUSES,
  CATALOG_SERVICE_IDS,
  COVER_KINDS,
  OBJECT_POSITION_PATTERN,
  IMAGE_URL_PATTERN,
  type CaseStudyFilterId,
  type CaseStudyGroupId,
  type CaseStudyStatus,
  type CoverKind,
} from "@/lib/case-studies/constants";
import type { DisciplineId } from "@/lib/content/disciplines";

export interface CaseStudyDoc {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  activeSlug?: string;
  previousSlugs: string[];
  projectHighlight: string;
  overview: string;
  category?: DisciplineId;
  group: CaseStudyGroupId;
  filters: CaseStudyFilterId[];
  services: { name: string; serviceId?: string }[];
  scope: { value?: string; title: string; description?: string }[];
  results: { value: string; label: string }[];
  coverImage: { kind: CoverKind; url?: string; publicId?: string; alt: string; illustrative: boolean; position?: string };
  gallery: { url: string; publicId?: string; alt: string }[];
  status: CaseStudyStatus;
  featured: boolean;
  sortOrder: number;
  seo: { title?: string; description?: string; ogImage?: string };
  publishedAt: Date | null;
  firstPublishedAt: Date | null;
  createdBy: Types.ObjectId | null;
  updatedBy: Types.ObjectId | null;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
  migration?: { key: string; hash: string; appliedAt: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}

const sub = { _id: false } as const;
const text = (max: number, required = false) => ({ type: String, trim: true, maxlength: max, ...(required ? { required: true } : {}) });
/** A site image (/images/…) or a Cloudinary upload (see lib/case-studies/constants.ts). */
const imagePath = { type: String, trim: true, maxlength: 400, match: IMAGE_URL_PATTERN };

const serviceSchema = new Schema({ name: text(L.serviceName, true), serviceId: { type: String, enum: CATALOG_SERVICE_IDS } }, { ...sub, strict: "throw" });
const scopeSchema = new Schema({ value: text(L.resultValue), title: text(L.scopeTitle, true), description: text(L.scopeDescription) }, { ...sub, strict: "throw" });
const resultSchema = new Schema({ value: text(L.resultValue, true), label: text(L.resultLabel, true) }, { ...sub, strict: "throw" });
const coverSchema = new Schema(
  {
    kind: { type: String, enum: COVER_KINDS, required: true, default: "NONE" },
    url: imagePath,
    publicId: text(200),
    alt: { ...text(L.alt), default: "" },
    illustrative: { type: Boolean, default: false },
    position: { type: String, match: OBJECT_POSITION_PATTERN },
  },
  { ...sub, strict: "throw" },
);
const galleryImageSchema = new Schema({ url: { ...imagePath, required: true }, publicId: text(200), alt: text(L.alt, true) }, { ...sub, strict: "throw" });
const seoSchema = new Schema({ title: text(L.seoTitle), description: text(L.seoDescription), ogImage: imagePath }, { ...sub, strict: "throw" });
const migrationSchema = new Schema({ key: text(120, true), hash: { type: String, required: true, match: /^[a-f0-9]{64}$/ }, appliedAt: { type: Date, required: true } }, { ...sub, strict: "throw" });

const caseStudySchema = new Schema<CaseStudyDoc>(
  {
    title: text(L.title, true),
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: L.slug, match: CASE_STUDY_SLUG_PATTERN },
    activeSlug: { type: String, trim: true, lowercase: true, maxlength: L.slug, match: CASE_STUDY_SLUG_PATTERN },
    previousSlugs: {
      type: [{ type: String, lowercase: true, maxlength: L.slug, match: CASE_STUDY_SLUG_PATTERN }],
      default: [],
      validate: { validator: (v: string[]) => v.length <= L.previousSlugs, message: "Too many previous slugs." },
    },
    projectHighlight: text(L.highlight, true),
    overview: { type: String, required: true, trim: true, maxlength: L.overview },
    category: { type: String, enum: CASE_STUDY_CATEGORY_IDS },
    group: { type: String, enum: CASE_STUDY_GROUPS, required: true, default: "selected" },
    filters: { type: [{ type: String, enum: CASE_STUDY_FILTER_IDS }], default: [] },
    services: { type: [serviceSchema], default: [], validate: { validator: (v: unknown[]) => v.length <= L.services, message: "Too many services." } },
    scope: { type: [scopeSchema], default: [], validate: { validator: (v: unknown[]) => v.length <= L.scopeItems, message: "Too many scope items." } },
    results: { type: [resultSchema], default: [], validate: { validator: (v: unknown[]) => v.length <= L.results, message: "Too many results." } },
    coverImage: { type: coverSchema, required: true, default: () => ({ kind: "NONE", alt: "", illustrative: false }) },
    gallery: { type: [galleryImageSchema], default: [], validate: { validator: (v: unknown[]) => v.length <= L.gallery, message: "Too many gallery images." } },
    status: { type: String, enum: CASE_STUDY_STATUSES, required: true, default: "DRAFT" },
    featured: { type: Boolean, required: true, default: false },
    sortOrder: { type: Number, required: true, default: 0, min: 0, max: L.sortOrder },
    seo: { type: seoSchema, default: () => ({}) },
    publishedAt: { type: Date, default: null },
    firstPublishedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    migration: { type: migrationSchema, default: null },
  },
  { collection: "case_studies", timestamps: true, versionKey: false, strict: "throw" },
);

// Unique slug among active (non-deleted) records. Deleted records have no activeSlug.
caseStudySchema.index({ activeSlug: 1 }, { name: "active_slug_unique", unique: true, partialFilterExpression: { activeSlug: { $type: "string" } } });
// Old public URLs → current record (redirects).
caseStudySchema.index({ previousSlugs: 1 }, { name: "previous_slugs" });
// Public listing / sitemap (published, newest or by configured order) and featured sections.
caseStudySchema.index({ status: 1, deletedAt: 1, publishedAt: -1 }, { name: "status_published" });
caseStudySchema.index({ status: 1, deletedAt: 1, sortOrder: 1 }, { name: "status_order" });
caseStudySchema.index({ featured: 1, status: 1, deletedAt: 1, sortOrder: 1 }, { name: "featured_status_order" });
// Admin listing: newest first, deleted view.
caseStudySchema.index({ deletedAt: 1, createdAt: -1 }, { name: "active_recent" });
// Migration identity (one record per migration key, deleted or not).
caseStudySchema.index({ "migration.key": 1 }, { name: "migration_key_unique", unique: true, partialFilterExpression: { "migration.key": { $type: "string" } } });

export const CaseStudyModel: Model<CaseStudyDoc> = (mongoose.models.CaseStudy as Model<CaseStudyDoc> | undefined) ?? mongoose.model<CaseStudyDoc>("CaseStudy", caseStudySchema);
