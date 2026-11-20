import { statusActionRoute } from "@/lib/case-studies/routes";

/**
 * POST /api/admin/case-studies/[id]/unpublish — see lib/case-studies/constants.ts (CASE_STUDY_TRANSITIONS).
 * Body: {} or { expectedUpdatedAt }.
 * 200 updated record · 400 invalid id · 401 · 403 cross-site · 404 missing/deleted · 409 invalid
 * transition, stale record or slug taken · 429 rate limited.
 */
export const POST = statusActionRoute("unpublish");
