/**
 * Case Studies — service, validation, publishing, public-resolution and migration tests.
 * Run: npm run test:case-studies   (Node test runner, no database: in-memory repository)
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createCaseStudyService, CaseStudyError, type AuditEvent } from "@/lib/case-studies/service";
import { caseStudyCreateSchema, caseStudyUpdateSchema, caseStudyListQuerySchema, publicCaseStudyListQuerySchema, caseStudyRestoreSchema } from "@/lib/case-studies/validation";
import { publishIssues, resolveCaseStudyPage, toPublicCaseStudy, comparePublicOrder, nextPreviousSlugs, suggestSlug, type CaseStudyRecord } from "@/lib/case-studies/rules";
import { buildMigrationRecords, planMigration, summarize, migrationKey, type ExistingMigrated } from "@/lib/case-studies/migration";
import { caseStudies as approvedSource } from "@/lib/content/case-studies";
import { publishedCaseStudySlugs } from "@/lib/content/case-studies-publishing";
import { parseNestedWith } from "@/lib/validation/common";
import { createMemoryRepository } from "./memory-repository";

const ADMIN = "aaaaaaaaaaaaaaaaaaaaaaaa";

function setup() {
  let now = Date.parse("2026-11-20T10:00:00Z");
  const clock = () => new Date((now += 1000));
  const repo = createMemoryRepository(clock);
  const audits: AuditEvent[] = [];
  let revalidations = 0;
  const service = createCaseStudyService({
    repo,
    audit: async (e) => void audits.push(e),
    revalidatePublic: () => void revalidations++,
    now: clock,
  });
  return { service, repo, audits, revalidations: () => revalidations };
}

const validBody = (extra: Record<string, unknown> = {}) => ({
  title: "Brand Refresh",
  projectHighlight: "A clearer brand for a hospitality advisory firm.",
  overview: "Developed brand positioning and identity.",
  category: "brand-strategy-communications",
  services: [{ name: "Brand Positioning" }],
  coverImage: { kind: "IMAGE", url: "/images/case-studies/the-dco-architecture.jpg", alt: "Glass towers" },
  ...extra,
});

const parseCreate = (body: unknown) => {
  const r = parseNestedWith(caseStudyCreateSchema, body);
  if (!r.ok) throw new Error(JSON.stringify(r.fields));
  return r.data;
};

async function draft(s: ReturnType<typeof setup>, extra: Record<string, unknown> = {}) {
  return s.service.create(parseCreate(validBody(extra)), ADMIN);
}

const expectError = async (p: Promise<unknown>, kind: CaseStudyError["kind"]) => {
  await assert.rejects(p, (e: unknown) => e instanceof CaseStudyError && e.kind === kind);
};

/* Schema and validation (1–10) ----------------------------------------------------------------- */

test("1. a valid case study is accepted (and normalised)", () => {
  const r = parseNestedWith(caseStudyCreateSchema, validBody({ title: "  Brand   Refresh " }));
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.data.title, "Brand Refresh");
});

test("2. missing title is rejected", () => {
  const body: Record<string, unknown> = validBody();
  delete body.title;
  const r = parseNestedWith(caseStudyCreateSchema, body);
  assert.equal(r.ok, false);
  if (!r.ok) assert.ok(r.fields.title);
});

test("3. missing overview is rejected", () => {
  const r = parseNestedWith(caseStudyCreateSchema, validBody({ overview: "   " }));
  assert.equal(r.ok, false);
  if (!r.ok) assert.ok(r.fields.overview);
});

test("4. invalid slugs are rejected", () => {
  for (const slug of ["Bad Slug", "double--hyphen", "-edge", "ünïcode", "new", "a".repeat(81)]) {
    const r = parseNestedWith(caseStudyCreateSchema, validBody({ slug }));
    assert.equal(r.ok, false, slug);
  }
});

test("5. duplicate slug is rejected with a suggestion", async () => {
  const s = setup();
  await draft(s, { slug: "brand-refresh" });
  await assert.rejects(draft(s, { slug: "brand-refresh" }), (e: unknown) => e instanceof CaseStudyError && e.kind === "SLUG_TAKEN" && e.suggestion === "brand-refresh-2");
});

test("6. invalid services are rejected (unknown catalog id, empty name, duplicate)", () => {
  for (const services of [[{ name: "X", serviceId: "not-a-service" }], [{ name: "  " }], [{ name: "SEO" }, { name: "seo" }]]) {
    assert.equal(parseNestedWith(caseStudyCreateSchema, validBody({ services })).ok, false);
  }
  assert.equal(parseNestedWith(caseStudyCreateSchema, validBody({ services: [{ name: "SEO", serviceId: "search-engine-optimisation" }] })).ok, true);
});

test("7. invalid status is rejected (status can't be set through content at all)", () => {
  assert.equal(parseNestedWith(caseStudyCreateSchema, validBody({ status: "PUBLISHED" })).ok, false);
  assert.equal(parseNestedWith(caseStudyListQuerySchema, { status: "LIVE" }).ok, false);
});

test("8. missing image alt text blocks publishing (not saving)", () => {
  const data = parseCreate(validBody({ coverImage: { kind: "IMAGE", url: "/images/case-studies/the-dco-architecture.jpg", alt: "" } }));
  const issues = publishIssues({ ...data, slug: "x" });
  assert.ok(issues["coverImage.alt"]);
});

test("9. results are optional for publishing", () => {
  const data = parseCreate(validBody());
  assert.deepEqual(data.results, []);
  assert.deepEqual(publishIssues({ ...data, slug: "brand-refresh" }), {});
});

test("10. unknown properties are rejected (create, update, nested, query)", () => {
  assert.equal(parseNestedWith(caseStudyCreateSchema, validBody({ createdBy: ADMIN })).ok, false);
  assert.equal(parseNestedWith(caseStudyCreateSchema, validBody({ coverImage: { kind: "NONE", hack: 1 } })).ok, false);
  assert.equal(parseNestedWith(caseStudyUpdateSchema, { expectedUpdatedAt: new Date().toISOString(), changes: { publishedAt: "2020-01-01" } }).ok, false);
  assert.equal(parseNestedWith(publicCaseStudyListQuerySchema, { status: "DRAFT" }).ok, false);
});

test("images: blob, data, remote and traversal URLs are rejected", () => {
  for (const url of ["blob:http://x/1", "data:image/png;base64,AA", "https://evil.example/x.jpg", "/images/../secret.jpg", "/uploads/x.jpg"]) {
    assert.equal(parseNestedWith(caseStudyCreateSchema, validBody({ coverImage: { kind: "IMAGE", url, alt: "a" } })).ok, false, url);
  }
});

test("search input is literal (regex/operator text can't become a query)", () => {
  const r = parseNestedWith(caseStudyListQuerySchema, { search: '{"$ne":null}.*' });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(typeof r.data.search, "string");
});

/* CRUD (11–20) ---------------------------------------------------------------------------------- */

test("11–12. create makes a DRAFT with a generated slug, readable in admin", async () => {
  const s = setup();
  const created = await draft(s);
  assert.equal(created.status, "DRAFT");
  assert.equal(created.slug, "brand-refresh");
  assert.equal(created.publishedAt, null);
  const read = await s.service.get(created.id);
  assert.equal(read.title, "Brand Refresh");
  assert.equal(s.audits[0].action, "created");
});

test("13–14. update changes only the given fields and keeps the rest", async () => {
  const s = setup();
  const c = await draft(s, { results: [{ value: "25%", label: "Sales Growth" }] });
  const u = await s.service.update(c.id, c.updatedAt, { title: "Brand Refresh 2" }, ADMIN);
  assert.equal(u.title, "Brand Refresh 2");
  assert.deepEqual(u.results, [{ value: "25%", label: "Sales Growth" }]);
  assert.equal(u.overview, c.overview);
  assert.equal(u.status, "DRAFT");
  assert.equal(s.revalidations(), 0, "drafts don't touch the public cache");
});

test("concurrent edit: a stale expectedUpdatedAt is rejected", async () => {
  const s = setup();
  const c = await draft(s);
  await s.service.update(c.id, c.updatedAt, { title: "First" }, ADMIN);
  await expectError(s.service.update(c.id, c.updatedAt, { title: "Second" }, ADMIN), "STALE_RECORD");
});

test("15–16. soft delete hides the record and frees its slug; restore returns it as DRAFT", async () => {
  const s = setup();
  const c = await draft(s);
  const published = await s.service.transition(c.id, "publish", ADMIN);
  await s.service.remove(c.id, ADMIN);
  await expectError(s.service.get(c.id), "NOT_FOUND");
  const list = await s.service.list(parseQuery({}));
  assert.equal(list.items.length, 0);
  assert.equal(list.counts.deleted, 1);
  const deletedView = await s.service.list(parseQuery({ status: "deleted" }));
  assert.equal(deletedView.items.length, 1);
  await expectError(s.service.remove(c.id, ADMIN), "NOT_FOUND");
  const restored = await s.service.transition(c.id, "restore", ADMIN);
  assert.equal(restored.status, "DRAFT");
  assert.equal(restored.deletedAt, null);
  assert.equal(restored.publishedAt, null);
  assert.equal(restored.firstPublishedAt, published.firstPublishedAt, "first publication is kept");
});

test("restore of a deleted record whose slug was taken needs a new slug", async () => {
  const s = setup();
  const a = await draft(s);
  await s.service.remove(a.id, ADMIN);
  await draft(s); // takes "brand-refresh"
  await assert.rejects(s.service.transition(a.id, "restore", ADMIN), (e: unknown) => e instanceof CaseStudyError && e.kind === "SLUG_TAKEN" && e.suggestion === "brand-refresh-2");
  const restored = await s.service.transition(a.id, "restore", ADMIN, { slug: "brand-refresh-2" });
  assert.equal(restored.slug, "brand-refresh-2");
});

test("17–18. invalid and missing ids", async () => {
  const s = setup();
  await expectError(s.service.get("not-an-id"), "NOT_FOUND");
  await expectError(s.service.get("ffffffffffffffffffffffff"), "NOT_FOUND");
});

test("20. mass assignment: status/audit fields can't be set through update", () => {
  for (const changes of [{ status: "PUBLISHED" }, { createdBy: ADMIN }, { deletedAt: null }, { firstPublishedAt: "2020-01-01T00:00:00Z" }, { previousSlugs: ["x"] }]) {
    assert.equal(parseNestedWith(caseStudyUpdateSchema, { expectedUpdatedAt: new Date().toISOString(), changes }).ok, false, JSON.stringify(changes));
  }
});

/* Publishing (21–28) --------------------------------------------------------------------------- */

test("21. a valid draft publishes; publishedAt and firstPublishedAt set; cache invalidated; audited", async () => {
  const s = setup();
  const c = await draft(s);
  const p = await s.service.transition(c.id, "publish", ADMIN);
  assert.equal(p.status, "PUBLISHED");
  assert.ok(p.publishedAt);
  assert.equal(p.firstPublishedAt, p.publishedAt);
  assert.equal(s.revalidations(), 1);
  assert.equal(s.audits.at(-1)?.action, "published");
});

test("22. an incomplete draft can't publish (field errors, status unchanged)", async () => {
  const s = setup();
  const c = await s.service.create(parseCreate({ title: "Bare", projectHighlight: "x", overview: "y" }), ADMIN);
  await assert.rejects(s.service.transition(c.id, "publish", ADMIN), (e: unknown) => e instanceof CaseStudyError && e.kind === "PUBLISH_VALIDATION" && Boolean(e.fields?.services && e.fields?.coverImage && e.fields?.category));
  assert.equal((await s.service.get(c.id)).status, "DRAFT");
});

test("23. unpublish returns to DRAFT and clears publishedAt (first publication kept)", async () => {
  const s = setup();
  const c = await draft(s);
  const p = await s.service.transition(c.id, "publish", ADMIN);
  const u = await s.service.transition(c.id, "unpublish", ADMIN);
  assert.equal(u.status, "DRAFT");
  assert.equal(u.publishedAt, null);
  assert.equal(u.firstPublishedAt, p.firstPublishedAt);
});

test("24. archive hides from the public set; restore → DRAFT; republish after validation", async () => {
  const s = setup();
  const c = await draft(s);
  await s.service.transition(c.id, "publish", ADMIN);
  const a = await s.service.transition(c.id, "archive", ADMIN);
  assert.equal(a.status, "ARCHIVED");
  assert.equal(a.publishedAt, null);
  const again = await s.service.transition(c.id, "publish", ADMIN); // ARCHIVED → PUBLISHED (validated)
  assert.equal(again.status, "PUBLISHED");
  await s.service.transition(c.id, "archive", ADMIN);
  const r = await s.service.transition(c.id, "restore", ADMIN);
  assert.equal(r.status, "DRAFT");
});

test("26. timestamps: unrelated edits don't move publishedAt; republish keeps firstPublishedAt", async () => {
  const s = setup();
  const c = await draft(s);
  const p = await s.service.transition(c.id, "publish", ADMIN);
  const e = await s.service.update(c.id, p.updatedAt, { overview: "Edited overview." }, ADMIN);
  assert.equal(e.publishedAt, p.publishedAt);
  await s.service.transition(c.id, "unpublish", ADMIN);
  const again = await s.service.transition(c.id, "publish", ADMIN);
  assert.notEqual(again.publishedAt, p.publishedAt);
  assert.equal(again.firstPublishedAt, p.firstPublishedAt);
});

test("27. unsupported transitions are rejected", async () => {
  const s = setup();
  const c = await draft(s);
  await expectError(s.service.transition(c.id, "unpublish", ADMIN), "INVALID_TRANSITION");
  await expectError(s.service.transition(c.id, "archive", ADMIN), "INVALID_TRANSITION"); // DRAFT → ARCHIVED
  await expectError(s.service.transition(c.id, "restore", ADMIN), "INVALID_TRANSITION"); // DRAFT, not deleted
  await s.service.transition(c.id, "publish", ADMIN);
  await expectError(s.service.transition(c.id, "publish", ADMIN), "INVALID_TRANSITION");
});

test("28. concurrent slug conflict: the unique index guard still wins over a race", async () => {
  const s = setup();
  const a = await draft(s, { slug: "alpha" });
  const b = await draft(s, { slug: "beta" });
  // Simulate the race: the pre-check passes, then another write takes the slug.
  const takenSlugs = s.repo.takenSlugs;
  s.repo.takenSlugs = async () => new Set();
  await assert.rejects(s.service.update(b.id, b.updatedAt, { slug: "alpha" }, ADMIN), (e: unknown) => e instanceof CaseStudyError && e.kind === "SLUG_TAKEN");
  s.repo.takenSlugs = takenSlugs;
  assert.equal((await s.service.get(a.id)).slug, "alpha");
  assert.equal((await s.service.get(b.id)).slug, "beta");
});

test("concurrent status actions: only one of two simultaneous publishes succeeds", async () => {
  const s = setup();
  const c = await draft(s);
  const results = await Promise.allSettled([s.service.transition(c.id, "publish", ADMIN), s.service.transition(c.id, "publish", ADMIN)]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
});

test("a published record can't be edited into an unpublishable state", async () => {
  const s = setup();
  const c = await draft(s);
  const p = await s.service.transition(c.id, "publish", ADMIN);
  await expectError(s.service.update(c.id, p.updatedAt, { coverImage: { kind: "NONE", alt: "", illustrative: false } }, ADMIN), "PUBLISH_VALIDATION");
});

/* Public access (29–37) --------------------------------------------------------------------------- */

const record = (over: Partial<CaseStudyRecord>): CaseStudyRecord => ({
  id: "x",
  title: "T",
  slug: "t",
  projectHighlight: "H",
  overview: "O",
  category: "content-creative",
  group: "selected",
  filters: [],
  services: [{ name: "S" }],
  scope: [],
  results: [{ value: "1", label: "L" }],
  coverImage: { kind: "TYPOGRAPHIC", alt: "", illustrative: false },
  gallery: [],
  featured: false,
  sortOrder: 0,
  seo: {},
  status: "PUBLISHED",
  publishedAt: new Date("2026-01-01"),
  firstPublishedAt: new Date("2026-01-01"),
  previousSlugs: [],
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  migration: null,
  ...over,
});

test("29–33, 37. public resolution: current slug wins, old slug redirects once, others 404", () => {
  const published = [record({ slug: "a", sortOrder: 2, title: "A" }), record({ slug: "b", sortOrder: 1, title: "B" })].sort(comparePublicOrder).map((r, i) => toPublicCaseStudy(r, i + 1));
  assert.deepEqual(published.map((p) => [p.slug, p.number]), [["b", "01"], ["a", "02"]]);
  const found = resolveCaseStudyPage(published, "a", null);
  assert.equal(found.kind, "found");
  if (found.kind === "found") assert.equal(found.next?.slug, "b");
  assert.deepEqual(resolveCaseStudyPage(published, "old-a", "a"), { kind: "redirect", slug: "a" });
  assert.deepEqual(resolveCaseStudyPage(published, "old-a", "old-a"), { kind: "missing" }, "never redirects to itself");
  assert.deepEqual(resolveCaseStudyPage(published, "old-a", "unpublished-target"), { kind: "missing" }, "never redirects to a non-public page");
  assert.deepEqual(resolveCaseStudyPage(published, "unknown", null), { kind: "missing" });
});

test("36. public view and SEO use the record's own content (with documented fallbacks)", () => {
  const p = toPublicCaseStudy(record({ title: "THE DCO", projectHighlight: "Highlight.", seo: {} }), 1);
  assert.equal(p.seo.title, "THE DCO — Case Study");
  assert.equal(p.seo.description, "Highlight.");
  const q = toPublicCaseStudy(record({ seo: { title: "Custom", description: "Desc" } }), 1);
  assert.equal(q.seo.title, "Custom");
  assert.equal(q.seo.description, "Desc");
});

test("slug change of a once-public page keeps the old slug as a redirect (no self-loops)", async () => {
  const s = setup();
  const c = await draft(s, { slug: "first" });
  const p = await s.service.transition(c.id, "publish", ADMIN);
  const r1 = await s.service.update(c.id, p.updatedAt, { slug: "second" }, ADMIN);
  assert.deepEqual(r1.previousSlugs, ["first"]);
  const r2 = await s.service.update(c.id, r1.updatedAt, { slug: "first" }, ADMIN);
  assert.deepEqual(r2.previousSlugs, ["second"], "the current slug is never in its own redirect list");
  assert.equal(s.revalidations() >= 3, true);
  assert.deepEqual(nextPreviousSlugs({ slug: "d", previousSlugs: [], firstPublishedAt: null }, "e"), [], "never-public drafts keep no redirects");
});

test("suggestSlug picks the first free suffix within the length limit", () => {
  assert.equal(suggestSlug("x", (s) => s === "x-2"), "x-3");
  assert.ok(suggestSlug("a".repeat(80), () => false).length <= 80);
});

/* Migration (38–42) ----------------------------------------------------------------------------- */

test("38. the nine approved projects migrate with their exact content", () => {
  const records = buildMigrationRecords();
  assert.equal(records.length, 9);
  for (const r of records) {
    const source = approvedSource.find((p) => r.key === migrationKey(p.slug));
    assert.ok(source);
    assert.equal(r.content.title, source.title);
    assert.equal(r.content.projectHighlight, source.highlight);
    assert.equal(r.content.overview, source.overview);
    assert.deepEqual(r.content.services.map((s) => s.name), source.services);
    const figures = [...r.content.results.map((x) => `${x.value} ${x.label}`), ...r.content.scope.map((x) => `${x.value} ${x.title}`)];
    assert.deepEqual(figures, source.figures.map((f) => `${f.value} ${f.label}`));
    assert.equal(parseNestedWith(caseStudyCreateSchema, r.content).ok, true, r.content.slug);
    assert.deepEqual(publishIssues(r.content), {}, r.content.slug);
  }
  assert.equal(records.filter((r) => r.status === "PUBLISHED").length, publishedCaseStudySlugs.length);
});

test("39. re-running the migration creates no duplicates", () => {
  const records = buildMigrationRecords();
  const at = new Date();
  const existing = new Map<string, ExistingMigrated>(records.map((r, i) => [r.key, { id: String(i), hash: r.hash, appliedAt: at, updatedAt: at, deleted: false }]));
  assert.deepEqual(summarize(planMigration(records, existing, new Set())), { insert: 0, update: 0, skipUnchanged: 9, skipEdited: 0, skipDeleted: 0, conflict: 0 });
});

test("40. records edited or deleted in the admin are never overwritten; slug conflicts are reported", () => {
  const records = buildMigrationRecords();
  const at = new Date("2026-11-20T00:00:00Z");
  const existing = new Map<string, ExistingMigrated>([
    [records[0].key, { id: "0", hash: "old", appliedAt: at, updatedAt: new Date(at.getTime() + 60_000), deleted: false }],
    [records[1].key, { id: "1", hash: "old", appliedAt: at, updatedAt: at, deleted: true }],
    [records[2].key, { id: "2", hash: "old", appliedAt: at, updatedAt: at, deleted: false }],
  ]);
  const steps = planMigration(records, existing, new Set([records[3].content.slug]));
  assert.deepEqual(steps.slice(0, 4).map((s) => s.kind), ["skip-edited", "skip-deleted", "update", "conflict"]);
});

test("41. fictional placeholders are never migrated", () => {
  const slugs = new Set(buildMigrationRecords().map((r) => r.content.slug));
  assert.deepEqual([...slugs].sort(), approvedSource.map((p) => p.slug).sort());
  assert.ok(buildMigrationRecords([approvedSource[0]], []).every((r) => r.status === "DRAFT"), "unapproved source → DRAFT");
});

test("42. dry-run plan counts are accurate", () => {
  const s = summarize(planMigration(buildMigrationRecords(), new Map(), new Set()));
  assert.deepEqual(s, { insert: 9, update: 0, skipUnchanged: 0, skipEdited: 0, skipDeleted: 0, conflict: 0 });
});

test("restore body accepts an optional slug only", () => {
  assert.equal(parseNestedWith(caseStudyRestoreSchema, { slug: "x-2" }).ok, true);
  assert.equal(parseNestedWith(caseStudyRestoreSchema, { status: "PUBLISHED" }).ok, false);
});

function parseQuery(q: Record<string, string>) {
  const r = parseNestedWith(caseStudyListQuerySchema, q);
  if (!r.ok) throw new Error("bad query");
  return r.data;
}
