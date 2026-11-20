#!/usr/bin/env node
/**
 * DEVELOPMENT DATABASE ONLY — integration test of the Case Studies service against real
 * MongoDB (the production repository, unique indexes and conditional updates).
 *
 *   npm run test:case-studies:db
 *
 * Safety:
 *  - Refuses unless the database named in MONGODB_URI looks like a development database
 *    (its name contains dev / test / staging / local). Never run against production.
 *  - Creates its own records only (titles start with "[db-test]", slugs with "db-test-"),
 *    and hard-deletes exactly those ids at the end (plus their audit entries).
 *  - Builds the case_studies / audit_logs indexes if missing (same as db:indexes --apply).
 */

import assert from "node:assert/strict";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI ?? "";
const dbName = uri.split("?")[0].split("/").pop() ?? "";
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}
if (!/(dev|test|staging|local)/i.test(dbName)) {
  console.error(`Refusing to run: database "${dbName || "(unknown)"}" doesn't look like a development database.`);
  process.exit(1);
}

const { connectToDatabase } = await import("../lib/db/mongoose.ts");
const { CaseStudyModel } = await import("../lib/db/models/CaseStudy.ts");
const { AuditLogModel } = await import("../lib/db/models/AuditLog.ts");
const { mongoCaseStudyRepository } = await import("../lib/case-studies/repository.ts");
const { createCaseStudyService, CaseStudyError } = await import("../lib/case-studies/service.ts");
const { caseStudyCreateSchema, caseStudyListQuerySchema } = await import("../lib/case-studies/validation.ts");
const { recordAudit } = await import("../lib/audit/log.ts");

await connectToDatabase();
await CaseStudyModel.createIndexes();
await AuditLogModel.createIndexes();

const ADMIN = new mongoose.Types.ObjectId().toString();
const run = Date.now().toString(36);
const created = new Set();
let revalidations = 0;
const service = createCaseStudyService({
  repo: mongoCaseStudyRepository,
  audit: (e) => recordAudit({ ...e, action: `case_study.${e.action}`, entityType: "CaseStudy" }),
  revalidatePublic: () => void revalidations++,
});

const body = (slug, extra = {}) =>
  caseStudyCreateSchema.parse({
    title: `[db-test] ${slug}`,
    slug: `db-test-${run}-${slug}`,
    projectHighlight: "Integration test record.",
    overview: "Created by scripts/test-case-studies-db.mjs.",
    category: "content-creative",
    services: [{ name: "Test Service" }],
    coverImage: { kind: "TYPOGRAPHIC" },
    ...extra,
  });
const query = (q) => caseStudyListQuerySchema.parse(q);
const kindOf = async (p) => {
  try {
    await p;
    return "ok";
  } catch (e) {
    return e instanceof CaseStudyError ? e.kind : `${e?.name}`;
  }
};

let passed = 0;
const check = async (name, fn) => {
  await fn();
  passed++;
  console.log(`  ✓ ${name}`);
};

try {
  await check("create → DRAFT, stored with activeSlug and audit entry", async () => {
    const a = await service.create(body("a"), ADMIN);
    created.add(a.id);
    assert.equal(a.status, "DRAFT");
    const raw = await CaseStudyModel.findById(a.id).lean();
    assert.equal(raw.activeSlug, a.slug);
    assert.equal(raw.createdBy.toString(), ADMIN);
    assert.equal(await AuditLogModel.countDocuments({ entityId: raw._id, action: "case_study.created" }), 1);
  });

  await check("unique active slug: duplicate create rejected (pre-check + index)", async () => {
    assert.equal(await kindOf(service.create(body("a"), ADMIN)), "SLUG_TAKEN");
    await assert.rejects(CaseStudyModel.create({ ...body("a"), activeSlug: `db-test-${run}-a`, status: "DRAFT" }), (e) => e?.code === 11000);
  });

  await check("update keeps unchanged fields; stale token rejected", async () => {
    const [id] = created;
    const before = await service.get(id);
    const after = await service.update(id, before.updatedAt, { title: "[db-test] a2" }, ADMIN);
    assert.equal(after.overview, before.overview);
    assert.equal(await kindOf(service.update(id, before.updatedAt, { title: "x" }, ADMIN)), "STALE_RECORD");
  });

  await check("publish / unpublish / archive / restore with timestamps", async () => {
    const [id] = created;
    const p = await service.transition(id, "publish", ADMIN);
    assert.ok(p.publishedAt && p.firstPublishedAt);
    assert.equal(await kindOf(service.transition(id, "publish", ADMIN)), "INVALID_TRANSITION");
    const u = await service.transition(id, "unpublish", ADMIN);
    assert.equal(u.publishedAt, null);
    assert.equal(u.firstPublishedAt, p.firstPublishedAt);
    await service.transition(id, "publish", ADMIN);
    const a = await service.transition(id, "archive", ADMIN);
    assert.equal(a.status, "ARCHIVED");
    const r = await service.transition(id, "restore", ADMIN);
    assert.equal(r.status, "DRAFT");
    assert.ok(revalidations >= 4);
  });

  await check("only one of two concurrent publishes succeeds", async () => {
    const b = await service.create(body("b"), ADMIN);
    created.add(b.id);
    const results = await Promise.allSettled([service.transition(b.id, "publish", ADMIN), service.transition(b.id, "publish", ADMIN)]);
    assert.equal(results.filter((x) => x.status === "fulfilled").length, 1);
  });

  await check("slug change of a published record keeps a redirect", async () => {
    const [, id] = created;
    const cur = await service.get(id);
    const moved = await service.update(id, cur.updatedAt, { slug: `db-test-${run}-b-moved` }, ADMIN);
    assert.deepEqual(moved.previousSlugs, [cur.slug]);
    assert.ok(await CaseStudyModel.exists({ previousSlugs: cur.slug, status: "PUBLISHED", deletedAt: null }));
  });

  await check("soft delete frees the slug; restore conflicts until a new slug is given", async () => {
    const c = await service.create(body("c"), ADMIN);
    created.add(c.id);
    await service.remove(c.id, ADMIN);
    assert.equal(await kindOf(service.get(c.id)), "NOT_FOUND");
    const c2 = await service.create(body("c"), ADMIN); // reuses the freed slug
    created.add(c2.id);
    assert.equal(await kindOf(service.transition(c.id, "restore", ADMIN)), "SLUG_TAKEN");
    const restored = await service.transition(c.id, "restore", ADMIN, { slug: `db-test-${run}-c-restored` });
    assert.equal(restored.status, "DRAFT");
  });

  await check("listing: search, status filter, deleted view, counts", async () => {
    const list = await service.list(query({ search: `db-test-${run}`, pageSize: "50" }));
    assert.ok(list.items.length >= 3);
    const regexLike = await service.list(query({ search: ".*" }));
    assert.ok(regexLike.items.every((i) => i.title.includes(".*") || i.slug.includes(".*")), "search is literal");
    const drafts = await service.list(query({ status: "DRAFT", search: `db-test-${run}` }));
    assert.ok(drafts.items.every((i) => i.status === "DRAFT"));
    assert.equal(typeof list.counts.PUBLISHED, "number");
  });

  console.log(`\n${passed} checks passed.`);
} catch (error) {
  console.error(`\nFAILED after ${passed} checks:`, error?.message ?? error);
  process.exitCode = 1;
} finally {
  const ids = [...created].map((id) => new mongoose.Types.ObjectId(id));
  await CaseStudyModel.deleteMany({ _id: { $in: ids }, title: /^\[db-test\]/ });
  await AuditLogModel.deleteMany({ entityId: { $in: ids } });
  await mongoose.disconnect();
}
