import "server-only";

import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { BadRequestError, ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { assertBlogWriteAllowed, blogService, runBlog } from "./server";
import { blogActionSchema, blogIdSchema } from "./validation";

export type BlogIdContext = { params: Promise<{ id: string }> };

export async function blogIdFrom(ctx: BlogIdContext) {
  const { id } = await ctx.params;
  if (!blogIdSchema.safeParse(id).success) throw new BadRequestError("INVALID_ID", "That article id isn't valid.");
  return id;
}

/** POST /api/admin/blogs/[id]/(publish|unpublish) — body {} or { expectedUpdatedAt }. */
export function blogStatusRoute(action: "publish" | "unpublish") {
  return apiHandler<BlogIdContext>(async (request: NextRequest, ctx) => {
    const body = await readJsonMutation(request, 512);
    const { admin } = await requireAdminApi();
    const id = await blogIdFrom(ctx);
    const parsed = parseWith(blogActionSchema, body);
    if (!parsed.ok) throw new ValidationError(parsed.fields);
    await assertBlogWriteAllowed(admin.id);
    const run = action === "publish" ? blogService.publish : blogService.unpublish;
    return apiOk(await runBlog(() => run(id, admin.id, parsed.data.expectedUpdatedAt)));
  }, `admin-blogs-${action}`);
}
