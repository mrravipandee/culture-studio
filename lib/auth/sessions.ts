import "server-only";

/**
 * Server-side admin sessions (collection: admin_sessions). SERVER-ONLY.
 *
 * Works together with the iron-session cookie (lib/auth/session.ts), not instead of it:
 *  - the cookie stays sealed/encrypted and carries a random 256-bit token (`sid`);
 *  - MongoDB stores only SHA-256(token), so stored records can't be turned into cookies;
 *  - a request is authenticated only if the cookie unseals AND an un-revoked, unexpired
 *    record with that hash exists for the same admin (lib/auth/require-admin.ts).
 */

import { createHash, randomBytes } from "node:crypto";
import { Types, isValidObjectId } from "mongoose";
import { withDb } from "@/lib/db/mongoose";
import { AdminSessionModel, type SessionRevokeReason } from "@/lib/db/models/AdminSession";

export const hashSessionToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** 32 random bytes, base64url (43 chars). */
export const newSessionToken = () => randomBytes(32).toString("base64url");
export const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export async function createSession(input: { adminId: string; token: string; loginId?: Types.ObjectId | string; issuedAt: number; ttlSeconds: number }) {
  await withDb(() =>
    AdminSessionModel.create({
      adminId: new Types.ObjectId(input.adminId),
      tokenHash: hashSessionToken(input.token),
      ...(input.loginId ? { loginId: new Types.ObjectId(input.loginId) } : {}),
      createdAt: new Date(input.issuedAt),
      expiresAt: new Date(input.issuedAt + input.ttlSeconds * 1000),
    }),
  );
}

/** True when the token belongs to this admin, is not revoked and has not expired. */
export async function isSessionActive(adminId: string, token: string): Promise<boolean> {
  if (!isValidObjectId(adminId) || !SESSION_TOKEN_PATTERN.test(token)) return false;
  const found = await withDb(() =>
    AdminSessionModel.exists({
      tokenHash: hashSessionToken(token),
      adminId: new Types.ObjectId(adminId),
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }),
  );
  return found !== null;
}

/** Revokes one session (logout). Idempotent. */
export async function revokeSession(token: string, reason: SessionRevokeReason) {
  if (!SESSION_TOKEN_PATTERN.test(token)) return;
  await withDb(() => AdminSessionModel.updateOne({ tokenHash: hashSessionToken(token), revokedAt: { $exists: false } }, { $set: { revokedAt: new Date(), revokedReason: reason } }));
}

/** Revokes every active session of an admin (password change). Returns how many. */
export async function revokeAllSessions(adminId: string, reason: SessionRevokeReason): Promise<number> {
  if (!isValidObjectId(adminId)) return 0;
  const result = await withDb(() =>
    AdminSessionModel.updateMany({ adminId: new Types.ObjectId(adminId), revokedAt: { $exists: false } }, { $set: { revokedAt: new Date(), revokedReason: reason } }),
  );
  return result.modifiedCount;
}
