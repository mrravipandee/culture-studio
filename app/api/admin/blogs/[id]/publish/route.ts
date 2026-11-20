import { blogStatusRoute } from "@/lib/blog/routes";

/** POST /api/admin/blogs/[id]/publish — DRAFT → PUBLISHED after full publishing validation (422 with field messages otherwise). */
export const POST = blogStatusRoute("publish");
