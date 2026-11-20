#!/usr/bin/env node
/**
 * Migrates the nine approved case studies (lib/content/case-studies.ts) into MongoDB.
 *
 *   npm run cs:migrate                     # DRY RUN (default): shows the plan, writes nothing
 *   npm run cs:migrate -- --apply          # performs the plan
 *   npm run cs:migrate -- --apply --admin=you@example.com   # when more than one admin exists
 *
 * Safe to run repeatedly (idempotent):
 *  - each record has a stable migration key ("approved-2026-11:<slug>"), unique in the DB;
 *  - a record already created by this script is updated only if nobody edited it since and
 *    its source content changed; records an admin edited or deleted are never touched;
 *  - a slug already used by another (non-migrated) case study is reported as a conflict and
 *    skipped, never overwritten.
 * Every record is validated with the app's own rules (content schema + publishing readiness)
 * before anything is written. createdBy / updatedBy are the admin account running it.
 *
 * Public pages read through a cache that refreshes hourly; after --apply they show the
 * records within the hour, or immediately after the next deploy / admin change.
 * Needs MONGODB_URI (from .env via the npm script). Prints no credentials.
 */

import mongoose from "mongoose";

const apply = process.argv.includes("--apply");
const adminFlag = process.argv.find((a) => a.startsWith("--admin="))?.slice("--admin=".length).trim().toLowerCase();
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Run via: npm run cs:migrate");
  process.exit(1);
}

const { buildMigrationRecords, planMigration, summarize, MIGRATION_PREFIX } = await import("../lib/case-studies/migration.ts");
const { caseStudyContentSchema } = await import("../lib/case-studies/validation.ts");
const { publishIssues } = await import("../lib/case-studies/rules.ts");
const { CaseStudyModel } = await import("../lib/db/models/CaseStudy.ts");
const { AdminModel } = await import("../lib/db/models/Admin.ts");

/* 1. Build and validate the records (no database yet) -------------------------------------- */

const records = buildMigrationRecords();
const invalid = [];
for (const r of records) {
  const parsed = caseStudyContentSchema.safeParse(r.content);
  if (!parsed.success) invalid.push(`${r.content.slug}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
  if (r.status === "PUBLISHED") {
    const issues = publishIssues(r.content);
    if (Object.keys(issues).length) invalid.push(`${r.content.slug}: not publishable (${Object.keys(issues).join(", ")})`);
  }
}
if (invalid.length) {
  console.error(`Aborted: ${invalid.length} record(s) failed validation:\n  ${invalid.join("\n  ")}`);
  process.exit(1);
}

/* 2. Read the current state and plan --------------------------------------------------------- */

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000, autoIndex: false, maxPoolSize: 2 });
let exitCode = 0;
try {
  console.log(`Database "${mongoose.connection.db.databaseName}". Mode: ${apply ? "APPLY" : "DRY RUN (no changes)"}\n`);

  const existing = await CaseStudyModel.find({ "migration.key": { $regex: `^${MIGRATION_PREFIX}:` } })
    .select("migration updatedAt deletedAt status firstPublishedAt")
    .lean();
  const existingByKey = new Map(
    existing.map((d) => [d.migration.key, { id: d._id.toString(), hash: d.migration.hash, appliedAt: d.migration.appliedAt, updatedAt: d.updatedAt, deleted: d.deletedAt !== null, status: d.status, firstPublishedAt: d.firstPublishedAt }]),
  );
  const others = await CaseStudyModel.find({ activeSlug: { $in: records.map((r) => r.content.slug) }, "migration.key": { $not: { $regex: `^${MIGRATION_PREFIX}:` } } })
    .select("activeSlug")
    .lean();
  const activeSlugs = new Set(others.map((d) => d.activeSlug));

  const steps = planMigration(records, existingByKey, activeSlugs);
  const labels = { insert: "+ insert", update: "~ update", "skip-unchanged": "= unchanged", "skip-edited": "· skip (edited in admin)", "skip-deleted": "· skip (deleted in admin)", conflict: "! CONFLICT" };
  for (const step of steps) {
    console.log(`  ${labels[step.kind].padEnd(26)} ${step.record.content.slug.padEnd(34)} ${step.record.status}${step.kind === "conflict" ? `  (${step.reason})` : ""}`);
  }
  const totals = summarize(steps);
  console.log(`\nPlan: ${totals.insert} insert · ${totals.update} update · ${totals.skipUnchanged} unchanged · ${totals.skipEdited} edited (kept) · ${totals.skipDeleted} deleted (kept) · ${totals.conflict} conflict`);
  if (totals.conflict) exitCode = 2;

  /* 3. Apply ----------------------------------------------------------------------------------- */

  if (apply && (totals.insert || totals.update)) {
    const admins = await AdminModel.find(adminFlag ? { email: adminFlag } : {}).select("_id").limit(2).lean();
    if (admins.length !== 1) {
      console.error(adminFlag ? `No admin with that email.` : `Found ${admins.length === 0 ? "no admin" : "more than one admin"}; pass --admin=<email>.`);
      process.exit(1);
    }
    const adminId = admins[0]._id;
    let inserted = 0;
    let updated = 0;
    let lost = 0;

    for (const step of steps) {
      const at = new Date();
      const { content, status, key, hash } = step.record;
      const published = status === "PUBLISHED";
      if (step.kind === "insert") {
        try {
          await CaseStudyModel.create(
            [
              {
                ...content,
                activeSlug: content.slug,
                previousSlugs: [],
                status,
                publishedAt: published ? at : null,
                firstPublishedAt: published ? at : null,
                createdBy: adminId,
                updatedBy: adminId,
                migration: { key, hash, appliedAt: at },
                createdAt: at,
                updatedAt: at,
              },
            ],
            { timestamps: false },
          );
          inserted++;
        } catch (error) {
          lost++;
          console.error(`  insert failed for ${content.slug} (${error?.code === 11000 ? "slug or key already exists" : error?.name ?? "error"}); nothing overwritten.`);
        }
      } else if (step.kind === "update") {
        const prev = existingByKey.get(key);
        const $set = { ...content, activeSlug: content.slug, status, updatedBy: adminId, migration: { key, hash, appliedAt: at }, updatedAt: at };
        // Keep the current publication date when it stays published; set/clear it on a change.
        if (!published) $set.publishedAt = null;
        else if (prev.status !== "PUBLISHED") $set.publishedAt = at;
        if (published && !prev.firstPublishedAt) $set.firstPublishedAt = at;
        const result = await CaseStudyModel.updateOne(
          // Guarded on the exact state we planned against, so a concurrent admin edit wins.
          { _id: prev.id, "migration.hash": prev.hash, updatedAt: prev.updatedAt, deletedAt: null },
          { $set },
          { timestamps: false, runValidators: true },
        );
        if (result.modifiedCount === 1) updated++;
        else {
          lost++;
          console.error(`  update skipped for ${content.slug}: it changed while the migration ran.`);
        }
      }
    }
    console.log(`\nApplied: ${inserted} inserted · ${updated} updated${lost ? ` · ${lost} not applied (see above)` : ""}.`);
    if (lost) exitCode = 2;
  } else if (!apply) {
    console.log("\nDry run: nothing was written. Re-run with --apply to perform this plan.");
  } else {
    console.log("\nNothing to apply.");
  }
} finally {
  await mongoose.disconnect();
}
process.exit(exitCode);
