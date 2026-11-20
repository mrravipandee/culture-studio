import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { BLOG_BODY_MAX } from "@/lib/blog/constants";
import { blogIdFrom, type BlogIdContext } from "@/lib/blog/routes";
import { assertBlogImagesUsable, assertBlogWriteAllowed, blogService, runBlog } from "@/lib/blog/server";
import { blogUpdateSchema } from "@/lib/blog/validation";
import { ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, assertSameOrigin, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";

/** GET /api/admin/blogs/[id] — full article (with body). 400 invalid id · 404 missing/deleted. */
export const GET = apiHandler<BlogIdContext>(async (_request: NextRequest, ctx) => {
  await requireAdminApi();
  const id = await blogIdFrom(ctx);
  return apiOk(await runBlog(() => blogService.get(id)));
}, "admin-blogs");

/**
 * PATCH /api/admin/blogs/[id] — { expectedUpdatedAt, changes } (changed fields only; strict).
 * A published article must stay publishable. A once-public slug change keeps a redirect.
 * 409 STALE_RECORD / SLUG_TAKEN · 422 invalid / publishing rules · 404.
 */
export const PATCH = apiHandler<BlogIdContext>(async (request: NextRequest, ctx) => {
  const body = await readJsonMutation(request, BLOG_BODY_MAX);
  const { admin } = await requireAdminApi();
  const id = await blogIdFrom(ctx);
  const parsed = parseWith(blogUpdateSchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields);
  await assertBlogWriteAllowed(admin.id);
  await assertBlogImagesUsable(parsed.data.changes);
  return apiOk(await runBlog(() => blogService.update(id, parsed.data.expectedUpdatedAt, parsed.data.changes, admin.id)));
}, "admin-blogs");

/** DELETE /api/admin/blogs/[id] — soft delete (off the site and the admin list; kept in the database). */
export const DELETE = apiHandler<BlogIdContext>(async (request: NextRequest, ctx) => {
  assertSameOrigin(request);
  const { admin } = await requireAdminApi();
  const id = await blogIdFrom(ctx);
  await assertBlogWriteAllowed(admin.id);
  await runBlog(() => blogService.remove(id, admin.id));
  return apiOk({ deleted: true, id });
}, "admin-blogs");
