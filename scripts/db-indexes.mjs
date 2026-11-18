#!/usr/bin/env node
/**
 * Explicit, idempotent MongoDB index management.
 *
 *   npm run db:indexes            # CHECK (default): compare model indexes with the database
 *   npm run db:indexes -- --apply # create MISSING indexes only
 *
 * - Index definitions come from the Mongoose models (lib/db/models/index.ts → ALL_MODELS);
 *   there is no second copy to keep in sync.
 * - Never drops or rebuilds anything. Indexes that exist in the database but not in a model
 *   ("extra") and indexes whose options differ ("conflict") are reported for a human to
 *   handle deliberately; --apply leaves them untouched.
 * - Safe to run repeatedly: creating an index that already exists with the same options is
 *   a no-op in MongoDB.
 * - Needs MONGODB_URI (read from .env by the npm script). Prints no credentials.
 *
 * Run it once after deploying a change that adds or alters model indexes. In production the
 * app does not build indexes at request time (autoIndex is off; see lib/db/mongoose.ts).
 */

import mongoose from "mongoose";

const apply = process.argv.includes("--apply");
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Run via: npm run db:indexes");
  process.exit(1);
}

const { ALL_MODELS } = await import("../lib/db/models/index.ts");

const keyOf = (spec) => JSON.stringify(spec);
const OPTION_KEYS = ["unique", "expireAfterSeconds", "sparse", "partialFilterExpression"];
const optionsOf = (o) => Object.fromEntries(OPTION_KEYS.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000, autoIndex: false, maxPoolSize: 2 });
console.log(`Connected to database "${mongoose.connection.db.databaseName}". Mode: ${apply ? "APPLY (create missing only)" : "CHECK (no changes)"}\n`);

let problems = 0;
let created = 0;
try {
  for (const Model of ALL_MODELS) {
    const name = Model.collection.collectionName;
    const wanted = Model.schema.indexes(); // [[keys, options], ...]
    let existing = [];
    try {
      existing = await Model.collection.indexes();
    } catch (error) {
      if (error?.codeName !== "NamespaceNotFound") throw error; // collection doesn't exist yet
    }
    const byKey = new Map(existing.map((ix) => [keyOf(ix.key), ix]));
    console.log(`■ ${name}`);

    for (const [keys, options] of wanted) {
      const found = byKey.get(keyOf(keys));
      const label = `${options.name ?? keyOf(keys)} ${keyOf(keys)} ${keyOf(optionsOf(options))}`;
      if (!found) {
        if (apply) {
          await Model.collection.createIndex(keys, options);
          created++;
          console.log(`  + created   ${label}`);
        } else {
          console.log(`  + missing   ${label}`);
        }
        continue;
      }
      const want = optionsOf(options);
      const have = optionsOf(found);
      if (keyOf(want) !== keyOf(have)) {
        problems++;
        console.log(`  ! CONFLICT  ${label}  (database has ${keyOf(have)}; not changed, resolve manually)`);
      } else {
        console.log(`  = ok        ${label}`);
      }
      byKey.delete(keyOf(keys));
    }
    for (const ix of byKey.values()) {
      if (ix.name === "_id_") continue;
      console.log(`  ? extra     ${ix.name} ${keyOf(ix.key)} (not in the model; left in place)`);
    }
  }
} finally {
  await mongoose.disconnect();
}

console.log(`\n${apply ? `Created ${created} index(es).` : "Check complete (nothing changed)."}${problems ? ` ${problems} conflict(s) need manual review.` : ""}`);
process.exit(problems ? 2 : 0);
