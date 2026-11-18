import "server-only";

/**
 * Admin — the admin account (collection: admins). SERVER-ONLY.
 *
 * Single-admin site: the `key` field is fixed to "primary" and uniquely indexed, so a
 * second admin document can never be created (concurrent bootstraps collide on the index).
 *
 * - email is stored trimmed + lowercased and is unique.
 * - passwordHash is an Argon2id hash and is excluded from queries by default
 *   (`select: false`); only the credential checks ask for it explicitly.
 * - sessionVersion is copied into the sealed session cookie; incrementing it revokes every
 *   session issued before (used after a password change).
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface AdminDoc {
  _id: Types.ObjectId;
  key: "primary";
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  passwordChangedAt?: Date;
  sessionVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<AdminDoc>(
  {
    key: { type: String, enum: ["primary"], default: "primary", required: true, immutable: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: { type: String, maxlength: 2048 },
    passwordChangedAt: { type: Date },
    sessionVersion: { type: Number, required: true, default: 1, min: 1 },
  },
  { collection: "admins", timestamps: true, versionKey: false, strict: "throw" },
);

adminSchema.index({ email: 1 }, { unique: true, name: "email_unique" });
adminSchema.index({ key: 1 }, { unique: true, name: "single_admin" });

/** Reuse the compiled model across hot reloads. */
export const AdminModel: Model<AdminDoc> = (mongoose.models.Admin as Model<AdminDoc> | undefined) ?? mongoose.model<AdminDoc>("Admin", adminSchema);
