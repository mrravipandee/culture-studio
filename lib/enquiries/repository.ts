import "server-only";

/**
 * Enquiry repository (MongoDB). SERVER-ONLY.
 *
 * Every read excludes soft-deleted records (deletedAt set). Lists return a short message
 * preview; only the detail read returns the full message and status history. Driver errors
 * become DatabaseUnavailableError (via withDb); business outcomes throw typed AppErrors.
 */

import { createHash } from "node:crypto";
import { Types, isValidObjectId } from "mongoose";
import { withDb } from "@/lib/db/mongoose";
import { EnquiryModel, type EnquiryDoc } from "@/lib/db/models/Enquiry";
import type { Enquiry, EnquiryDetail, EnquiryStatus, ServiceId } from "@/lib/admin/types";
import { ConflictError, NotFoundError, ValidationError, isDuplicateKeyError } from "@/lib/server/errors";
import { ENQUIRY_SERVICE_IDS, ENQUIRY_STATUSES, canTransition, type EnquiryListQuery, type EnquirySubmission } from "@/lib/validation/enquiry";
import { IST_TIMEZONE, istDayStart, lastDays, queryWindow } from "./dates";
import type { EnquiryListResult, StatusCounts } from "./types";

const ACTIVE = { deletedAt: null } as const;
const PREVIEW_CHARS = 240;

type ListDoc = Pick<EnquiryDoc, "_id" | "name" | "email" | "company" | "website" | "services" | "message" | "status" | "source" | "createdAt" | "updatedAt">;

const toEnquiry = (d: ListDoc, preview = true): Enquiry => ({
  id: d._id.toString(),
  name: d.name,
  email: d.email,
  ...(d.company ? { company: d.company } : {}),
  ...(d.website ? { website: d.website } : {}),
  services: d.services,
  message: preview && d.message.length > PREVIEW_CHARS ? `${d.message.slice(0, PREVIEW_CHARS).trimEnd()}…` : d.message,
  status: d.status,
  source: d.source,
  createdAt: d.createdAt.toISOString(),
  updatedAt: d.updatedAt.toISOString(),
});

const toDetail = (d: ListDoc & Pick<EnquiryDoc, "statusHistory">): EnquiryDetail => ({
  ...toEnquiry(d, false),
  statusHistory: (d.statusHistory ?? []).map((h) => ({ from: h.from ?? null, to: h.to, at: h.at.toISOString() })),
});

const LIST_FIELDS = "name email company website services message status source createdAt updatedAt";

/** Short public reference shown to the person who submitted (not secret, not an index). */
export const enquiryReference = (id: string) => id.slice(-6).toUpperCase();

/** Same person + services + message within a 10-minute window → same key. */
export function enquiryDedupeKey(s: Pick<EnquirySubmission, "email" | "services" | "message">, now: number): string {
  const bucket = Math.floor(now / (10 * 60 * 1000));
  const message = s.message.toLowerCase().replace(/\s+/g, " ").trim();
  return createHash("sha256").update(`${s.email}\u0000${[...s.services].sort().join(",")}\u0000${message}\u0000${bucket}`).digest("hex");
}

/* Public submission ----------------------------------------------------------------------- */

export async function createEnquiry(s: EnquirySubmission, now = Date.now()): Promise<{ reference: string; duplicate: boolean }> {
  const dedupeKey = enquiryDedupeKey(s, now);
  return withDb(async () => {
    const existing = await EnquiryModel.findOne({ dedupeKey }).select("_id").lean();
    if (existing) return { reference: enquiryReference(existing._id.toString()), duplicate: true };
    try {
      const at = new Date(now);
      const doc = await EnquiryModel.create({
        name: s.name,
        email: s.email,
        ...(s.company ? { company: s.company } : {}),
        ...(s.website ? { website: s.website } : {}),
        services: s.services,
        message: s.message,
        status: "NEW",
        source: s.source,
        statusHistory: [{ from: null, to: "NEW", at }],
        dedupeKey,
      });
      return { reference: enquiryReference(doc._id.toString()), duplicate: false };
    } catch (error) {
      // A concurrent identical submission won the unique index: treat as the same enquiry.
      if (isDuplicateKeyError(error)) {
        const winner = await EnquiryModel.findOne({ dedupeKey }).select("_id").lean();
        if (winner) return { reference: enquiryReference(winner._id.toString()), duplicate: true };
      }
      throw error;
    }
  });
}

/* Admin list --------------------------------------------------------------------------------- */

export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** MongoDB filter for a validated list query (exported for tests). Values are never raw input objects. */
export function listFilter(q: EnquiryListQuery, now: number) {
  const filter: Record<string, unknown> = { ...ACTIVE };
  if (q.status !== "all") filter.status = q.status;
  if (q.service !== "all") filter.services = q.service;
  const w = queryWindow(q.range, now, q.from, q.to);
  if (w.start || w.end) filter.createdAt = { ...(w.start ? { $gte: w.start } : {}), ...(w.end ? { $lt: w.end } : {}) };
  if (q.search) {
    const re = new RegExp(escapeRegex(q.search), "i");
    filter.$or = [{ name: re }, { email: re }];
  }
  return filter;
}

export type { EnquiryListResult, StatusCounts };

const emptyStatusCounts = (): StatusCounts => Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s, 0])) as StatusCounts;

export async function listEnquiries(q: EnquiryListQuery, now = Date.now()): Promise<EnquiryListResult> {
  const filter = listFilter(q, now);
  return withDb(async () => {
    const [filteredCount, byStatus] = await Promise.all([
      EnquiryModel.countDocuments(filter),
      EnquiryModel.aggregate<{ _id: EnquiryStatus; n: number }>([{ $match: ACTIVE }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
    ]);
    const totalPages = Math.max(1, Math.ceil(filteredCount / q.pageSize));
    const page = Math.min(q.page, totalPages); // out-of-range pages clamp to the last page
    const docs = await EnquiryModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * q.pageSize)
      .limit(q.pageSize)
      .select(LIST_FIELDS)
      .lean<ListDoc[]>();
    const statusCounts = emptyStatusCounts();
    for (const s of byStatus) if (s._id in statusCounts) statusCounts[s._id] = s.n;
    return {
      items: docs.map((d) => toEnquiry(d)),
      page,
      pageSize: q.pageSize,
      totalPages,
      filteredCount,
      totalCount: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      statusCounts,
    };
  });
}

export async function countNewEnquiries(): Promise<number> {
  return withDb(() => EnquiryModel.countDocuments({ ...ACTIVE, status: "NEW" }));
}

/* Admin single record ------------------------------------------------------------------------ */

const notFound = () => new NotFoundError("This enquiry doesn't exist or was deleted.");

export async function getEnquiry(id: string): Promise<EnquiryDetail> {
  if (!isValidObjectId(id)) throw notFound();
  const doc = await withDb(() => EnquiryModel.findOne({ _id: new Types.ObjectId(id), ...ACTIVE }).select(`${LIST_FIELDS} statusHistory`).lean());
  if (!doc) throw notFound();
  return toDetail(doc);
}

/** Applies a valid transition atomically (only if the status is still what was read) and records it. */
export async function updateEnquiryStatus(id: string, to: EnquiryStatus, now = Date.now()): Promise<EnquiryDetail> {
  if (!isValidObjectId(id)) throw notFound();
  const _id = new Types.ObjectId(id);
  return withDb(async () => {
    const current = await EnquiryModel.findOne({ _id, ...ACTIVE }).select("status").lean();
    if (!current) throw notFound();
    if (current.status === to) return getEnquiry(id); // idempotent
    if (!canTransition(current.status, to)) {
      throw new ValidationError({ status: `An enquiry can't move from ${current.status} to ${to}.` }, "That status change isn't allowed.", "VALIDATION_ERROR");
    }
    const doc = await EnquiryModel.findOneAndUpdate(
      { _id, ...ACTIVE, status: current.status },
      { $set: { status: to }, $push: { statusHistory: { from: current.status, to, at: new Date(now) } } },
      { returnDocument: "after", projection: `${LIST_FIELDS} statusHistory` },
    ).lean();
    if (!doc) throw new ConflictError("This enquiry was changed somewhere else. Reload and try again.");
    return toDetail(doc);
  });
}

export async function softDeleteEnquiry(id: string, now = Date.now()): Promise<void> {
  if (!isValidObjectId(id)) throw notFound();
  const result = await withDb(() => EnquiryModel.updateOne({ _id: new Types.ObjectId(id), ...ACTIVE }, { $set: { deletedAt: new Date(now) } }));
  if (result.matchedCount === 0) throw notFound();
}

/* Dashboard ------------------------------------------------------------------------------------ */

export interface EnquiryDashboard {
  total: number;
  newCount: number;
  /** Count of enquiries selecting each service (an enquiry may select several). */
  serviceCounts: Record<ServiceId, number>;
  /** Enquiries per IST day for the last `days` days, oldest first (zero-filled). */
  daily: { date: string; count: number }[];
  recent: Enquiry[];
}

export async function getEnquiryDashboard(now = Date.now(), days = 90, recentLimit = 5): Promise<EnquiryDashboard> {
  const dayList = lastDays(days, now);
  const since = istDayStart(dayList[0]);
  const [facet] = await withDb(() =>
    EnquiryModel.aggregate<{
      total: { n: number }[];
      newCount: { n: number }[];
      byService: { _id: ServiceId; n: number }[];
      daily: { _id: string; n: number }[];
      recent: ListDoc[];
    }>([
      { $match: ACTIVE },
      {
        $facet: {
          total: [{ $count: "n" }],
          newCount: [{ $match: { status: "NEW" } }, { $count: "n" }],
          byService: [{ $unwind: "$services" }, { $group: { _id: "$services", n: { $sum: 1 } } }],
          daily: [
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: IST_TIMEZONE } }, n: { $sum: 1 } } },
          ],
          recent: [
            { $sort: { createdAt: -1, _id: -1 } },
            { $limit: recentLimit },
            { $project: { name: 1, email: 1, company: 1, website: 1, services: 1, message: 1, status: 1, source: 1, createdAt: 1, updatedAt: 1 } },
          ],
        },
      },
    ]),
  );
  const serviceCounts = Object.fromEntries(ENQUIRY_SERVICE_IDS.map((id) => [id, 0])) as Record<ServiceId, number>;
  for (const s of facet?.byService ?? []) if (s._id in serviceCounts) serviceCounts[s._id] = s.n;
  const perDay = new Map((facet?.daily ?? []).map((d) => [d._id, d.n]));
  return {
    total: facet?.total[0]?.n ?? 0,
    newCount: facet?.newCount[0]?.n ?? 0,
    serviceCounts,
    daily: dayList.map((date) => ({ date, count: perDay.get(date) ?? 0 })),
    recent: (facet?.recent ?? []).map((d) => toEnquiry(d)),
  };
}
