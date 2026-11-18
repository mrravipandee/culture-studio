#!/usr/bin/env node
/**
 * Admin account maintenance (explicit, manual, run by someone with database access).
 *
 *   npm run admin:account -- status
 *   npm run admin:account -- bootstrap --confirm
 *   npm run admin:account -- reset-password --confirm
 *   npm run admin:account -- revoke-sessions --confirm
 *   npm run admin:account -- clear-rate-limits --confirm
 *
 * status             Shows whether the admin exists (email partly masked), when the password
 *                    last changed and how many sessions are active. Read-only.
 * bootstrap          Creates the FIRST admin from ADMIN_EMAIL + ADMIN_PASSWORD_HASH (an
 *                    Argon2id hash from `npm run admin:hash`). Refuses if an admin exists, so
 *                    an existing password is never overwritten. If an admin was bootstrapped
 *                    before and has since been deleted, it also requires --recreate.
 * reset-password     Recovery when the password is lost: prompts (hidden) for a new password,
 *                    hashes it with Argon2id, stores it, bumps sessionVersion and revokes
 *                    every session. Nothing is printed or written to .env.
 * revoke-sessions    Signs the admin out everywhere (e.g. a lost laptop).
 * clear-rate-limits  Removes all sign-in / password-check rate-limit buckets.
 *
 * The running app never creates or resets the admin; this script is the only way.
 * Needs MONGODB_URI (from .env via the npm script). Never prints secrets or hashes.
 */

import mongoose from "mongoose";
import { hash } from "@node-rs/argon2";
import { hiddenPrompt } from "./lib/hidden-prompt.mjs";

const [command = "status", ...flags] = process.argv.slice(2);
const confirmed = flags.includes("--confirm");
const uri = process.env.MONGODB_URI;
const ARGON2ID_PATTERN = /^\$argon2id\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MARKER_ID = "admin-bootstrap";

const fail = (message, code = 1) => {
  console.error(message);
  process.exit(code);
};
const mask = (email) => email.replace(/^(.{1,2}).*(@.*)$/, "$1***$2");
const needConfirm = () => {
  if (!confirmed) fail(`"${command}" changes the database. Re-run with --confirm.`);
};

if (!uri) fail("MONGODB_URI is not set. Run via: npm run admin:account -- <command>");
if (!["status", "bootstrap", "reset-password", "revoke-sessions", "clear-rate-limits"].includes(command)) fail(`Unknown command "${command}".`);

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000, autoIndex: false, maxPoolSize: 2 });
const db = mongoose.connection.db;
const admins = db.collection("admins");
const sessions = db.collection("admin_sessions");
const state = db.collection("system_state");
console.log(`Database: "${db.databaseName}"\n`);

try {
  const admin = await admins.findOne({ key: "primary" }, { projection: { passwordHash: 0 } });

  if (command === "status") {
    if (!admin) {
      const marker = await state.findOne({ _id: MARKER_ID });
      console.log(marker ? "No admin exists, but one was bootstrapped before (deleted?). bootstrap needs --recreate." : "No admin exists. Run: npm run admin:account -- bootstrap --confirm");
    } else {
      const active = await sessions.countDocuments({ adminId: admin._id, revokedAt: { $exists: false }, expiresAt: { $gt: new Date() } });
      console.log(`Admin: ${admin.name} <${mask(admin.email)}>`);
      console.log(`Created: ${admin.createdAt?.toISOString?.() ?? "unknown"}`);
      console.log(`Password last changed: ${admin.passwordChangedAt?.toISOString?.() ?? "never (still the bootstrap password)"}`);
      console.log(`Active sessions: ${active}`);
      // Record that an admin exists (older installs were bootstrapped by the app itself).
      await state.updateOne({ _id: MARKER_ID }, { $setOnInsert: { at: admin.createdAt ?? new Date(), by: "existing-admin" } }, { upsert: true });
    }
  }

  if (command === "bootstrap") {
    needConfirm();
    if (admin) fail("An admin already exists. Bootstrap never overwrites it. To recover a lost password use: reset-password --confirm", 2);
    const marker = await state.findOne({ _id: MARKER_ID });
    if (marker && !flags.includes("--recreate")) {
      fail("An admin was bootstrapped before and no longer exists (deleted?). If you really want to create a new one, add --recreate.", 2);
    }
    const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    const passwordHash = (process.env.ADMIN_PASSWORD_HASH ?? "").trim();
    if (!EMAIL.test(email)) fail("ADMIN_EMAIL is missing or invalid.");
    if (!ARGON2ID_PATTERN.test(passwordHash)) fail("ADMIN_PASSWORD_HASH is missing or not a complete Argon2id hash (npm run admin:hash).");
    const now = new Date();
    try {
      await admins.insertOne({ key: "primary", name: "Admin", email, passwordHash, sessionVersion: 1, createdAt: now, updatedAt: now });
    } catch (error) {
      if (error?.code === 11000) fail("An admin was created concurrently; nothing changed.", 2);
      throw error;
    }
    await state.updateOne({ _id: MARKER_ID }, { $set: { at: now, by: "bootstrap-script" } }, { upsert: true });
    console.log(`Created the admin <${mask(email)}>. Sign in, then change the password in Settings.`);
    console.log("You can now remove ADMIN_PASSWORD_HASH from the environment; the app no longer reads it.");
  }

  if (command === "reset-password") {
    needConfirm();
    if (!admin) fail("No admin exists. Use bootstrap instead.", 2);
    const first = await hiddenPrompt("New admin password (hidden): ");
    const again = await hiddenPrompt("Repeat the new password (hidden): ");
    if (first !== again) fail("The passwords don't match. Nothing changed.");
    if (first.length < 8 || first.length > 128 || !/[A-Z]/.test(first) || !/[a-z]/.test(first) || !/[0-9]/.test(first)) {
      fail("Use 8–128 characters with an uppercase letter, a lowercase letter and a number. Nothing changed.");
    }
    const passwordHash = await hash(first, { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 });
    const now = new Date();
    await admins.updateOne({ _id: admin._id }, { $set: { passwordHash, passwordChangedAt: now, updatedAt: now }, $inc: { sessionVersion: 1 } });
    const revoked = await sessions.updateMany({ adminId: admin._id, revokedAt: { $exists: false } }, { $set: { revokedAt: now, revokedReason: "admin_reset" } });
    console.log(`Password reset for <${mask(admin.email)}>. ${revoked.modifiedCount} session(s) revoked.`);
  }

  if (command === "revoke-sessions") {
    needConfirm();
    if (!admin) fail("No admin exists.", 2);
    const now = new Date();
    const revoked = await sessions.updateMany({ adminId: admin._id, revokedAt: { $exists: false } }, { $set: { revokedAt: now, revokedReason: "admin_reset" } });
    console.log(`${revoked.modifiedCount} session(s) revoked.`);
  }

  if (command === "clear-rate-limits") {
    needConfirm();
    const result = await db.collection("rate_limits").deleteMany({ _id: { $regex: "^(login:|password-check:)" } });
    console.log(`${result.deletedCount} rate-limit bucket(s) cleared.`);
  }
} finally {
  await mongoose.disconnect();
}
