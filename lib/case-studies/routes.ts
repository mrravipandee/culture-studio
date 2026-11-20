import "server-only";

/**
 * Shared Route Handler bodies for /api/admin/case-studies/[id]/(publish|unpublish|archive|restore).
 * SERVER-ONLY. Each route file is a one-line export of `statusActionRoute(action)`.
 *
 * Order of checks: same-origin + JSON body (CSRF) → signed-in admin (MongoDB session check)
 * → id format → body schema → rate limit → service (status guard, validation, atomic write).
 */

import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { BadRequestError, ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";
import { parseNestedWith } from "@/lib/validation/common";
import type { CaseStudyAction } from "./constants";
import { assertMutationAllowed, caseStudyService, run } from "./server";
import { caseStudyActionSchema, caseStudyIdSchema, caseStudyRestoreSchema } from "./validation";

export type IdContext = { params: Promise<{ id: string }> };

export async function caseStudyIdFrom(ctx: IdContext) {
  const { id } = await ctx.params;
  if (!caseStudyIdSchema.safeParse(id).success) throw new BadRequestError("INVALID_ID", "That case study id isn't valid.");
  return id;
}

/** Body: JSON object, `{}` when there is nothing to send. */
export function statusActionRoute(action: CaseStudyAction) {
  return apiHandler<IdContext>(async (request: NextRequest, ctx) => {
    const body = await readJsonMutation(request, 1024);
    const { admin } = await requireAdminApi();
    const id = await caseStudyIdFrom(ctx);
    const parsed = parseNestedWith(action === "restore" ? caseStudyRestoreSchema : caseStudyActionSchema, body);
    if (!parsed.ok) throw new ValidationError(parsed.fields);
    await assertMutationAllowed(admin.id);
    const options = parsed.data as { expectedUpdatedAt?: string; slug?: string };
    return apiOk(await run(() => caseStudyService.transition(id, action, admin.id, options)));
  }, `admin-case-studies-${action}`);
}
