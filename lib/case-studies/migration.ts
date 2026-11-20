/**
 * Approved case study migration — records and planning. Pure (no database access); used by
 * scripts/migrate-case-studies.mjs and by the tests.
 *
 * Source of truth: the nine approved projects in lib/content/case-studies.ts (the client's
 * exact titles, highlights, overviews, services, figures and wording). Nothing is added:
 * no client names, dates, metrics, testimonials or images beyond what that file holds.
 * The archived fictional samples (lib/content/archive/) are never read.
 *
 * Status: PUBLISHED only for slugs on the client's explicit approval list
 * (lib/content/case-studies-publishing.ts); anything else would be created as DRAFT.
 * Featured: the projects the Home page already features (lib/content/selected-work.ts).
 * Cover: the existing illustrative photograph where the project has one (flagged
 * `illustrative`), otherwise the branded typographic cover the site already shows.
 *
 * Each record has a stable migration key ("approved-2026-11:<slug>") and a content hash, so a
 * re-run inserts nothing twice, updates only records nobody has edited since the last run,
 * and never touches records an admin changed or deleted.
 */

import { createHash } from "node:crypto";
import { caseStudies as approved, type CaseStudy } from "@/lib/content/case-studies";
import { publishedCaseStudySlugs } from "@/lib/content/case-studies-publishing";
import { selectedWork } from "@/lib/content/selected-work";
import type { CaseStudyStatus } from "./constants";
import type { CaseStudyContent } from "./types";

export const MIGRATION_PREFIX = "approved-2026-11";
export const migrationKey = (slug: string) => `${MIGRATION_PREFIX}:${slug}`;

export interface MigrationRecord {
  key: string;
  hash: string;
  status: CaseStudyStatus;
  content: CaseStudyContent;
}

/** Stable JSON (sorted keys) → sha256. */
export function contentHash(value: unknown): string {
  const stable = (v: unknown): unknown =>
    Array.isArray(v) ? v.map(stable) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v as Record<string, unknown>).filter(([, x]) => x !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, stable(x)])) : v;
  return createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}

export function toMigrationContent(p: CaseStudy): CaseStudyContent {
  const figures = p.figures.map((f) => ({ value: f.value, label: f.label }));
  return {
    title: p.title,
    slug: p.slug,
    projectHighlight: p.highlight,
    overview: p.overview,
    category: p.discipline,
    group: p.group,
    filters: [...p.filters],
    services: p.services.map((name) => ({ name })),
    scope: p.figuresLabel === "Project Scope" ? figures.map((f) => ({ value: f.value, title: f.label })) : [],
    results: p.figuresLabel === "Results" ? figures : [],
    coverImage: p.image.src
      ? { kind: "IMAGE", url: p.image.src, alt: p.image.alt, illustrative: p.image.temporary === true, ...(p.image.position ? { position: p.image.position } : {}) }
      : { kind: "TYPOGRAPHIC", alt: "", illustrative: false },
    gallery: [],
    featured: selectedWork.slugs.includes(p.slug),
    sortOrder: Number(p.number),
    seo: {},
  };
}

export function buildMigrationRecords(source: readonly CaseStudy[] = approved, approvedSlugs: readonly string[] = publishedCaseStudySlugs): MigrationRecord[] {
  return source.map((p) => {
    const content = toMigrationContent(p);
    const status: CaseStudyStatus = approvedSlugs.includes(p.slug) ? "PUBLISHED" : "DRAFT";
    return { key: migrationKey(p.slug), hash: contentHash({ content, status }), status, content };
  });
}

/* Planning ----------------------------------------------------------------------------------- */

export interface ExistingMigrated {
  id: string;
  hash: string;
  appliedAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

/** What the planner needs from a record (case studies and blog posts both fit). */
export interface PlannableRecord {
  key: string;
  hash: string;
  content: { slug: string };
}

export type MigrationStep<R extends PlannableRecord = MigrationRecord> =
  | { kind: "insert"; record: R }
  | { kind: "update"; record: R; id: string }
  | { kind: "skip-unchanged"; record: R; id: string }
  | { kind: "skip-edited"; record: R; id: string }
  | { kind: "skip-deleted"; record: R; id: string }
  | { kind: "conflict"; record: R; reason: string };

/** A record counts as edited when it changed more than a second after the migration wrote it. */
const EDIT_TOLERANCE_MS = 1000;

/**
 * Decides what to do for each record.
 * @param existingByKey records already created by this migration (deleted ones included)
 * @param activeSlugs  slugs used by active records NOT created by this migration
 */
export function planMigration<R extends PlannableRecord>(records: R[], existingByKey: Map<string, ExistingMigrated>, activeSlugs: Set<string>): MigrationStep<R>[] {
  return records.map((record): MigrationStep<R> => {
    const existing = existingByKey.get(record.key);
    if (existing) {
      if (existing.deleted) return { kind: "skip-deleted", record, id: existing.id };
      if (existing.updatedAt.getTime() - existing.appliedAt.getTime() > EDIT_TOLERANCE_MS) return { kind: "skip-edited", record, id: existing.id };
      if (existing.hash === record.hash) return { kind: "skip-unchanged", record, id: existing.id };
      return { kind: "update", record, id: existing.id };
    }
    if (activeSlugs.has(record.content.slug)) return { kind: "conflict", record, reason: `slug "${record.content.slug}" is already used by another case study` };
    return { kind: "insert", record };
  });
}

export function summarize(steps: MigrationStep<PlannableRecord>[]) {
  const count = (kind: MigrationStep<PlannableRecord>["kind"]) => steps.filter((s) => s.kind === kind).length;
  return {
    insert: count("insert"),
    update: count("update"),
    skipUnchanged: count("skip-unchanged"),
    skipEdited: count("skip-edited"),
    skipDeleted: count("skip-deleted"),
    conflict: count("conflict"),
  };
}
