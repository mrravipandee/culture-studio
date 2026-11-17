import type { NextRequest } from "next/server";
import { AuthConfigError } from "@/lib/auth/config";
import { isSameOrigin, json } from "@/lib/auth/request";
import { getAdminSession } from "@/lib/auth/session";

/** POST /api/admin/logout — clears the sealed session cookie. Same-origin only. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden." }, 403);
  try {
    const session = await getAdminSession();
    session.destroy();
  } catch (error) {
    if (!(error instanceof AuthConfigError)) throw error;
    // Misconfigured: there is no valid session to clear.
  }
  return json({ ok: true, redirect: "/admin/login" }, 200);
}
