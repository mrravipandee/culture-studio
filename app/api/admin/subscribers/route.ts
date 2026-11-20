import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { recordAudit } from "@/lib/audit/log";
import { addSubscriber, listSubscribers } from "@/lib/subscribers/repository";
import { assertSubscriberWriteAllowed } from "@/lib/subscribers/admin";
import { ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { adminAddSubscriberSchema } from "@/lib/validation/subscriber";

/** GET /api/admin/subscribers — every subscriber, newest first ({ items, truncated } beyond 10,000). */
export const GET = apiHandler(async () => {
  await requireAdminApi();
  return apiOk(await listSubscribers());
}, "admin-subscribers");

/**
 * POST /api/admin/subscribers — add one manually { email, name?, source, status }.
 * 201 record · 409 EMAIL_IN_USE (already in the list) · 422 invalid fields · 429 rate limited.
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await readJsonMutation(request, 1024);
  const { admin } = await requireAdminApi();
  const parsed = parseWith(adminAddSubscriberSchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields);
  await assertSubscriberWriteAllowed(admin.id);
  const subscriber = await addSubscriber(parsed.data);
  await recordAudit({ adminId: admin.id, action: "subscriber.added", entityType: "Subscriber", entityId: subscriber.id, at: new Date() });
  return apiOk(subscriber, { status: 201 });
}, "admin-subscribers");
