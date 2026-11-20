import "server-only";

/**
 * Subscriber repository (MongoDB). SERVER-ONLY.
 *
 * Duplicate safety:
 *  - Emails are normalised (trim + lowercase) by the Zod schema before they get here.
 *  - The unique index `email_unique` guarantees one record per email. It is ensured lazily
 *    once per server process (idempotent), in addition to `npm run db:indexes -- --apply`.
 *  - Public sign-up is ONE atomic upsert (update pipeline) keyed on the email: a new address
 *    is inserted; a known one is updated in place (ACTIVE stays ACTIVE, UNSUBSCRIBED is
 *    reactivated). Two simultaneous sign-ups for the same address can't create two records:
 *    the loser of the race hits the unique index and is retried as an update.
 * Driver errors become DatabaseUnavailableError (withDb); outcomes are typed AppErrors.
 */

import { Types, isValidObjectId } from "mongoose";
import { withDb } from "@/lib/db/mongoose";
import { SubscriberModel, type SubscriberDoc } from "@/lib/db/models/Subscriber";
import type { Subscriber, SubscriberSource, SubscriberStatus } from "@/lib/admin/types";
import { ConflictError, NotFoundError, isDuplicateKeyError } from "@/lib/server/errors";
import { SUBSCRIBER_LIST_MAX, type AdminAddSubscriberInput } from "@/lib/validation/subscriber";

/* Index guard ------------------------------------------------------------------------------ */

let indexReady: Promise<void> | null = null;

/** Creates the unique email index once per process (no-op when it already exists). */
export function ensureSubscriberIndexes(): Promise<void> {
  indexReady ??= withDb(async () => {
    await SubscriberModel.createIndexes();
  }).catch((error: unknown) => {
    indexReady = null; // retry on the next write
    console.error(`[subscribers] Could not ensure indexes (${error instanceof Error ? error.name : "error"}).`);
  });
  return indexReady;
}

/* Mapping ------------------------------------------------------------------------------------ */

type LeanSubscriber = Pick<SubscriberDoc, "_id" | "email" | "name" | "status" | "source" | "subscribedAt" | "unsubscribedAt" | "reactivatedAt" | "verifiedAt" | "createdAt" | "updatedAt">;
const LIST_FIELDS = "email name status source subscribedAt unsubscribedAt reactivatedAt verifiedAt createdAt updatedAt";

export const toSubscriber = (d: LeanSubscriber): Subscriber => ({
  id: d._id.toString(),
  ...(d.name ? { name: d.name } : {}),
  email: d.email,
  status: d.status,
  source: d.source,
  subscribedAt: d.subscribedAt.toISOString(),
  ...(d.verifiedAt ? { verifiedAt: d.verifiedAt.toISOString() } : {}),
  ...(d.unsubscribedAt ? { unsubscribedAt: d.unsubscribedAt.toISOString() } : {}),
  ...(d.reactivatedAt ? { reactivatedAt: d.reactivatedAt.toISOString() } : {}),
  createdAt: d.createdAt.toISOString(),
  updatedAt: d.updatedAt.toISOString(),
});

/* Public sign-up ------------------------------------------------------------------------------ */

/**
 * The single update pipeline for a sign-up (exported for tests). Every expression reads the
 * stored document as it was BEFORE this update, so the reactivation check and the counter are
 * atomic. On insert ($$ROOT is just { email }) the $ifNull branches create the record.
 */
export function signupPipeline(email: string, source: SubscriberSource, now: Date) {
  const wasUnsubscribed = { $eq: ["$status", "UNSUBSCRIBED"] };
  return [
    {
      $set: {
        email: { $literal: email },
        source: { $ifNull: ["$source", { $literal: source }] }, // first source is kept
        subscribedAt: { $ifNull: ["$subscribedAt", now] }, // first subscription is kept
        reactivatedAt: { $cond: [wasUnsubscribed, now, "$reactivatedAt"] },
        status: { $literal: "ACTIVE" },
        lastSubmittedAt: now,
        submissionCount: { $add: [{ $ifNull: ["$submissionCount", 0] }, 1] },
        createdAt: { $ifNull: ["$createdAt", now] },
        updatedAt: now,
      },
    },
  ];
}

export type SignupOutcome = "created" | "already-active" | "reactivated";

export async function subscribe(email: string, source: SubscriberSource, now = new Date()): Promise<SignupOutcome> {
  await ensureSubscriberIndexes();
  const run = () => SubscriberModel.collection.findOneAndUpdate({ email }, signupPipeline(email, source, now), { upsert: true, returnDocument: "before" });
  return withDb(async () => {
    let before;
    try {
      before = await run();
    } catch (error) {
      // Two first sign-ups at the same moment: one inserted, this one now updates it.
      if (!isDuplicateKeyError(error)) throw error;
      before = await run();
    }
    if (!before) return "created";
    return before.status === "UNSUBSCRIBED" ? "reactivated" : "already-active";
  });
}

/* Admin ------------------------------------------------------------------------------------------ */

export async function listSubscribers(): Promise<{ items: Subscriber[]; truncated: boolean }> {
  const docs = await withDb(() =>
    SubscriberModel.find({})
      .select(LIST_FIELDS)
      .sort({ subscribedAt: -1, _id: -1 })
      .limit(SUBSCRIBER_LIST_MAX + 1)
      .lean<LeanSubscriber[]>(),
  );
  return { items: docs.slice(0, SUBSCRIBER_LIST_MAX).map(toSubscriber), truncated: docs.length > SUBSCRIBER_LIST_MAX };
}

export async function countSubscribers(): Promise<{ total: number; active: number }> {
  const [total, active] = await withDb(() => Promise.all([SubscriberModel.countDocuments({}), SubscriberModel.countDocuments({ status: "ACTIVE" })]));
  return { total, active };
}

const emailInUse = () => new ConflictError("This email is already in the list.", "EMAIL_IN_USE", { email: "This email is already in the list." });

export async function addSubscriber(input: AdminAddSubscriberInput, now = new Date()): Promise<Subscriber> {
  await ensureSubscriberIndexes();
  return withDb(async () => {
    if (await SubscriberModel.exists({ email: input.email })) throw emailInUse();
    try {
      const doc = await SubscriberModel.create({
        email: input.email,
        ...(input.name ? { name: input.name } : {}),
        source: input.source,
        status: input.status,
        subscribedAt: now,
        ...(input.status === "UNSUBSCRIBED" ? { unsubscribedAt: now } : {}),
        submissionCount: 0,
      });
      return toSubscriber(doc.toObject());
    } catch (error) {
      if (isDuplicateKeyError(error)) throw emailInUse(); // lost a race with a concurrent sign-up
      throw error;
    }
  });
}

const notFound = () => new NotFoundError("That subscriber doesn't exist any more.");

/** Sets the status (idempotent: setting the current status returns the record unchanged). */
export async function setSubscriberStatus(id: string, status: SubscriberStatus, now = new Date()): Promise<{ subscriber: Subscriber; changed: boolean }> {
  if (!isValidObjectId(id)) throw notFound();
  const _id = new Types.ObjectId(id);
  const set = status === "UNSUBSCRIBED" ? { status, unsubscribedAt: now } : { status, reactivatedAt: now };
  return withDb(async () => {
    const updated = await SubscriberModel.findOneAndUpdate({ _id, status: { $ne: status } }, { $set: set }, { returnDocument: "after", runValidators: true }).select(LIST_FIELDS).lean<LeanSubscriber>();
    if (updated) return { subscriber: toSubscriber(updated), changed: true };
    const current = await SubscriberModel.findById(_id).select(LIST_FIELDS).lean<LeanSubscriber>();
    if (!current) throw notFound();
    return { subscriber: toSubscriber(current), changed: false };
  });
}

/** Permanently removes the record (personal data is not kept after deletion). */
export async function deleteSubscriber(id: string): Promise<void> {
  if (!isValidObjectId(id)) throw notFound();
  const result = await withDb(() => SubscriberModel.deleteOne({ _id: new Types.ObjectId(id) }));
  if (result.deletedCount !== 1) throw notFound();
}

/** Bulk unsubscribe (ACTIVE ones only) or delete. Returns the ids actually changed. */
export async function bulkSubscribers(action: "unsubscribe" | "delete", ids: string[], now = new Date()): Promise<string[]> {
  const objectIds = ids.filter((id) => isValidObjectId(id)).map((id) => new Types.ObjectId(id));
  return withDb(async () => {
    const filter = action === "unsubscribe" ? { _id: { $in: objectIds }, status: "ACTIVE" as const } : { _id: { $in: objectIds } };
    const targets = (await SubscriberModel.find(filter).select("_id").lean<{ _id: Types.ObjectId }[]>()).map((d) => d._id);
    if (targets.length === 0) return [];
    if (action === "unsubscribe") await SubscriberModel.updateMany({ _id: { $in: targets }, status: "ACTIVE" }, { $set: { status: "UNSUBSCRIBED", unsubscribedAt: now } });
    else await SubscriberModel.deleteMany({ _id: { $in: targets } });
    return targets.map((t) => t.toString());
  });
}
