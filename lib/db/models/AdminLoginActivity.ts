import "server-only";

/**
 * AdminLoginActivity — one document per sign-in attempt on the admin account
 * (collection: admin_login_activity). SERVER-ONLY.
 *
 * - SUCCESS: a completed sign-in. Its _id is also stored in the session cookie, so the
 *   Settings page can tell "this session" apart from earlier sign-ins.
 * - FAILED: the correct admin email with a wrong password (attempts with unknown emails
 *   have no admin to attach to and are only counted by the per-IP rate limit).
 *
 * Never stores passwords, hashes or session data. ipAddress / location are only stored when
 * they come from trusted proxy headers (see lib/auth/request.ts) and are never returned by
 * the API. Records expire automatically after 180 days (TTL index).
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";

export type LoginStatus = "SUCCESS" | "FAILED";

export interface AdminLoginActivityDoc {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  status: LoginStatus;
  loggedInAt: Date;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  ipAddress?: string;
  location?: string;
}

export const LOGIN_ACTIVITY_RETENTION_DAYS = 180;

const activitySchema = new Schema<AdminLoginActivityDoc>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    status: { type: String, enum: ["SUCCESS", "FAILED"], required: true },
    loggedInAt: { type: Date, required: true, default: Date.now },
    userAgent: { type: String, default: "", maxlength: 512 },
    device: { type: String, required: true, maxlength: 40 },
    browser: { type: String, required: true, maxlength: 40 },
    os: { type: String, required: true, maxlength: 40 },
    ipAddress: { type: String, maxlength: 64 },
    location: { type: String, maxlength: 120 },
  },
  { collection: "admin_login_activity", versionKey: false, strict: "throw" },
);

activitySchema.index({ adminId: 1, loggedInAt: -1 }, { name: "admin_recent" });
activitySchema.index({ adminId: 1, status: 1, loggedInAt: -1 }, { name: "admin_status_recent" });
activitySchema.index({ loggedInAt: 1 }, { name: "retention_ttl", expireAfterSeconds: LOGIN_ACTIVITY_RETENTION_DAYS * 24 * 60 * 60 });

export const AdminLoginActivityModel: Model<AdminLoginActivityDoc> =
  (mongoose.models.AdminLoginActivity as Model<AdminLoginActivityDoc> | undefined) ??
  mongoose.model<AdminLoginActivityDoc>("AdminLoginActivity", activitySchema);
