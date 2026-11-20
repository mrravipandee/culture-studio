import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { recordAudit } from "@/lib/audit/log";
import { deleteSubscriber, setSubscriberStatus } from "@/lib/subscribers/repository";
import { assertSubscriberWriteAllowed } from "@/lib/subscribers/admin";
import { BadRequestError, ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, assertSameOrigin, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { subscriberIdSchema, subscriberStatusUpdateSchema } from "@/lib/validation/subscriber";

type Ctx = { params: Promise<{ id: string }> };

async function idFrom(ctx: Ctx) {
  const { id } = await ctx.params;
  if (!subscriberIdSchema.safeParse(id).success) throw new BadRequestError("INVALID_ID", "That subscriber id isn't valid.");
  return id;
}

/** PATCH /api/admin/subscribers/[id] — { status: ACTIVE | UNSUBSCRIBED } (idempotent). 404 if missing. */
export const PATCH = apiHandler<Ctx>(async (request: NextRequest, ctx) => {
  const body = await readJsonMutation(request, 256);
  const { admin } = await requireAdminApi();
  const id = await idFrom(ctx);
  const parsed = parseWith(subscriberStatusUpdateSchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields);
  await assertSubscriberWriteAllowed(admin.id);
  const result = await setSubscriberStatus(id, parsed.data.status);
  if (result.changed) {
    await recordAudit({ adminId: admin.id, action: parsed.data.status === "UNSUBSCRIBED" ? "subscriber.unsubscribed" : "subscriber.reactivated", entityType: "Subscriber", entityId: id, at: new Date() });
  }
  return apiOk(result);
}, "admin-subscribers");

/** DELETE /api/admin/subscribers/[id] — permanent removal. 404 if missing. */
export const DELETE = apiHandler<Ctx>(async (request: NextRequest, ctx) => {
  assertSameOrigin(request);
  const { admin } = await requireAdminApi();
  const id = await idFrom(ctx);
  await assertSubscriberWriteAllowed(admin.id);
  await deleteSubscriber(id);
  await recordAudit({ adminId: admin.id, action: "subscriber.deleted", entityType: "Subscriber", entityId: id, at: new Date() });
  return apiOk({ deleted: true, id });
}, "admin-subscribers");
