/**
 * Case Studies — application service (business rules). No framework or database imports:
 * storage, audit logging, cache invalidation and the clock are injected, so every rule is
 * exercised by the unit tests with an in-memory repository (tests/case-studies) and by the
 * production wiring in ./server.ts with MongoDB.
 *
 * Guarantees:
 *  - Status changes only through publish / unpublish / archive / restore, each checked
 *    against CASE_STUDY_TRANSITIONS and applied with a conditional (atomic) update on the
 *    expected status + updatedAt, so two concurrent actions can't both succeed.
 *  - Content updates require the client's `expectedUpdatedAt` (optimistic concurrency) and
 *    never touch status, audit fields or timestamps.
 *  - Publishing runs the full readiness check (rules.ts → publishIssues); a published record
 *    can't be edited into an unpublishable state.
 *  - Slugs are unique among active records (unique index; the service checks first to return
 *    a helpful suggestion, the index is the final guard against races).
 *  - Changing the slug of a page that was ever public keeps the old slug as a redirect.
 */

import { CASE_STUDY_TRANSITIONS, canTransition, type CaseStudyAction, type CaseStudyStatus } from "./constants";
import { nextPreviousSlugs, publishIssues, slugFromTitle, suggestSlug, toAdminCaseStudy, type CaseStudyRecord } from "./rules";
import type { AdminCaseStudy, CaseStudyContent, CaseStudyCounts, CaseStudyListQuery, CaseStudyListResult } from "./types";
import type { CaseStudyChanges, CaseStudyCreateInput } from "./validation";

/* Errors (mapped to HTTP by the route layer) ------------------------------------------------ */

export type CaseStudyErrorKind = "NOT_FOUND" | "STALE_RECORD" | "SLUG_TAKEN" | "INVALID_TRANSITION" | "PUBLISH_VALIDATION";

export class CaseStudyError extends Error {
  readonly kind: CaseStudyErrorKind;
  readonly fields?: Record<string, string>;
  readonly suggestion?: string;
  constructor(kind: CaseStudyErrorKind, message: string, fields?: Record<string, string>, suggestion?: string) {
    super(message);
    this.name = "CaseStudyError";
    this.kind = kind;
    this.fields = fields;
    this.suggestion = suggestion;
  }
}

/**
 * Thrown by a repository when the unique active-slug index rejects a write. It carries a
 * `status` so lib/db/mongoose.ts → withDb passes it through instead of reporting an outage.
 */
export class DuplicateSlugError extends Error {
  readonly status = 409;
  constructor() {
    super("Duplicate slug.");
    this.name = "DuplicateSlugError";
  }
}

/* Ports ------------------------------------------------------------------------------------------ */

export type NewCaseStudy = CaseStudyContent & {
  status: CaseStudyStatus;
  publishedAt: Date | null;
  firstPublishedAt: Date | null;
  previousSlugs: string[];
  createdBy: string;
  updatedBy: string;
};

export type CaseStudyPatch = Omit<Partial<CaseStudyContent>, "category"> & {
  /** null clears the category. */
  category?: CaseStudyContent["category"] | null;
  status?: CaseStudyStatus;
  publishedAt?: Date | null;
  firstPublishedAt?: Date | null;
  previousSlugs?: string[];
  updatedBy: string;
  deletedAt?: Date | null;
  deletedBy?: string | null;
};

/** Conditions a write must still meet when it reaches the database (atomic check-and-set). */
export interface WriteGuard {
  deleted: boolean;
  updatedAt?: Date;
  status?: readonly CaseStudyStatus[];
}

export interface CaseStudyRepository {
  /** Active records only, unless includeDeleted. */
  findById(id: string, options?: { includeDeleted?: boolean }): Promise<CaseStudyRecord | null>;
  /** Which of these slugs are used by an active record other than `exceptId`. */
  takenSlugs(slugs: string[], exceptId?: string): Promise<Set<string>>;
  /** Slugs starting with `base` used by active records (for suggestions). */
  slugsLike(base: string): Promise<Set<string>>;
  list(query: CaseStudyListQuery): Promise<{ items: CaseStudyRecord[]; filtered: number }>;
  counts(): Promise<CaseStudyCounts>;
  /** Throws DuplicateSlugError on an active-slug collision. */
  insert(record: NewCaseStudy, at: Date): Promise<CaseStudyRecord>;
  /** Applies `patch` only if the record still matches `guard`; null otherwise. Throws DuplicateSlugError. */
  update(id: string, guard: WriteGuard, patch: CaseStudyPatch, at: Date): Promise<CaseStudyRecord | null>;
}

export type AuditEvent = {
  adminId: string;
  action: "created" | "updated" | "published" | "unpublished" | "archived" | "deleted" | "restored";
  entityId: string;
  at: Date;
  meta?: { slug?: string; from?: string; to?: string; fields?: string[] };
};

export interface CaseStudyServiceDeps {
  repo: CaseStudyRepository;
  /** Records an audit event. Must not throw (a failed log never undoes a completed action). */
  audit: (event: AuditEvent) => Promise<void>;
  /** Invalidates every cached public view (listing, details, sitemap, Home). */
  revalidatePublic: () => void;
  now?: () => Date;
}

/* Service ------------------------------------------------------------------------------------------- */

const PAST_TENSE: Record<CaseStudyAction, string> = { publish: "published", unpublish: "unpublished", archive: "archived", restore: "restored" };

const stale = () => new CaseStudyError("STALE_RECORD", "This case study was changed elsewhere. Reload it and try again.");
const notFound = () => new CaseStudyError("NOT_FOUND", "That case study doesn't exist or was deleted.");

export function createCaseStudyService(deps: CaseStudyServiceDeps) {
  const { repo, audit } = deps;
  const now = deps.now ?? (() => new Date());

  const isPublic = (r: Pick<CaseStudyRecord, "status" | "deletedAt">) => r.status === "PUBLISHED" && r.deletedAt === null;

  async function slugConflict(slug: string, exceptId?: string): Promise<CaseStudyError | null> {
    const taken = await repo.takenSlugs([slug], exceptId);
    if (!taken.has(slug)) return null;
    const used = await repo.slugsLike(slug);
    const suggestion = suggestSlug(slug, (s) => used.has(s));
    return new CaseStudyError("SLUG_TAKEN", "Another case study already uses this slug.", { slug: `Another case study already uses this slug. Try “${suggestion}”.` }, suggestion);
  }

  /** Repository write that turns an index-level slug collision into SLUG_TAKEN. */
  async function guardedSlugWrite<T>(slug: string, exceptId: string | undefined, write: () => Promise<T>): Promise<T> {
    try {
      return await write();
    } catch (error) {
      if (error instanceof DuplicateSlugError) throw (await slugConflict(slug, exceptId)) ?? new CaseStudyError("SLUG_TAKEN", "Another case study already uses this slug.", { slug: "Another case study already uses this slug." });
      throw error;
    }
  }

  async function load(id: string, includeDeleted = false) {
    const record = await repo.findById(id, { includeDeleted });
    if (!record) throw notFound();
    return record;
  }

  return {
    async list(query: CaseStudyListQuery): Promise<CaseStudyListResult> {
      const [{ items, filtered }, counts] = await Promise.all([repo.list(query), repo.counts()]);
      const pages = Math.max(1, Math.ceil(filtered / query.pageSize));
      return { items: items.map(toAdminCaseStudy), filtered, page: query.page, pageSize: query.pageSize, pages, counts };
    },

    async get(id: string): Promise<AdminCaseStudy> {
      return toAdminCaseStudy(await load(id));
    },

    async create(input: CaseStudyCreateInput, adminId: string): Promise<AdminCaseStudy> {
      const slug = input.slug ?? slugFromTitle(input.title);
      const conflict = await slugConflict(slug);
      if (conflict) throw conflict;
      const at = now();
      const record = await guardedSlugWrite(slug, undefined, () =>
        repo.insert({ ...input, slug, status: "DRAFT", publishedAt: null, firstPublishedAt: null, previousSlugs: [], createdBy: adminId, updatedBy: adminId }, at),
      );
      await audit({ adminId, action: "created", entityId: record.id, at, meta: { slug } });
      return toAdminCaseStudy(record);
    },

    async update(id: string, expectedUpdatedAt: string, changes: CaseStudyChanges, adminId: string): Promise<AdminCaseStudy> {
      const record = await load(id);
      if (record.updatedAt.toISOString() !== new Date(expectedUpdatedAt).toISOString()) throw stale();

      const { category, ...rest } = changes;
      const merged: CaseStudyContent = { ...record, ...rest };
      if (category === null) delete merged.category;
      else if (category) merged.category = category;

      // A live page must stay publishable after the edit.
      if (record.status === "PUBLISHED") {
        const issues = publishIssues(merged);
        if (Object.keys(issues).length) throw new CaseStudyError("PUBLISH_VALIDATION", "A published case study must stay complete. Fix these fields, or unpublish it first.", issues);
      }

      const patch: CaseStudyPatch = { ...rest, updatedBy: adminId };
      if (category !== undefined) patch.category = category;
      const slugChanged = changes.slug !== undefined && changes.slug !== record.slug;
      if (slugChanged) {
        const conflict = await slugConflict(merged.slug, id);
        if (conflict) throw conflict;
        patch.previousSlugs = nextPreviousSlugs(record, merged.slug);
      }

      const at = now();
      const updated = await guardedSlugWrite(merged.slug, id, () => repo.update(id, { deleted: false, updatedAt: record.updatedAt }, patch, at));
      if (!updated) throw stale();
      if (isPublic(record) || isPublic(updated)) deps.revalidatePublic();
      await audit({ adminId, action: "updated", entityId: id, at, meta: { slug: updated.slug, fields: Object.keys(changes).sort() } });
      return toAdminCaseStudy(updated);
    },

    async remove(id: string, adminId: string): Promise<{ id: string; deleted: true }> {
      const record = await load(id);
      const at = now();
      const updated = await repo.update(id, { deleted: false, updatedAt: record.updatedAt }, { deletedAt: at, deletedBy: adminId, updatedBy: adminId }, at);
      if (!updated) throw stale();
      if (isPublic(record)) deps.revalidatePublic();
      await audit({ adminId, action: "deleted", entityId: id, at, meta: { slug: record.slug, from: record.status } });
      return { id, deleted: true };
    },

    /**
     * publish / unpublish / archive / restore. `restore` brings back a soft-deleted record (any
     * status) or an ARCHIVED one, always as DRAFT; a deleted record whose slug was taken
     * meanwhile needs a new `slug`.
     */
    async transition(id: string, action: CaseStudyAction, adminId: string, options: { expectedUpdatedAt?: string; slug?: string } = {}): Promise<AdminCaseStudy> {
      const record = await load(id, action === "restore");
      if (options.expectedUpdatedAt && record.updatedAt.toISOString() !== new Date(options.expectedUpdatedAt).toISOString()) throw stale();
      const at = now();

      if (action === "restore" && record.deletedAt) {
        const slug = options.slug ?? record.slug;
        const conflict = await slugConflict(slug, id);
        if (conflict) throw new CaseStudyError("SLUG_TAKEN", "Another case study now uses this slug. Restore it with a different slug.", conflict.fields, conflict.suggestion);
        const updated = await guardedSlugWrite(slug, id, () =>
          repo.update(
            id,
            { deleted: true, updatedAt: record.updatedAt },
            // `slug` is always sent on restore: the repository re-activates it (unique index).
            { deletedAt: null, deletedBy: null, status: "DRAFT", publishedAt: null, updatedBy: adminId, slug, ...(slug !== record.slug ? { previousSlugs: nextPreviousSlugs(record, slug) } : {}) },
            at,
          ),
        );
        if (!updated) throw stale();
        await audit({ adminId, action: "restored", entityId: id, at, meta: { slug, from: "DELETED", to: "DRAFT" } });
        return toAdminCaseStudy(updated);
      }

      if (record.deletedAt) throw notFound();
      if (!canTransition(action, record.status)) {
        throw new CaseStudyError("INVALID_TRANSITION", `A ${record.status.toLowerCase()} case study can't be ${PAST_TENSE[action]}.`);
      }

      const to = CASE_STUDY_TRANSITIONS[action].to;
      const patch: CaseStudyPatch = { status: to, updatedBy: adminId };
      if (action === "publish") {
        const issues = publishIssues(record);
        if (Object.keys(issues).length) throw new CaseStudyError("PUBLISH_VALIDATION", "This case study isn't ready to publish yet.", issues);
        const conflict = await slugConflict(record.slug, id); // defensive: the index already guarantees it
        if (conflict) throw conflict;
        patch.publishedAt = at;
        if (!record.firstPublishedAt) patch.firstPublishedAt = at;
      } else {
        patch.publishedAt = null; // no longer public (firstPublishedAt is kept)
      }

      const updated = await repo.update(id, { deleted: false, updatedAt: record.updatedAt, status: [record.status] }, patch, at);
      if (!updated) throw stale();
      if (isPublic(record) || isPublic(updated)) deps.revalidatePublic();
      const auditAction = ({ publish: "published", unpublish: "unpublished", archive: "archived", restore: "restored" } as const satisfies Record<CaseStudyAction, AuditEvent["action"]>)[action];
      await audit({ adminId, action: auditAction, entityId: id, at, meta: { slug: record.slug, from: record.status, to } });
      return toAdminCaseStudy(updated);
    },

    /** Publishing readiness for the admin (same rules the publish action enforces). */
    async readiness(id: string) {
      return publishIssues(await load(id));
    },
  };
}

export type CaseStudyService = ReturnType<typeof createCaseStudyService>;
