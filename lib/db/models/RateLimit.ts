import "server-only";

/**
 * RateLimit — fixed-window attempt counters shared by every server instance
 * (collection: rate_limits). SERVER-ONLY.
 *
 * _id is the bucket key (e.g. "login:ip:<hash>"); IPs and ids are hashed before use.
 * Counters are updated atomically by lib/auth/rate-limit.ts with one findOneAndUpdate.
 * A TTL index deletes buckets once their window ends; reads also compare expiresAt
 * because TTL cleanup runs only about once a minute.
 */

import mongoose, { Schema, type Model } from "mongoose";

export interface RateLimitDoc {
  _id: string;
  count: number;
  windowStart: Date;
  expiresAt: Date;
}

const rateLimitSchema = new Schema<RateLimitDoc>(
  {
    _id: { type: String, required: true, maxlength: 200 },
    count: { type: Number, required: true, min: 0 },
    windowStart: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { collection: "rate_limits", versionKey: false, strict: "throw" },
);

rateLimitSchema.index({ expiresAt: 1 }, { name: "expiry_ttl", expireAfterSeconds: 0 });

export const RateLimitModel: Model<RateLimitDoc> =
  (mongoose.models.RateLimit as Model<RateLimitDoc> | undefined) ?? mongoose.model<RateLimitDoc>("RateLimit", rateLimitSchema);
