/**
 * Blog — application service (business rules). No framework or database imports: storage,
 * audit, cache invalidation and the clock are injected (tests use an in-memory repository).
 *
 *  - New posts are DRAFTs; status changes only via publish / unpublish, each a conditional
 *    update on (status, updatedAt), so concurrent actions can't both apply.
 *  - Content PATCHes need the client's `expectedUpdatedAt`; status/audit fields are never
 *    accepted. A published post must stay publishable after an edit.
 *  - Slugs are unique among non-deleted posts (unique index; checked first for a suggestion).
 *    Changing a once-public slug keeps the old one as a 308 redirect.
 *  - wordCount is recomputed from the sanitised body on every save.
 */

import { DuplicateSlugError } from "@/lib/case-studies/service";
import { nextPreviousSlugs, slugFromTitle, suggestSlug } from "@/lib/case-studies/rules";
import type { BlogPost, BlogSummary } from "@/lib/admin/types";
import type { BlogPostStatus } from "./constants";
import { blogPublishIssues, toBlogPost, toBlogSummary, wordCountOf, type BlogContent, type BlogRecord } from "./rules";
import type { BlogChanges, BlogCreateInput } from "./validation";

export { DuplicateSlugError };

export type BlogErrorKind = "NOT_FOUND" | "STALE_RECORD" | "SLUG_TAKEN" | "INVALID_TRANSITION" | "PUBLISH_VALIDATION";

export class BlogError extends Error {
  readonly kind: BlogErrorKind;
  readonly fields?: Record<string, string>;
  readonly suggestion?: string;
  constructor(kind: BlogErrorKind, message: string, fields?: Record<string, string>, suggestion?: string) {
    super(message);
    this.name = "BlogError";
    this.kind = kind;
    this.fields = fields;
    this.suggestion = suggestion;
  }
}

export type NewBlogPost = BlogContent & { status: "DRAFT"; wordCount: number; previousSlugs: string[]; createdBy: string; updatedBy: string };

export type BlogPatch = Omit<Partial<BlogContent>, "category"> & {
  category?: BlogContent["category"] | null;
  status?: BlogPostStatus;
  publishedAt?: Date | null;
  firstPublishedAt?: Date | null;
  previousSlugs?: string[];
  wordCount?: number;
  updatedBy: string;
  deletedAt?: Date;
  deletedBy?: string;
};

export interface BlogWriteGuard {
  updatedAt?: Date;
  status?: readonly BlogPostStatus[];
}

export interface BlogRepository {
  /** Non-deleted posts only. */
  findById(id: string): Promise<BlogRecord | null>;
  takenSlugs(slugs: string[], exceptId?: string): Promise<Set<string>>;
  slugsLike(base: string): Promise<Set<string>>;
  /** Non-deleted posts without bodies, most recently updated first (capped). */
  listSummaries(): Promise<{ items: BlogRecord[]; truncated: boolean }>;
  insert(post: NewBlogPost): Promise<BlogRecord>;
  /** Applies `patch` to a non-deleted post still matching `guard`; null otherwise. Throws DuplicateSlugError. */
  update(id: string, guard: BlogWriteGuard, patch: BlogPatch): Promise<BlogRecord | null>;
}

export type BlogAuditEvent = {
  adminId: string;
  action: "created" | "updated" | "published" | "unpublished" | "deleted";
  entityId: string;
  at: Date;
  meta?: { slug?: string; from?: string; to?: string; fields?: string[] };
};

export interface BlogServiceDeps {
  repo: BlogRepository;
  audit: (event: BlogAuditEvent) => Promise<void>;
  revalidatePublic: () => void;
  now?: () => Date;
}

const stale = () => new BlogError("STALE_RECORD", "This article was changed elsewhere. Reload it and try again.");
const notFound = () => new BlogError("NOT_FOUND", "That article doesn't exist or was deleted.");

export function createBlogService(deps: BlogServiceDeps) {
  const { repo, audit } = deps;
  const now = deps.now ?? (() => new Date());
  const isPublic = (r: Pick<BlogRecord, "status">) => r.status === "PUBLISHED";

  async function slugConflict(slug: string, exceptId?: string): Promise<BlogError | null> {
    const taken = await repo.takenSlugs([slug], exceptId);
    if (!taken.has(slug)) return null;
    const used = await repo.slugsLike(slug);
    const suggestion = suggestSlug(slug, (s) => used.has(s));
    return new BlogError("SLUG_TAKEN", "Another article already uses this slug.", { slug: `Another article already uses this slug. Try “${suggestion}”.` }, suggestion);
  }

  async function slugSafe<T>(slug: string, exceptId: string | undefined, write: () => Promise<T>): Promise<T> {
    try {
      return await write();
    } catch (error) {
      if (error instanceof DuplicateSlugError) throw (await slugConflict(slug, exceptId)) ?? new BlogError("SLUG_TAKEN", "Another article already uses this slug.", { slug: "Another article already uses this slug." });
      throw error;
    }
  }

  async function load(id: string) {
    const record = await repo.findById(id);
    if (!record) throw notFound();
    return record;
  }

  const checkToken = (record: BlogRecord, expected?: string) => {
    if (expected && record.updatedAt.toISOString() !== new Date(expected).toISOString()) throw stale();
  };

  /** Soft delete (frees the slug; kept in the database). */
  async function remove(id: string, adminId: string): Promise<void> {
    const record = await load(id);
    const at = now();
    const updated = await repo.update(id, { updatedAt: record.updatedAt }, { deletedAt: at, deletedBy: adminId, updatedBy: adminId });
    if (!updated) throw stale();
    if (isPublic(record)) deps.revalidatePublic();
    await audit({ adminId, action: "deleted", entityId: id, at, meta: { slug: record.slug, from: record.status } });
  }

  return {
    async list(): Promise<{ items: BlogSummary[]; truncated: boolean }> {
      const { items, truncated } = await repo.listSummaries();
      return { items: items.map(toBlogSummary), truncated };
    },

    async get(id: string): Promise<BlogPost> {
      return toBlogPost(await load(id));
    },

    async create(input: BlogCreateInput, adminId: string): Promise<BlogPost> {
      const slug = input.slug ?? slugFromTitle(input.title);
      const conflict = await slugConflict(slug);
      if (conflict) throw conflict;
      const { category, ...rest } = input;
      const post: NewBlogPost = { ...rest, ...(category ? { category } : {}), slug, status: "DRAFT", wordCount: wordCountOf(input.content), previousSlugs: [], createdBy: adminId, updatedBy: adminId };
      const record = await slugSafe(slug, undefined, () => repo.insert(post));
      await audit({ adminId, action: "created", entityId: record.id, at: now(), meta: { slug } });
      return toBlogPost(record);
    },

    async update(id: string, expectedUpdatedAt: string, changes: BlogChanges, adminId: string): Promise<BlogPost> {
      const record = await load(id);
      checkToken(record, expectedUpdatedAt);

      const { category, ...rest } = changes;
      const merged: BlogContent = { ...record, ...rest };
      if (category === null) delete merged.category;
      else if (category) merged.category = category;

      if (isPublic(record)) {
        const issues = blogPublishIssues(merged);
        if (Object.keys(issues).length) throw new BlogError("PUBLISH_VALIDATION", "A published article must stay complete. Fix these fields, or unpublish it first.", issues);
      }

      const patch: BlogPatch = { ...rest, updatedBy: adminId };
      if (category !== undefined) patch.category = category;
      if (changes.content) patch.wordCount = wordCountOf(changes.content);
      if (changes.slug !== undefined && changes.slug !== record.slug) {
        const conflict = await slugConflict(changes.slug, id);
        if (conflict) throw conflict;
        patch.previousSlugs = nextPreviousSlugs(record, changes.slug);
      }

      const updated = await slugSafe(merged.slug, id, () => repo.update(id, { updatedAt: record.updatedAt }, patch));
      if (!updated) throw stale();
      if (isPublic(record) || isPublic(updated)) deps.revalidatePublic();
      await audit({ adminId, action: "updated", entityId: id, at: now(), meta: { slug: updated.slug, fields: Object.keys(changes).sort() } });
      return toBlogPost(updated);
    },

    async publish(id: string, adminId: string, expectedUpdatedAt?: string): Promise<BlogPost> {
      const record = await load(id);
      checkToken(record, expectedUpdatedAt);
      if (record.status !== "DRAFT") throw new BlogError("INVALID_TRANSITION", "This article is already published.");
      const issues = blogPublishIssues(record);
      if (Object.keys(issues).length) throw new BlogError("PUBLISH_VALIDATION", "This article isn't ready to publish yet.", issues);
      const conflict = await slugConflict(record.slug, id);
      if (conflict) throw conflict;
      const at = now();
      const updated = await repo.update(
        id,
        { updatedAt: record.updatedAt, status: ["DRAFT"] },
        { status: "PUBLISHED", publishedAt: at, ...(record.firstPublishedAt ? {} : { firstPublishedAt: at }), updatedBy: adminId },
      );
      if (!updated) throw stale();
      deps.revalidatePublic();
      await audit({ adminId, action: "published", entityId: id, at, meta: { slug: record.slug, from: "DRAFT", to: "PUBLISHED" } });
      return toBlogPost(updated);
    },

    async unpublish(id: string, adminId: string, expectedUpdatedAt?: string): Promise<BlogPost> {
      const record = await load(id);
      checkToken(record, expectedUpdatedAt);
      if (record.status !== "PUBLISHED") throw new BlogError("INVALID_TRANSITION", "This article isn't published.");
      const at = now();
      const updated = await repo.update(id, { updatedAt: record.updatedAt, status: ["PUBLISHED"] }, { status: "DRAFT", publishedAt: null, updatedBy: adminId });
      if (!updated) throw stale();
      deps.revalidatePublic();
      await audit({ adminId, action: "unpublished", entityId: id, at, meta: { slug: record.slug, from: "PUBLISHED", to: "DRAFT" } });
      return toBlogPost(updated);
    },

    /** Soft delete (frees the slug; kept in the database). */
    remove,

    /** Deletes several; returns the ids actually deleted (missing ones are skipped). */
    async removeMany(ids: string[], adminId: string): Promise<string[]> {
      const done: string[] = [];
      for (const id of ids) {
        try {
          await remove(id, adminId);
          done.push(id);
        } catch (error) {
          if (!(error instanceof BlogError && (error.kind === "NOT_FOUND" || error.kind === "STALE_RECORD"))) throw error;
        }
      }
      return done;
    },
  };
}

export type BlogService = ReturnType<typeof createBlogService>;
