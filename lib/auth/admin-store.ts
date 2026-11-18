/**
 * Admin data layer (MongoDB). SERVER-ONLY: never import from a client component.
 *
 * Every function reuses the cached Mongoose connection (lib/db/mongoose.ts). Normal reads
 * use a projection without passwordHash; only the credential helpers select it.
 */

import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { AdminModel, type AdminDoc } from "@/lib/db/models/Admin";
import { AdminLoginActivityModel } from "@/lib/db/models/AdminLoginActivity";
import type { ProfileData } from "@/lib/admin/settings-schemas";
import { getBootstrapCredentials } from "./config";

/** Thrown when MongoDB can't be reached or a query fails; callers map it to 503. */
export class DatabaseUnavailableError extends Error {
  constructor() {
    super("Database unavailable.");
    this.name = "DatabaseUnavailableError";
  }
}

/** Fields safe to hand to the app (never passwordHash). */
export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  passwordChangedAt: string | null;
  sessionVersion: number;
  createdAt: string;
  updatedAt: string;
}

export const PROFILE_PROJECTION = "name email avatarUrl passwordChangedAt sessionVersion createdAt updatedAt" as const;

type ProfileSource = Pick<AdminDoc, "_id" | "name" | "email" | "avatarUrl" | "passwordChangedAt" | "sessionVersion" | "createdAt" | "updatedAt">;

export const toProfile = (doc: ProfileSource): AdminProfile => ({
  id: doc._id.toString(),
  name: doc.name,
  email: doc.email,
  avatarUrl: doc.avatarUrl ?? null,
  passwordChangedAt: doc.passwordChangedAt ? doc.passwordChangedAt.toISOString() : null,
  sessionVersion: doc.sessionVersion,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

/** Public shape for API responses: drops sessionVersion (the hash is never in AdminProfile). */
export const toProfileData = ({ id, name, email, avatarUrl, passwordChangedAt, createdAt, updatedAt }: AdminProfile): ProfileData => ({
  id,
  name,
  email,
  avatarUrl,
  passwordChangedAt,
  createdAt,
  updatedAt,
});

/** Connects (cached) and makes sure indexes exist once per process. */
let indexesReady: Promise<unknown> | null = null;
export async function db() {
  try {
    await connectToDatabase();
    indexesReady ??= Promise.all([AdminModel.init(), AdminLoginActivityModel.init()]).catch((error: unknown) => {
      indexesReady = null;
      throw error;
    });
    await indexesReady;
  } catch {
    throw new DatabaseUnavailableError();
  }
}

/** Wraps a query so driver errors never leak past this layer. */
async function query<T>(run: () => Promise<T>): Promise<T> {
  await db();
  try {
    return await run();
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) throw error;
    throw new DatabaseUnavailableError();
  }
}

const DEFAULT_NAME = "Admin";

/**
 * Returns the admin with its password hash, creating it from ADMIN_EMAIL /
 * ADMIN_PASSWORD_HASH on first use. The env hash is stored as-is (already Argon2id); no
 * plaintext is involved. `$setOnInsert` + the unique `key` index make concurrent first
 * requests safe: only one document can ever be inserted, and an existing record is never
 * overwritten by the environment.
 *
 * Throws AuthConfigError only when no admin exists yet and the bootstrap env is invalid.
 */
export async function getAdminCredentials(): Promise<Pick<AdminDoc, "_id" | "email" | "passwordHash" | "sessionVersion">> {
  const existing = await query(() => AdminModel.findOne({ key: "primary" }).select("+passwordHash email sessionVersion").lean());
  if (existing) return existing;

  const boot = getBootstrapCredentials();
  await query(async () => {
    try {
      await AdminModel.updateOne(
        { key: "primary" },
        { $setOnInsert: { key: "primary", name: DEFAULT_NAME, email: boot.email, passwordHash: boot.passwordHash, sessionVersion: 1 } },
        { upsert: true, runValidators: true },
      );
    } catch (error) {
      // E11000: another request created it first. Anything else is a real failure.
      if (!(typeof error === "object" && error !== null && "code" in error && error.code === 11000)) throw error;
    }
  });
  const created = await query(() => AdminModel.findOne({ key: "primary" }).select("+passwordHash email sessionVersion").lean());
  if (!created) throw new DatabaseUnavailableError();
  console.info("[admin-auth] Created the admin record in MongoDB from the bootstrap environment variables.");
  return created;
}

export async function findAdminProfile(adminId: string): Promise<AdminProfile | null> {
  if (!isValidObjectId(adminId)) return null;
  const doc = await query(() => AdminModel.findById(adminId).select(PROFILE_PROJECTION).lean());
  return doc ? toProfile(doc) : null;
}

/** Password hash for one admin (only for verification inside credential flows). */
export async function findPasswordHash(adminId: string): Promise<string | null> {
  if (!isValidObjectId(adminId)) return null;
  const doc = await query(() => AdminModel.findById(adminId).select("+passwordHash").lean());
  return doc?.passwordHash ?? null;
}

export type UpdateProfileResult = { kind: "ok"; profile: AdminProfile } | { kind: "conflict" } | { kind: "duplicate" } | { kind: "missing" };

/**
 * Updates name/email with optimistic concurrency: the write only applies when the stored
 * `updatedAt` still equals the one the client loaded.
 */
export async function updateAdminProfile(adminId: string, expectedUpdatedAt: Date, values: { name: string; email: string }): Promise<UpdateProfileResult> {
  if (!isValidObjectId(adminId)) return { kind: "missing" };
  await db();
  try {
    const duplicate = await AdminModel.exists({ email: values.email, _id: { $ne: adminId } });
    if (duplicate) return { kind: "duplicate" };
    const doc = await AdminModel.findOneAndUpdate(
      { _id: adminId, updatedAt: expectedUpdatedAt },
      { $set: { name: values.name, email: values.email } },
      { returnDocument: "after", runValidators: true, projection: PROFILE_PROJECTION },
    ).lean();
    if (doc) return { kind: "ok", profile: toProfile(doc) };
    const stillThere = await AdminModel.exists({ _id: adminId });
    return stillThere ? { kind: "conflict" } : { kind: "missing" };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) return { kind: "duplicate" };
    throw new DatabaseUnavailableError();
  }
}

/**
 * Replaces the password hash only if it still equals `currentHash` (guards against two
 * concurrent changes) and bumps sessionVersion, which revokes every existing session.
 */
export async function replacePasswordHash(adminId: string, currentHash: string, nextHash: string): Promise<AdminProfile | null> {
  const doc = await query(() =>
    AdminModel.findOneAndUpdate(
      { _id: adminId, passwordHash: currentHash },
      { $set: { passwordHash: nextHash, passwordChangedAt: new Date() }, $inc: { sessionVersion: 1 } },
      { returnDocument: "after", projection: PROFILE_PROJECTION },
    ).lean(),
  );
  return doc ? toProfile(doc) : null;
}
