import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { CASE_STUDY_BODY_MAX } from "@/lib/case-studies/constants";
import { caseStudyIdFrom, type IdContext } from "@/lib/case-studies/routes";
import { assertImagesUsable, assertMutationAllowed, caseStudyService, run } from "@/lib/case-studies/server";
import { caseStudyUpdateSchema } from "@/lib/case-studies/validation";
import { ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, assertSameOrigin, readJsonMutation } from "@/lib/server/http";
import { parseNestedWith } from "@/lib/validation/common";

/** GET /api/admin/case-studies/[id] — full admin record. 400 invalid id · 404 missing or deleted. */
export const GET = apiHandler<IdContext>(async (_request: NextRequest, ctx) => {
  await requireAdminApi();
  const id = await caseStudyIdFrom(ctx);
  return apiOk(await run(() => caseStudyService.get(id)));
}, "admin-case-studies");

/**
 * PATCH /api/admin/case-studies/[id] — { expectedUpdatedAt, changes }.
 * `changes` holds only the edited content fields (strict: status, ids, timestamps and audit
 * fields are rejected). Unchanged fields are preserved. A published record must stay
 * publishable. Changing a public slug keeps the old one as a redirect.
 * 200 record · 409 changed concurrently (STALE_RECORD) or slug taken · 422 invalid fields
 * or publishing rules · 404 missing/deleted.
 */
export const PATCH = apiHandler<IdContext>(async (request: NextRequest, ctx) => {
  const body = await readJsonMutation(request, CASE_STUDY_BODY_MAX);
  const { admin } = await requireAdminApi();
  const id = await caseStudyIdFrom(ctx);
  const parsed = parseNestedWith(caseStudyUpdateSchema, body);
  if (!parsed.ok) throw new ValidationError(Object.fromEntries(Object.entries(parsed.fields).map(([k, v]) => [k.replace(/^changes\./, ""), v])));
  await assertMutationAllowed(admin.id);
  await assertImagesUsable(parsed.data.changes);
  return apiOk(await run(() => caseStudyService.update(id, parsed.data.expectedUpdatedAt, parsed.data.changes, admin.id)));
}, "admin-case-studies");

/**
 * DELETE /api/admin/case-studies/[id] — soft delete (deletedAt set, slug freed, hidden from
 * public pages and normal admin lists; restorable). 404 if missing or already deleted.
 */
export const DELETE = apiHandler<IdContext>(async (request: NextRequest, ctx) => {
  assertSameOrigin(request);
  const { admin } = await requireAdminApi();
  const id = await caseStudyIdFrom(ctx);
  await assertMutationAllowed(admin.id);
  return apiOk(await run(() => caseStudyService.remove(id, admin.id)));
}, "admin-case-studies");
