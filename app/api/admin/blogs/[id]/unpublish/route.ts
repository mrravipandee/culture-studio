import { blogStatusRoute } from "@/lib/blog/routes";

/** POST /api/admin/blogs/[id]/unpublish — PUBLISHED → DRAFT (removed from the site immediately). */
export const POST = blogStatusRoute("unpublish");
