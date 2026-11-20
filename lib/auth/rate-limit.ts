import "server-only";

/**
 * Attempt rate limiting for admin authentication, shared by every server instance
 * (MongoDB collection: rate_limits). SERVER-ONLY.
 *
 * Fixed windows. Each failure is counted with ONE atomic findOneAndUpdate (pipeline upsert):
 * if the bucket's window has ended it restarts at 1, otherwise the count increments.
 * A bucket at or above its limit blocks until its window ends (Retry-After = seconds left).
 *
 * Policies
 *  - login per IP       5 failures / 15 min. Only when the IP comes from a trusted proxy
 *                        header (Vercel, or TRUST_PROXY_HEADERS=true); stored hashed.
 *  - login per account  20 failures / 15 min, counting only wrong passwords for the REAL
 *                        admin email. Stops slow distributed guessing; unknown emails can't
 *                        trip it. Residual risk: someone who knows the admin email can keep
 *                        sign-in locked by failing 20 times per window (documented).
 *  - password checks    5 wrong current passwords / 15 min per signed-in admin (Settings).
 *  - enquiries per IP    5 submissions / 15 min (trusted IP only, hashed).
 *  - enquiries per email 3 submissions / 15 min (hashed), so the limit still applies when
 *                        the IP can't be trusted (local development, non-Vercel hosting).
 *
 * The previous instance-wide lockout (30 failures from anyone, including unknown emails,
 * locked sign-in for everyone) was removed: it let anonymous visitors deny admin access.
 */

import { createHash } from "node:crypto";
import { withDb } from "@/lib/db/mongoose";
import { RateLimitModel } from "@/lib/db/models/RateLimit";
import { isDuplicateKeyError } from "@/lib/server/errors";

export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
}

const MINUTES = 60 * 1000;

export const RATE_LIMITS = {
  loginIp: { limit: 5, windowMs: 15 * MINUTES },
  loginAccount: { limit: 20, windowMs: 15 * MINUTES },
  passwordCheck: { limit: 5, windowMs: 15 * MINUTES },
  /** Public enquiry form: every submission counts (not just failures). */
  enquiryIp: { limit: 5, windowMs: 15 * MINUTES },
  enquiryEmail: { limit: 3, windowMs: 15 * MINUTES },
  /** Admin case study writes (create, update, delete, status actions): every write counts. */
  caseStudyWrite: { limit: 120, windowMs: 15 * MINUTES },
  /** Cloudinary upload signatures (one per uploaded image). */
  mediaSignature: { limit: 60, windowMs: 15 * MINUTES },
  /** Public newsletter sign-up: every submission counts. */
  subscribeIp: { limit: 6, windowMs: 15 * MINUTES },
  subscribeEmail: { limit: 3, windowMs: 15 * MINUTES },
  /** Admin subscriber writes. */
  subscriberWrite: { limit: 120, windowMs: 15 * MINUTES },
  /** Admin blog writes (saves, publishing, deletes). Autosave-free editor, so this is generous. */
  blogWrite: { limit: 200, windowMs: 15 * MINUTES },
} as const satisfies Record<string, RateLimitPolicy>;

const hashed = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 32);

/** Bucket keys. IPs are hashed so raw addresses are never stored in rate_limits. */
export const rateLimitKeys = {
  loginIp: (ip: string) => `login:ip:${hashed(ip)}`,
  loginAccount: (adminId: string) => `login:account:${adminId}`,
  passwordCheck: (adminId: string) => `password-check:${adminId}`,
  enquiryIp: (ip: string) => `enquiry:ip:${hashed(ip)}`,
  enquiryEmail: (email: string) => `enquiry:email:${hashed(email)}`,
  caseStudyWrite: (adminId: string) => `case-study:write:${adminId}`,
  mediaSignature: (adminId: string) => `media:signature:${adminId}`,
  subscribeIp: (ip: string) => `subscribe:ip:${hashed(ip)}`,
  subscribeEmail: (email: string) => `subscribe:email:${hashed(email)}`,
  subscriberWrite: (adminId: string) => `subscriber:write:${adminId}`,
  blogWrite: (adminId: string) => `blog:write:${adminId}`,
};

/** Seconds until the bucket allows another attempt, or 0 when allowed. */
export async function rateLimitRetryAfter(key: string, policy: RateLimitPolicy, now = Date.now()): Promise<number> {
  const doc = await withDb(() => RateLimitModel.findById(key).select("count expiresAt").lean());
  return secondsBlocked(doc, policy, now);
}

/** Pure decision (exported for tests). */
export function secondsBlocked(doc: { count: number; expiresAt: Date } | null, policy: RateLimitPolicy, now: number): number {
  if (!doc) return 0;
  const end = doc.expiresAt.getTime();
  if (end <= now || doc.count < policy.limit) return 0;
  return Math.ceil((end - now) / 1000);
}

/**
 * The update pipeline for one failure (exported for tests). Every expression reads the
 * stored document as it was before this update, so the check-and-increment is atomic.
 */
export function failurePipeline(policy: RateLimitPolicy, now: number) {
  const at = new Date(now);
  const windowOpen = { $gt: ["$expiresAt", at] }; // false when the bucket is new or its window ended
  return [
    {
      $set: {
        count: { $cond: [windowOpen, { $add: [{ $ifNull: ["$count", 0] }, 1] }, 1] },
        windowStart: { $cond: [windowOpen, "$windowStart", at] },
        expiresAt: { $cond: [windowOpen, "$expiresAt", new Date(now + policy.windowMs)] },
      },
    },
  ];
}

/** Counts one failure atomically. Returns the bucket's count after this failure. */
export async function recordRateLimitFailure(key: string, policy: RateLimitPolicy, now = Date.now()): Promise<number> {
  const run = () =>
    RateLimitModel.collection.findOneAndUpdate({ _id: key } as never, failurePipeline(policy, now), { upsert: true, returnDocument: "after" });
  return withDb(async () => {
    let doc;
    try {
      doc = await run();
    } catch (error) {
      // Two first failures at the same moment can race on the upsert; the retry increments.
      if (!isDuplicateKeyError(error)) throw error;
      doc = await run();
    }
    return typeof doc?.count === "number" ? doc.count : 1;
  });
}

/** Clears a bucket (after a successful sign-in or password check). */
export async function resetRateLimit(key: string) {
  await withDb(() => RateLimitModel.deleteOne({ _id: key }));
}
