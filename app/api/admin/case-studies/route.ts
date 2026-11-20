import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { CASE_STUDY_BODY_MAX } from "@/lib/case-studies/constants";
import { assertImagesUsable, assertMutationAllowed, caseStudyService, run } from "@/lib/case-studies/server";
import { caseStudyCreateSchema, caseStudyListQuerySchema } from "@/lib/case-studies/validation";
import { BadRequestError, ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation, searchParamsObject } from "@/lib/server/http";
import { parseNestedWith } from "@/lib/validation/common";

/**
 * GET /api/admin/case-studies — paginated admin listing.
 * Query: page, pageSize (≤ 50), search (title/slug), status (all | DRAFT | PUBLISHED |
 * ARCHIVED | deleted), featured (true|false), category (discipline id), service (catalog
 * service id), from / to (YYYY-MM-DD, India time, on createdAt), sort (newest | oldest |
 * updated | order | title). Returns items, filtered count, pages and per-status counts.
 * 400 invalid query · 401 signed out · 503 database unavailable.
 */
export const GET = apiHandler(async (request: NextRequest) => {
  await requireAdminApi();
  const parsed = parseNestedWith(caseStudyListQuerySchema, searchParamsObject(request));
  if (!parsed.ok) throw new BadRequestError("INVALID_QUERY", "The filters aren't valid.", parsed.fields);
  return apiOk(await caseStudyService.list(parsed.data));
}, "admin-case-studies");

/**
 * POST /api/admin/case-studies — create a DRAFT (status is never accepted from the client).
 * Slug is optional (generated from the title). The signed-in admin becomes createdBy.
 * 201 record · 400/413/415 bad request · 403 cross-site · 409 slug taken (with a suggestion
 * in fields.slugSuggestion) · 422 invalid fields · 429 rate limited.
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await readJsonMutation(request, CASE_STUDY_BODY_MAX);
  const { admin } = await requireAdminApi();
  const parsed = parseNestedWith(caseStudyCreateSchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields);
  await assertMutationAllowed(admin.id);
  await assertImagesUsable(parsed.data);
  return apiOk(await run(() => caseStudyService.create(parsed.data, admin.id)), { status: 201 });
}, "admin-case-studies");
