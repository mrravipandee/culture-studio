/** In-memory BlogRepository with the MongoDB repository's contract (unique active slug, conditional writes, soft delete). */

import { DuplicateSlugError, type BlogPatch, type BlogRepository, type BlogWriteGuard, type NewBlogPost } from "@/lib/blog/service";
import type { BlogRecord } from "@/lib/blog/rules";

const clone = <T,>(v: T): T => structuredClone(v);

export function createMemoryBlogRepository(clock: () => Date) {
  const rows = new Map<string, BlogRecord>();
  let seq = 0;
  let last = 0;
  const tick = () => new Date((last = Math.max(clock().getTime(), last + 1)));
  const taken = (slug: string, exceptId?: string) => [...rows.values()].some((r) => r.deletedAt === null && r.slug === slug && r.id !== exceptId);

  const repo: BlogRepository & { rows: Map<string, BlogRecord> } = {
    rows,
    async findById(id) {
      const r = rows.get(id);
      return r && r.deletedAt === null ? clone(r) : null;
    },
    async takenSlugs(slugs, exceptId) {
      return new Set(slugs.filter((s) => taken(s, exceptId)));
    },
    async slugsLike(base) {
      return new Set([...rows.values()].filter((r) => r.deletedAt === null && (r.slug === base || new RegExp(`^${base}-\\d+$`).test(r.slug))).map((r) => r.slug));
    },
    async listSummaries() {
      return { items: [...rows.values()].filter((r) => r.deletedAt === null).map(clone), truncated: false };
    },
    async insert(post: NewBlogPost) {
      if (taken(post.slug)) throw new DuplicateSlugError();
      const at = tick();
      const id = (++seq).toString(16).padStart(24, "0");
      const { createdBy: _c, updatedBy: _u, ...content } = post;
      void _c;
      void _u;
      const row: BlogRecord = { ...clone(content), id, publishedAt: null, firstPublishedAt: null, createdAt: at, updatedAt: at, deletedAt: null, migration: null };
      rows.set(id, row);
      return clone(row);
    },
    async update(id, guard: BlogWriteGuard, patch: BlogPatch) {
      const r = rows.get(id);
      if (!r || r.deletedAt !== null) return null;
      if (guard.updatedAt && guard.updatedAt.getTime() !== r.updatedAt.getTime()) return null;
      if (guard.status && !guard.status.includes(r.status)) return null;
      const { category, updatedBy: _u, deletedBy: _d, ...rest } = patch;
      void _u;
      void _d;
      const next = { ...r, ...clone(rest), updatedAt: tick() } as BlogRecord;
      if (category === null) delete next.category;
      else if (category !== undefined) next.category = category;
      if (next.deletedAt === null && taken(next.slug, id)) throw new DuplicateSlugError();
      rows.set(id, next);
      return clone(next);
    },
  };
  return repo;
}
