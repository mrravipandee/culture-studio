/**
 * In-memory CaseStudyRepository for unit tests. Mirrors the MongoDB repository's contract:
 * unique slug among active records (DuplicateSlugError), conditional updates on
 * deleted/updatedAt/status (null when the guard fails), soft delete frees the slug,
 * strictly increasing updatedAt per write.
 */

import { DuplicateSlugError, type CaseStudyPatch, type CaseStudyRepository, type NewCaseStudy, type WriteGuard } from "@/lib/case-studies/service";
import type { CaseStudyRecord } from "@/lib/case-studies/rules";
import type { CaseStudyCounts, CaseStudyListQuery } from "@/lib/case-studies/types";

const clone = <T,>(v: T): T => structuredClone(v);

export function createMemoryRepository(clock: () => Date) {
  const rows = new Map<string, CaseStudyRecord>();
  let seq = 0;
  let last = 0;
  const tick = () => {
    const t = Math.max(clock().getTime(), last + 1);
    last = t;
    return new Date(t);
  };
  const active = (r: CaseStudyRecord) => r.deletedAt === null;
  const slugTaken = (slug: string, exceptId?: string) => [...rows.values()].some((r) => active(r) && r.slug === slug && r.id !== exceptId);

  const repo: CaseStudyRepository & { rows: Map<string, CaseStudyRecord>; writes: number } = {
    rows,
    writes: 0,
    async findById(id, options = {}) {
      const r = rows.get(id);
      if (!r || (!options.includeDeleted && !active(r))) return null;
      return clone(r);
    },
    async takenSlugs(slugs, exceptId) {
      return new Set(slugs.filter((s) => slugTaken(s, exceptId)));
    },
    async slugsLike(base) {
      const re = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:-\\d+)?$`);
      return new Set([...rows.values()].filter((r) => active(r) && re.test(r.slug)).map((r) => r.slug));
    },
    async list(q: CaseStudyListQuery) {
      let items = [...rows.values()].filter((r) => (q.status === "deleted" ? !active(r) : active(r)));
      if (q.status !== "all" && q.status !== "deleted") items = items.filter((r) => r.status === q.status);
      if (q.featured !== undefined) items = items.filter((r) => r.featured === q.featured);
      if (q.category) items = items.filter((r) => r.category === q.category);
      if (q.search) items = items.filter((r) => r.title.toLowerCase().includes(q.search!.toLowerCase()) || r.slug.includes(q.search!.toLowerCase()));
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return { items: items.slice((q.page - 1) * q.pageSize, q.page * q.pageSize).map(clone), filtered: items.length };
    },
    async counts() {
      const c: CaseStudyCounts = { all: 0, DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0, deleted: 0, withImage: 0 };
      for (const r of rows.values()) {
        if (!active(r)) {
          c.deleted++;
          continue;
        }
        c.all++;
        c[r.status]++;
        if (r.coverImage.kind === "IMAGE") c.withImage++;
      }
      return c;
    },
    async insert(record: NewCaseStudy) {
      if (slugTaken(record.slug)) throw new DuplicateSlugError();
      const at = tick();
      const id = (++seq).toString(16).padStart(24, "0");
      const row: CaseStudyRecord = { ...clone(record), id, createdAt: at, updatedAt: at, deletedAt: null, migration: null };
      rows.set(id, row);
      repo.writes++;
      return clone(row);
    },
    async update(id, guard: WriteGuard, patch: CaseStudyPatch) {
      const r = rows.get(id);
      if (!r) return null;
      if (guard.deleted !== (r.deletedAt !== null)) return null;
      if (guard.updatedAt && guard.updatedAt.getTime() !== r.updatedAt.getTime()) return null;
      if (guard.status && !guard.status.includes(r.status)) return null;
      const { category, updatedBy, ...rest } = patch;
      delete (rest as { deletedBy?: unknown }).deletedBy;
      const next: CaseStudyRecord = { ...r, ...clone(rest) as Partial<CaseStudyRecord>, updatedBy, updatedAt: tick() } as CaseStudyRecord;
      if (category === null) delete next.category;
      else if (category !== undefined) next.category = category;
      if (next.deletedAt === null && slugTaken(next.slug, id)) throw new DuplicateSlugError();
      rows.set(id, next);
      repo.writes++;
      return clone(next);
    },
  };
  return repo;
}
