import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { listEnquiries } from "@/lib/enquiries/repository";
import { BadRequestError } from "@/lib/server/errors";
import { apiHandler, apiOk, searchParamsObject } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { enquiryListQuerySchema } from "@/lib/validation/enquiry";

/**
 * GET /api/admin/enquiries — paginated, filtered list (newest first) of non-deleted enquiries.
 *
 * Query (all optional, validated): page, pageSize (1–50, default 6), search (name/email),
 * status (all|NEW|READ|REPLIED|CLOSED), service (all|<service id>),
 * range (all|today|7d|30d|month, India time), from/to (YYYY-MM-DD, inclusive).
 * Returns items (message preview only), page, pageSize, totalPages, filteredCount,
 * totalCount and statusCounts.
 */
export const GET = apiHandler(async (request: NextRequest) => {
  await requireAdminApi();
  const query = parseWith(enquiryListQuerySchema, searchParamsObject(request));
  if (!query.ok) throw new BadRequestError("INVALID_QUERY", "The filters are invalid.", query.fields);
  return apiOk(await listEnquiries(query.data));
}, "admin-enquiries");
