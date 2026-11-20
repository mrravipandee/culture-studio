#!/usr/bin/env node
/**
 * DEVELOPMENT DATABASE ONLY — integration test of newsletter sign-ups against real MongoDB
 * (unique index, atomic upsert, concurrent duplicates, reactivation, admin add conflict).
 *
 *   npm run test:subscribers:db
 *
 * Refuses unless the database name contains dev / test / staging / local. Uses addresses on
 * the reserved example.invalid domain and deletes exactly those records at the end.
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
const { SubscriberModel } = await import("../lib/db/models/Subscriber.ts");
const repo = await import("../lib/subscribers/repository.ts");
const { subscribeSchema } = await import("../lib/validation/subscriber.ts");

await connectToDatabase();
const run = Date.now().toString(36);
const email = `qa-${run}@example.invalid`;
let passed = 0;
const check = async (name, fn) => {
  await fn();
  passed++;
  console.log(`  ✓ ${name}`);
};

try {
  await check("10 simultaneous sign-ups (mixed case / spaces) store exactly one record", async () => {
    const variants = Array.from({ length: 10 }, (_, i) => (i % 2 ? `  ${email.toUpperCase()} ` : email));
    const normalised = variants.map((v) => subscribeSchema.parse({ email: v, source: "BLOG" }).email);
    const outcomes = await Promise.all(normalised.map((e) => repo.subscribe(e, "BLOG")));
    assert.equal(outcomes.filter((o) => o === "created").length, 1);
    assert.equal(await SubscriberModel.countDocuments({ email }), 1);
    const doc = await SubscriberModel.findOne({ email }).lean();
    assert.equal(doc.submissionCount, 10);
    assert.equal(doc.status, "ACTIVE");
  });

  await check("unique index exists on email", async () => {
    const indexes = await SubscriberModel.collection.indexes();
    assert.ok(indexes.some((ix) => ix.unique && JSON.stringify(ix.key) === JSON.stringify({ email: 1 })));
  });

  await check("unsubscribe, then sign up again → reactivated (same record)", async () => {
    const doc = await SubscriberModel.findOne({ email }).lean();
    const { changed } = await repo.setSubscriberStatus(doc._id.toString(), "UNSUBSCRIBED");
    assert.equal(changed, true);
    assert.equal(await repo.subscribe(email, "WEBSITE"), "reactivated");
    const after = await SubscriberModel.findOne({ email }).lean();
    assert.equal(after.status, "ACTIVE");
    assert.ok(after.reactivatedAt && after.unsubscribedAt);
    assert.equal(after.source, "BLOG", "first source kept");
    assert.equal(await SubscriberModel.countDocuments({ email }), 1);
  });

  await check("admin add of an existing email is rejected (409)", async () => {
    await assert.rejects(repo.addSubscriber({ email, source: "MANUAL", status: "ACTIVE" }), (e) => e?.code === "EMAIL_IN_USE");
  });

  await check("delete removes the record", async () => {
    const doc = await SubscriberModel.findOne({ email }).lean();
    await repo.deleteSubscriber(doc._id.toString());
    assert.equal(await SubscriberModel.countDocuments({ email }), 0);
  });

  console.log(`\n${passed} checks passed.`);
} catch (error) {
  console.error(`\nFAILED after ${passed} checks:`, error?.message ?? error);
  process.exitCode = 1;
} finally {
  await SubscriberModel.deleteMany({ email: { $regex: `^qa-${run}@example\\.invalid$` } });
  await mongoose.disconnect();
}
