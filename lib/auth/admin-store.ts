import "server-only";

/**
 * Admin repository (MongoDB). SERVER-ONLY: never import from a client component.
 *
 * - Reuses the cached Mongoose connection (lib/db/mongoose.ts).
 * - Normal reads use a projection without passwordHash; only credential helpers select it.
 * - NEVER creates the admin. The first admin is created only by the explicit, manual
 *   bootstrap script (`npm run admin:account -- bootstrap`, see docs/backend/auth.md).
 *   If the collection is empty, sign-in simply fails; the old auto-bootstrap from .env on
 *   login was removed so an emptied collection can't silently restore an old password.
 * - Errors: driver failures → DatabaseUnavailableError; business outcomes → typed AppErrors.
 */

import { isValidObjectId } from "mongoose";
import { withDb } from "@/lib/db/mongoose";
import { AdminModel, type AdminDoc } from "@/lib/db/models/Admin";
import type { ProfileData } from "@/lib/admin/settings-schemas";
import { ConflictError, NotFoundError, isDuplicateKeyError } from "@/lib/server/errors";

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

export type AdminCredentials = Pick<AdminDoc, "_id" | "email" | "passwordHash" | "sessionVersion">;

/** The admin with its password hash, or null when no admin exists (no bootstrap here). */
export async function findAdminCredentials(): Promise<AdminCredentials | null> {
  return withDb(() => AdminModel.findOne({ key: "primary" }).select("+passwordHash email sessionVersion").lean());
}

export async function findAdminProfile(adminId: string): Promise<AdminProfile | null> {
  if (!isValidObjectId(adminId)) return null;
  const doc = await withDb(() => AdminModel.findById(adminId).select(PROFILE_PROJECTION).lean());
  return doc ? toProfile(doc) : null;
}

/** Password hash for one admin (only for verification inside credential flows). */
export async function findPasswordHash(adminId: string): Promise<string | null> {
  if (!isValidObjectId(adminId)) return null;
  const doc = await withDb(() => AdminModel.findById(adminId).select("+passwordHash").lean());
  return doc?.passwordHash ?? null;
}

/**
 * Updates name/email with optimistic concurrency: the write only applies when the stored
 * `updatedAt` still equals the one the client loaded.
 * Throws ConflictError (duplicate email / changed elsewhere) or NotFoundError.
 */
export async function updateAdminProfile(adminId: string, expectedUpdatedAt: Date, values: { name: string; email: string }): Promise<AdminProfile> {
  if (!isValidObjectId(adminId)) throw new NotFoundError("Your admin account could not be found.", "ADMIN_NOT_FOUND");
  const emailInUse = () => new ConflictError("That email is already used by another admin account.", "EMAIL_IN_USE", { email: "This email is already in use." });

  return withDb(async () => {
    if (await AdminModel.exists({ email: values.email, _id: { $ne: adminId } })) throw emailInUse();
    let doc;
    try {
      doc = await AdminModel.findOneAndUpdate(
        { _id: adminId, updatedAt: expectedUpdatedAt },
        { $set: { name: values.name, email: values.email } },
        { returnDocument: "after", runValidators: true, projection: PROFILE_PROJECTION },
      ).lean();
    } catch (error) {
      if (isDuplicateKeyError(error)) throw emailInUse();
      throw error;
    }
    if (doc) return toProfile(doc);
    if (await AdminModel.exists({ _id: adminId })) {
      throw new ConflictError("Your profile was changed somewhere else. Reload to see the latest version, then try again.");
    }
    throw new NotFoundError("Your admin account could not be found.", "ADMIN_NOT_FOUND");
  });
}

/**
 * Replaces the password hash only if it still equals `currentHash` (guards against two
 * concurrent changes) and bumps sessionVersion. Returns null when the hash changed meanwhile.
 * Callers also revoke the admin's sessions (lib/auth/sessions.ts).
 */
export async function replacePasswordHash(adminId: string, currentHash: string, nextHash: string): Promise<AdminProfile | null> {
  const doc = await withDb(() =>
    AdminModel.findOneAndUpdate(
      { _id: adminId, passwordHash: currentHash },
      { $set: { passwordHash: nextHash, passwordChangedAt: new Date() }, $inc: { sessionVersion: 1 } },
      { returnDocument: "after", projection: PROFILE_PROJECTION },
    ).lean(),
  );
  return doc ? toProfile(doc) : null;
}
