/**
 * Records a successful admin sign-in in MongoDB. SERVER-ONLY.
 * Never throws: a database problem must not block or break sign-in.
 */

import { connectToDatabase } from "@/lib/db/mongoose";
import { AdminLoginModel } from "@/lib/db/models/AdminLogin";

export async function recordAdminLogin(entry: { email: string; ip: string; userAgent: string }) {
  try {
    await connectToDatabase();
    await AdminLoginModel.create({
      email: entry.email,
      ip: entry.ip,
      userAgent: entry.userAgent.slice(0, 512),
      loggedInAt: new Date(),
    });
  } catch {
    console.error("[admin-auth] Could not record the sign-in time in MongoDB.");
  }
}
