import type { NextRequest } from "next/server";
import { AuthConfigError } from "@/lib/auth/config";
import { getAdminSession } from "@/lib/auth/session";
import { revokeSession } from "@/lib/auth/sessions";
import { apiHandler, apiOk, assertSameOrigin } from "@/lib/server/http";

/**
 * POST /api/admin/logout — revokes this session server-side, then clears the cookie.
 * Same-origin only. A copied cookie stops working as soon as the session record is revoked.
 * If MongoDB is unreachable the cookie is still cleared (data.revoked = false) and the
 * session record expires on its own at the end of its 8-hour lifetime.
 */
export const POST = apiHandler(async (request: NextRequest) => {
  assertSameOrigin(request);
  let revoked = false;
  try {
    const session = await getAdminSession();
    if (typeof session.sid === "string") {
      try {
        await revokeSession(session.sid, "logout");
        revoked = true;
      } catch {
        console.error("[admin-auth] Logout: the session could not be revoked (database unavailable); the cookie was cleared.");
      }
    }
    session.destroy();
  } catch (error) {
    if (!(error instanceof AuthConfigError)) throw error;
    // Misconfigured: there is no valid session to clear.
  }
  return apiOk({ redirect: "/admin/login", revoked });
}, "admin-auth");
