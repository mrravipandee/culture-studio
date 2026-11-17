/**
 * AdminLogin — one document per successful admin sign-in (collection: adminlogins).
 * Stores when the admin signed in, plus the IP and browser for a basic audit trail.
 * Never stores passwords, hashes or session data.
 */

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const adminLoginSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    loggedInAt: { type: Date, required: true, default: Date.now, index: true },
    ip: { type: String, default: "unknown" },
    userAgent: { type: String, default: "", maxlength: 512 },
  },
  { versionKey: false },
);

export type AdminLogin = InferSchemaType<typeof adminLoginSchema>;

/** Reuse the compiled model across hot reloads. */
export const AdminLoginModel: Model<AdminLogin> =
  (mongoose.models.AdminLogin as Model<AdminLogin> | undefined) ?? mongoose.model<AdminLogin>("AdminLogin", adminLoginSchema);
