import "server-only";

/**
 * Admin login activity (collection: admin_login_activity). SERVER-ONLY.
 *
 * recordLoginActivity never throws: a database problem must not block or break sign-in.
 */

import { Types, isValidObjectId } from "mongoose";
import { AdminLoginActivityModel, type AdminLoginActivityDoc, type LoginStatus } from "@/lib/db/models/AdminLoginActivity";
import type { LoginActivityData, LoginActivityItem } from "@/lib/admin/settings-schemas";
import { connectToDatabase, withDb } from "@/lib/db/mongoose";
import { summariseUserAgent } from "./user-agent";

export async function recordLoginActivity(entry: {
  id?: Types.ObjectId;
  adminId: string;
  status: LoginStatus;
  userAgent: string;
  ipAddress: string | null;
  location: string | null;
}) {
  try {
    await connectToDatabase();
    const ua = summariseUserAgent(entry.userAgent);
    await AdminLoginActivityModel.create({
      ...(entry.id ? { _id: entry.id } : {}),
      adminId: new Types.ObjectId(entry.adminId),
      status: entry.status,
      loggedInAt: new Date(),
      userAgent: entry.userAgent.slice(0, 512),
      device: ua.device,
      browser: ua.browser,
      os: ua.os,
      ...(entry.ipAddress ? { ipAddress: entry.ipAddress } : {}),
      ...(entry.location ? { location: entry.location } : {}),
    });
  } catch {
    console.error("[admin-auth] Could not record login activity in MongoDB.");
  }
}

type PublicActivity = Pick<AdminLoginActivityDoc, "_id" | "status" | "loggedInAt" | "device" | "browser" | "os" | "location">;

/** Fields returned to the client: never ipAddress or the raw user agent. */
const PUBLIC_FIELDS = "status loggedInAt device browser os location" as const;

/**
 * Recent activity for ONE admin (always filtered by adminId), newest first.
 * - current: this session's sign-in record (from the session's loginId), if it exists.
 * - lastLogin: the most recent successful sign-in BEFORE this session (never the same event).
 */
export async function getLoginActivity(adminId: string, currentLoginId: string | undefined, limit: number): Promise<LoginActivityData> {
  if (!isValidObjectId(adminId)) return { current: null, lastLogin: null, recent: [], failedLast30Days: 0 };
  return withDb(async () => {
    const owner = new Types.ObjectId(adminId);
    const currentId = currentLoginId && isValidObjectId(currentLoginId) ? new Types.ObjectId(currentLoginId) : null;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [recent, current, failedLast30Days] = await Promise.all([
      AdminLoginActivityModel.find({ adminId: owner }).sort({ loggedInAt: -1, _id: -1 }).limit(limit).select(PUBLIC_FIELDS).lean(),
      currentId ? AdminLoginActivityModel.findOne({ _id: currentId, adminId: owner, status: "SUCCESS" }).select(PUBLIC_FIELDS).lean() : null,
      AdminLoginActivityModel.countDocuments({ adminId: owner, status: "FAILED", loggedInAt: { $gte: since } }),
    ]);

    const last = await AdminLoginActivityModel.findOne({
      adminId: owner,
      status: "SUCCESS",
      // Exclude this session's own record even if it was written a moment after this read began.
      ...(currentId ? { _id: { $ne: currentId } } : {}),
      ...(current ? { loggedInAt: { $lte: current.loggedInAt } } : {}),
    })
      .sort({ loggedInAt: -1, _id: -1 })
      .select(PUBLIC_FIELDS)
      .lean();

    const toItem = (d: PublicActivity): LoginActivityItem => ({
      id: d._id.toString(),
      status: d.status,
      loggedInAt: d.loggedInAt.toISOString(),
      device: d.device,
      browser: d.browser,
      os: d.os,
      location: d.location ?? null,
      isCurrent: currentId !== null && d._id.equals(currentId),
    });

    return {
      current: current ? toItem(current) : null,
      lastLogin: last ? toItem(last) : null,
      recent: recent.map(toItem),
      failedLast30Days,
    };
  });
}
