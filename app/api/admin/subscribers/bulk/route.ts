import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { recordAuditMany } from "@/lib/audit/log";
import { bulkSubscribers } from "@/lib/subscribers/repository";
import { assertSubscriberWriteAllowed } from "@/lib/subscribers/admin";
import { ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { subscriberBulkSchema } from "@/lib/validation/subscriber";

/**
 * POST /api/admin/subscribers/bulk — { action: "unsubscribe" | "delete", ids: [...≤500] }.
 * Unsubscribe touches ACTIVE records only; delete is permanent. Returns the ids changed.
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await readJsonMutation(request, 16 * 1024);
  const { admin } = await requireAdminApi();
  const parsed = parseWith(subscriberBulkSchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields);
  await assertSubscriberWriteAllowed(admin.id);
  const at = new Date();
  const changed = await bulkSubscribers(parsed.data.action, parsed.data.ids, at);
  const action = parsed.data.action === "delete" ? "subscriber.deleted" : "subscriber.unsubscribed";
  await recordAuditMany(changed.map((entityId) => ({ adminId: admin.id, action, entityType: "Subscriber", entityId, at })));
  return apiOk({ action: parsed.data.action, changed });
}, "admin-subscribers");
