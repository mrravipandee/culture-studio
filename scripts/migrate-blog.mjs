#!/usr/bin/env node
/**
 * Migrates the four launch blog articles (lib/content/blog.ts + blog-bodies.ts) into MongoDB.
 *
 *   npm run blog:migrate                  # DRY RUN (default): prints the plan, writes nothing
 *   npm run blog:migrate -- --apply       # performs it (--admin=<email> if several admins)
 *
 * Idempotent: stable keys ("blog-launch-2026-11:<slug>") + content hashes. Never duplicates,
 * never overwrites posts an admin edited or deleted, reports slug conflicts. Every record is
 * validated with the app's own rules (sanitiser, content schema, publishing readiness) first.
 * Public pages refresh within the hour (cache safety net) or on the next deploy / admin change.
 */

import mongoose from "mongoose";

const apply = process.argv.includes("--apply");
const adminFlag = process.argv.find((a) => a.startsWith("--admin="))?.slice("--admin=".length).trim().toLowerCase();
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Run via: npm run blog:migrate");
  process.exit(1);
}

const { buildBlogMigrationRecords, planBlogMigration, summarize, BLOG_MIGRATION_PREFIX } = await import("../lib/blog/migration.ts");
const { blogContentSchema } = await import("../lib/blog/validation.ts");
const { blogPublishIssues, wordCountOf } = await import("../lib/blog/rules.ts");
const { BlogPostModel } = await import("../lib/db/models/BlogPost.ts");
const { AdminModel } = await import("../lib/db/models/Admin.ts");

const records = buildBlogMigrationRecords();
const invalid = [];
for (const r of records) {
  if (r.sanitizeErrors.length) invalid.push(`${r.content.slug}: body ${r.sanitizeErrors.join("; ")}`);
  const parsed = blogContentSchema.safeParse(r.content);
  if (!parsed.success) invalid.push(`${r.content.slug}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
  if (r.status === "PUBLISHED" && Object.keys(blogPublishIssues(r.content)).length) invalid.push(`${r.content.slug}: not publishable (${Object.keys(blogPublishIssues(r.content)).join(", ")})`);
}
if (invalid.length) {
  console.error(`Aborted: ${invalid.length} record(s) failed validation:\n  ${invalid.join("\n  ")}`);
  process.exit(1);
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000, autoIndex: false, maxPoolSize: 2 });
let exitCode = 0;
try {
  console.log(`Database "${mongoose.connection.db.databaseName}". Mode: ${apply ? "APPLY" : "DRY RUN (no changes)"}\n`);
  const prefix = { $regex: `^${BLOG_MIGRATION_PREFIX}:` };
  const existing = await BlogPostModel.find({ "migration.key": prefix }).select("migration updatedAt deletedAt status firstPublishedAt").lean();
  const existingByKey = new Map(
    existing.map((d) => [d.migration.key, { id: d._id.toString(), hash: d.migration.hash, appliedAt: d.migration.appliedAt, updatedAt: d.updatedAt, deleted: d.deletedAt !== null, status: d.status, firstPublishedAt: d.firstPublishedAt }]),
  );
  const others = await BlogPostModel.find({ activeSlug: { $in: records.map((r) => r.content.slug) }, "migration.key": { $not: prefix } }).select("activeSlug").lean();
  const steps = planBlogMigration(records, existingByKey, new Set(others.map((d) => d.activeSlug)));

  const labels = { insert: "+ insert", update: "~ update", "skip-unchanged": "= unchanged", "skip-edited": "· skip (edited in admin)", "skip-deleted": "· skip (deleted in admin)", conflict: "! CONFLICT" };
  for (const step of steps) console.log(`  ${labels[step.kind].padEnd(26)} ${step.record.content.slug.padEnd(52)} ${step.record.status}${step.kind === "conflict" ? `  (${step.reason})` : ""}`);
  const totals = summarize(steps);
  console.log(`\nPlan: ${totals.insert} insert · ${totals.update} update · ${totals.skipUnchanged} unchanged · ${totals.skipEdited} edited (kept) · ${totals.skipDeleted} deleted (kept) · ${totals.conflict} conflict`);
  if (totals.conflict) exitCode = 2;

  if (apply && (totals.insert || totals.update)) {
    const admins = await AdminModel.find(adminFlag ? { email: adminFlag } : {}).select("_id").limit(2).lean();
    if (admins.length !== 1) {
      console.error(adminFlag ? "No admin with that email." : `Found ${admins.length === 0 ? "no admin" : "more than one admin"}; pass --admin=<email>.`);
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
      const base = { ...content, activeSlug: content.slug, status, wordCount: wordCountOf(content.content), updatedBy: adminId, migration: { key, hash, appliedAt: at }, updatedAt: at };
      if (step.kind === "insert") {
        try {
          await BlogPostModel.create([{ ...base, previousSlugs: [], publishedAt: published ? at : null, firstPublishedAt: published ? at : null, createdBy: adminId, createdAt: at }], { timestamps: false });
          inserted++;
        } catch (error) {
          lost++;
          console.error(`  insert failed for ${content.slug} (${error?.code === 11000 ? "slug or key already exists" : error?.name ?? "error"}); nothing overwritten.`);
        }
      } else if (step.kind === "update") {
        const prev = existingByKey.get(key);
        const $set = { ...base };
        if (!published) $set.publishedAt = null;
        else if (prev.status !== "PUBLISHED") $set.publishedAt = at;
        if (published && !prev.firstPublishedAt) $set.firstPublishedAt = at;
        const result = await BlogPostModel.updateOne({ _id: prev.id, "migration.hash": prev.hash, updatedAt: prev.updatedAt, deletedAt: null }, { $set }, { timestamps: false, runValidators: true });
        if (result.modifiedCount === 1) updated++;
        else {
          lost++;
          console.error(`  update skipped for ${content.slug}: it changed while the migration ran.`);
        }
      }
    }
    console.log(`\nApplied: ${inserted} inserted · ${updated} updated${lost ? ` · ${lost} not applied (see above)` : ""}.`);
    if (lost) exitCode = 2;
  } else console.log(apply ? "\nNothing to apply." : "\nDry run: nothing was written. Re-run with --apply to perform this plan.");
} finally {
  await mongoose.disconnect();
}
process.exit(exitCode);
