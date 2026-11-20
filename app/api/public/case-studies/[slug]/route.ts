import type { NextRequest } from "next/server";
import { getCaseStudyPage } from "@/lib/case-studies/public";
import { NotFoundError } from "@/lib/server/errors";
import { apiHandler, apiOk } from "@/lib/server/http";
import { PUBLIC_CACHE_HEADERS } from "../../cache-headers";

type Ctx = { params: Promise<{ slug: string }> };

/**
 * GET /api/public/case-studies/[slug] — one published case study.
 * 200 { project } · 200 { redirect: "<current-slug>" } for an old slug of a published
 * record · 404 for an invalid, unknown, draft, archived or deleted slug (all identical, so
 * nothing about unpublished content is revealed).
 */
export const GET = apiHandler<Ctx>(async (_request: NextRequest, ctx) => {
  const { slug } = await ctx.params;
  const result = await getCaseStudyPage(slug);
  if (result.kind === "found") return apiOk({ project: result.project }, { headers: PUBLIC_CACHE_HEADERS });
  if (result.kind === "redirect") return apiOk({ redirect: result.slug }, { headers: PUBLIC_CACHE_HEADERS });
  throw new NotFoundError("Case study not found.");
}, "public-case-studies");
