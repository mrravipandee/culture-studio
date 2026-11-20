import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { BLOG_BODY_MAX } from "@/lib/blog/constants";
import { assertBlogImagesUsable, assertBlogWriteAllowed, blogService, runBlog } from "@/lib/blog/server";
import { blogCreateSchema } from "@/lib/blog/validation";
import { ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";

/** GET /api/admin/blogs — every non-deleted article (no bodies), most recently updated first. */
export const GET = apiHandler(async () => {
  await requireAdminApi();
  return apiOk(await blogService.list());
}, "admin-blogs");

/**
 * POST /api/admin/blogs — create a DRAFT (status is never accepted). Body is sanitised.
 * 201 article · 409 SLUG_TAKEN (fields.slugSuggestion) · 422 invalid fields · 429 · 503.
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await readJsonMutation(request, BLOG_BODY_MAX);
  const { admin } = await requireAdminApi();
  const parsed = parseWith(blogCreateSchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields);
  await assertBlogWriteAllowed(admin.id);
  await assertBlogImagesUsable(parsed.data);
  return apiOk(await runBlog(() => blogService.create(parsed.data, admin.id)), { status: 201 });
}, "admin-blogs");
