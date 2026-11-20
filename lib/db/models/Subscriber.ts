import "server-only";

/**
 * Subscriber — one newsletter subscriber (collection: subscribers). SERVER-ONLY.
 *
 * - One record per email: `email` is stored trimmed + lowercase and has a UNIQUE index, so the
 *   same person can never be stored twice (repeat sign-ups update the existing record).
 * - status ACTIVE | UNSUBSCRIBED. subscribedAt = first subscription (never reset);
 *   unsubscribedAt / reactivatedAt = most recent change of each kind.
 * - lastSubmittedAt / submissionCount: repeat sign-ups through the public form.
 * - No verification email is sent, so `verifiedAt` is never set by the app (the field exists
 *   only so a future double opt-in can record it truthfully).
 * - strict: "throw": unknown properties are never persisted.
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";
import { SUBSCRIBER_NAME_MAX, SUBSCRIBER_SOURCES, SUBSCRIBER_STATUSES } from "@/lib/validation/subscriber";
import type { SubscriberSource, SubscriberStatus } from "@/lib/admin/types";

export interface SubscriberDoc {
  _id: Types.ObjectId;
  email: string;
  name?: string;
  status: SubscriberStatus;
  source: SubscriberSource;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  reactivatedAt?: Date;
  verifiedAt?: Date;
  lastSubmittedAt?: Date;
  submissionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new Schema<SubscriberDoc>(
  {
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    name: { type: String, trim: true, maxlength: SUBSCRIBER_NAME_MAX },
    status: { type: String, enum: SUBSCRIBER_STATUSES, required: true, default: "ACTIVE" },
    source: { type: String, enum: SUBSCRIBER_SOURCES, required: true },
    subscribedAt: { type: Date, required: true },
    unsubscribedAt: { type: Date },
    reactivatedAt: { type: Date },
    verifiedAt: { type: Date },
    lastSubmittedAt: { type: Date },
    submissionCount: { type: Number, required: true, default: 0, min: 0 },
  },
  { collection: "subscribers", timestamps: true, versionKey: false, strict: "throw" },
);

// One record per (normalised) email — the duplicate guard.
subscriberSchema.index({ email: 1 }, { name: "email_unique", unique: true });
// Admin list (newest first) and status filters / dashboard counts.
subscriberSchema.index({ subscribedAt: -1 }, { name: "recent" });
subscriberSchema.index({ status: 1, subscribedAt: -1 }, { name: "status_recent" });

export const SubscriberModel: Model<SubscriberDoc> = (mongoose.models.Subscriber as Model<SubscriberDoc> | undefined) ?? mongoose.model<SubscriberDoc>("Subscriber", subscriberSchema);
