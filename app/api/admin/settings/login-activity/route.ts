import type { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/auth/api";
import { DatabaseUnavailableError } from "@/lib/auth/admin-store";
import { getLoginActivity } from "@/lib/auth/login-log";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { parseActivityQuery } from "@/lib/admin/settings-schemas";

/**
 * GET /api/admin/settings/login-activity?limit=5 — the signed-in admin's own recent
 * sign-ins (always filtered by the session's adminId), newest first.
 * Never returns IP addresses or raw user agents.
 */
export async function GET(request: NextRequest) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const query = parseActivityQuery(request.nextUrl.searchParams);
  if (!query.ok) return apiError(400, "INVALID_QUERY", "The request parameters are invalid.", query.fields);

  try {
    const { admin, session } = guard.auth;
    return apiOk(await getLoginActivity(admin.id, session.loginId, query.data.limit));
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) return apiError(503, "DATABASE_UNAVAILABLE", "Login activity is unavailable right now. Please try again.");
    console.error("[admin-settings] Unexpected error while reading login activity.");
    return apiError(500, "SERVER_ERROR", "Something went wrong while loading login activity.");
  }
}
