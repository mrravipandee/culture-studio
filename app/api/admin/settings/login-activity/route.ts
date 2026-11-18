import type { NextRequest } from "next/server";
import { getLoginActivity } from "@/lib/auth/login-log";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { BadRequestError } from "@/lib/server/errors";
import { apiHandler, apiOk } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { loginActivityQuerySchema } from "@/lib/validation/auth";

/**
 * GET /api/admin/settings/login-activity?limit=5 — the signed-in admin's own recent
 * sign-ins (always filtered by the session's adminId), newest first.
 * Never returns IP addresses or raw user agents.
 */
export const GET = apiHandler(async (request: NextRequest) => {
  const { admin, session } = await requireAdminApi();

  const params = request.nextUrl.searchParams;
  if ([...params.keys()].some((k, i, all) => all.indexOf(k) !== i)) throw new BadRequestError("INVALID_QUERY", "The request parameters are invalid.", { form: "Repeated parameter." });
  const query = parseWith(loginActivityQuerySchema, Object.fromEntries(params));
  if (!query.ok) throw new BadRequestError("INVALID_QUERY", "The request parameters are invalid.", query.fields);

  return apiOk(await getLoginActivity(admin.id, session.loginId, query.data.limit));
}, "admin-settings");
