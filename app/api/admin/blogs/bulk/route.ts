import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { assertBlogWriteAllowed, blogService, runBlog } from "@/lib/blog/server";
import { blogBulkSchema } from "@/lib/blog/validation";
import { ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";

/** POST /api/admin/blogs/bulk — { action: "delete", ids ≤ 100 } (soft delete). Returns the ids deleted. */
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await readJsonMutation(request, 8 * 1024);
  const { admin } = await requireAdminApi();
  const parsed = parseWith(blogBulkSchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields);
  await assertBlogWriteAllowed(admin.id);
  const deleted = await runBlog(() => blogService.removeMany(parsed.data.ids, admin.id));
  return apiOk({ action: "delete", changed: deleted });
}, "admin-blogs");
