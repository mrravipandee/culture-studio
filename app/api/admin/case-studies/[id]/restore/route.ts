import { statusActionRoute } from "@/lib/case-studies/routes";

/**
 * POST /api/admin/case-studies/[id]/restore — see lib/case-studies/constants.ts (CASE_STUDY_TRANSITIONS).
 * Body: {} or { expectedUpdatedAt } (restore also accepts { slug } when the old slug was taken).
 * 200 updated record · 400 invalid id · 401 · 403 cross-site · 404 missing · 409 invalid
 * transition, stale record or slug taken · 429 rate limited.
 */
export const POST = statusActionRoute("restore");
