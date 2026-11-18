import "server-only";

/**
 * AdminSession — server-side record of each signed-in admin session (collection:
 * admin_sessions). SERVER-ONLY.
 *
 * The iron-session cookie carries a random 256-bit session token; MongoDB stores only its
 * SHA-256 hash (tokenHash), so a database leak doesn't yield usable cookies. A session is
 * valid only while its record exists, is not revoked and has not expired, so:
 *  - logout revokes this session (a copied cookie stops working immediately);
 *  - a password change revokes every session of the admin.
 * expiresAt = sign-in + 8 hours (the existing absolute lifetime). A TTL index deletes
 * records after they expire; queries also check expiresAt, because TTL cleanup is lazy.
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";

export type SessionRevokeReason = "logout" | "password_change" | "admin_reset";

export interface AdminSessionDoc {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  tokenHash: string;
  /** admin_login_activity record of this sign-in. */
  loginId?: Types.ObjectId;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  revokedReason?: SessionRevokeReason;
}

const sessionSchema = new Schema<AdminSessionDoc>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    tokenHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
    loginId: { type: Schema.Types.ObjectId },
    createdAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    revokedReason: { type: String, enum: ["logout", "password_change", "admin_reset"] },
  },
  { collection: "admin_sessions", versionKey: false, strict: "throw" },
);

sessionSchema.index({ tokenHash: 1 }, { unique: true, name: "token_unique" });
sessionSchema.index({ adminId: 1, revokedAt: 1 }, { name: "admin_active" });
sessionSchema.index({ expiresAt: 1 }, { name: "expiry_ttl", expireAfterSeconds: 0 });

export const AdminSessionModel: Model<AdminSessionDoc> =
  (mongoose.models.AdminSession as Model<AdminSessionDoc> | undefined) ?? mongoose.model<AdminSessionDoc>("AdminSession", sessionSchema);
