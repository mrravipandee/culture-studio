import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { getEnquiry, softDeleteEnquiry, updateEnquiryStatus } from "@/lib/enquiries/repository";
import { BadRequestError, ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, assertSameOrigin, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { enquiryIdSchema, enquiryStatusUpdateSchema } from "@/lib/validation/enquiry";

type Ctx = { params: Promise<{ id: string }> };

async function idFrom(ctx: Ctx) {
  const { id } = await ctx.params;
  if (!enquiryIdSchema.safeParse(id).success) throw new BadRequestError("INVALID_ID", "That enquiry id isn't valid.");
  return id;
}

/** GET /api/admin/enquiries/[id] — full enquiry (complete message + status history). 404 if missing/deleted. */
export const GET = apiHandler<Ctx>(async (_request: NextRequest, ctx) => {
  await requireAdminApi();
  return apiOk(await getEnquiry(await idFrom(ctx)));
}, "admin-enquiries");

/**
 * PATCH /api/admin/enquiries/[id] — { status }. Only valid transitions
 * (NEW→READ/REPLIED/CLOSED, READ→REPLIED/CLOSED, REPLIED→CLOSED); each one is appended to
 * statusHistory. 422 invalid transition · 409 changed concurrently · 404 missing/deleted.
 */
export const PATCH = apiHandler<Ctx>(async (request: NextRequest, ctx) => {
  const body = await readJsonMutation(request, 512);
  await requireAdminApi();
  const id = await idFrom(ctx);
  const parsed = parseWith(enquiryStatusUpdateSchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields);
  return apiOk(await updateEnquiryStatus(id, parsed.data.status));
}, "admin-enquiries");

/** DELETE /api/admin/enquiries/[id] — soft delete (sets deletedAt; hidden everywhere). Same-origin only. */
export const DELETE = apiHandler<Ctx>(async (request: NextRequest, ctx) => {
  assertSameOrigin(request);
  await requireAdminApi();
  const id = await idFrom(ctx);
  await softDeleteEnquiry(id);
  return apiOk({ deleted: true, id });
}, "admin-enquiries");
