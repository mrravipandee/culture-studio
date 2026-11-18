import "server-only";

/**
 * Enquiry — one submission of the public enquiry form (collection: enquiries). SERVER-ONLY.
 *
 * Fields mirror the real form (components/home/sections/InquiryForm.tsx): name, email,
 * company, website, services (form checkbox values: discipline ids or "not-sure"), message,
 * plus where it was submitted (source). There is no phone field because the form has none.
 *
 * - status starts at NEW; every change is appended to statusHistory.
 * - deletedAt marks a soft delete: deleted records are excluded from every admin list,
 *   count and dashboard figure, but remain in the database for recovery.
 * - dedupeKey (sha256 of email + services + message + 10-minute bucket) is unique, so a
 *   double-click or resubmission of the same enquiry within the window is stored once.
 * - seed: true only on development seed records (scripts/seed-dev-enquiries.mjs), never on
 *   real submissions.
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";
import type { EnquirySource, EnquiryStatus, ServiceId } from "@/lib/admin/types";
import { ENQUIRY_SERVICE_IDS, ENQUIRY_SOURCES, ENQUIRY_STATUSES, COMPANY_MAX, MESSAGE_MAX, NAME_MAX, WEBSITE_MAX } from "@/lib/validation/enquiry";

export interface EnquiryStatusChangeDoc {
  from: EnquiryStatus | null;
  to: EnquiryStatus;
  at: Date;
}

export interface EnquiryDoc {
  _id: Types.ObjectId;
  name: string;
  email: string;
  company?: string;
  website?: string;
  services: ServiceId[];
  message: string;
  status: EnquiryStatus;
  source: EnquirySource;
  statusHistory: EnquiryStatusChangeDoc[];
  deletedAt?: Date | null;
  dedupeKey?: string;
  seed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const statusChangeSchema = new Schema<EnquiryStatusChangeDoc>(
  {
    from: { type: String, enum: [...ENQUIRY_STATUSES, null], default: null },
    to: { type: String, enum: ENQUIRY_STATUSES, required: true },
    at: { type: Date, required: true },
  },
  { _id: false },
);

const enquirySchema = new Schema<EnquiryDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: NAME_MAX },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    company: { type: String, trim: true, maxlength: COMPANY_MAX },
    website: { type: String, trim: true, maxlength: WEBSITE_MAX },
    services: {
      type: [{ type: String, enum: ENQUIRY_SERVICE_IDS }],
      required: true,
      validate: { validator: (v: string[]) => Array.isArray(v) && v.length >= 1, message: "At least one service is required." },
    },
    message: { type: String, required: true, maxlength: MESSAGE_MAX },
    status: { type: String, enum: ENQUIRY_STATUSES, required: true, default: "NEW" },
    source: { type: String, enum: ENQUIRY_SOURCES, required: true },
    statusHistory: { type: [statusChangeSchema], default: [] },
    deletedAt: { type: Date, default: null },
    dedupeKey: { type: String, match: /^[a-f0-9]{64}$/ },
    seed: { type: Boolean },
  },
  { collection: "enquiries", timestamps: true, versionKey: false, strict: "throw" },
);

// Listings: non-deleted, newest first, optionally by status or service.
enquirySchema.index({ deletedAt: 1, createdAt: -1 }, { name: "active_recent" });
enquirySchema.index({ deletedAt: 1, status: 1, createdAt: -1 }, { name: "active_status_recent" });
enquirySchema.index({ deletedAt: 1, services: 1, createdAt: -1 }, { name: "active_service_recent" });
enquirySchema.index({ email: 1 }, { name: "email" });
enquirySchema.index({ dedupeKey: 1 }, { name: "dedupe_unique", unique: true, partialFilterExpression: { dedupeKey: { $type: "string" } } });

export const EnquiryModel: Model<EnquiryDoc> = (mongoose.models.Enquiry as Model<EnquiryDoc> | undefined) ?? mongoose.model<EnquiryDoc>("Enquiry", enquirySchema);
