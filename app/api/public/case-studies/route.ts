import type { NextRequest } from "next/server";
import { listPublicCaseStudies } from "@/lib/case-studies/public";
import { publicCaseStudyListQuerySchema } from "@/lib/case-studies/validation";
import { BadRequestError } from "@/lib/server/errors";
import { apiHandler, apiOk, searchParamsObject } from "@/lib/server/http";
import { parseNestedWith } from "@/lib/validation/common";
import { PUBLIC_CACHE_HEADERS } from "../cache-headers";

/**
 * GET /api/public/case-studies — published case studies only (never drafts, archived or
 * deleted records; no admin fields).
 * Query: page, pageSize (≤ 50, default 24), search, category (discipline id), filter
 * (listing filter id), service (catalog service id), featured (true|false),
 * sort (order | newest). 400 invalid query.
 */
export const GET = apiHandler(async (request: NextRequest) => {
  const parsed = parseNestedWith(publicCaseStudyListQuerySchema, searchParamsObject(request));
  if (!parsed.ok) throw new BadRequestError("INVALID_QUERY", "The filters aren't valid.", parsed.fields);
  return apiOk(await listPublicCaseStudies(parsed.data), { headers: PUBLIC_CACHE_HEADERS });
}, "public-case-studies");
