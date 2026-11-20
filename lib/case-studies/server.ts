import "server-only";

/**
 * Case Studies — production wiring and HTTP glue. SERVER-ONLY.
 *
 * - `caseStudyService`: the service with MongoDB, the audit log and Next.js cache
 *   invalidation. Public pages read through `'use cache'` functions tagged
 *   CASE_STUDIES_CACHE_TAG (./public.ts); any change that affects what the public sees
 *   expires that tag immediately ({ expire: 0 }), so an unpublished page is never served
 *   from cache again.
 * - `toAppError`: maps service errors to the shared API error envelope.
 * - `assertMutationAllowed`: per-admin rate limit for case study writes.
 * - `assertImagesUsable`: server-side check of uploaded (Cloudinary) images before saving.
 */

import { revalidateTag } from "next/cache";
import { recordAudit } from "@/lib/audit/log";
import { RATE_LIMITS, rateLimitKeys, rateLimitRetryAfter, recordRateLimitFailure } from "@/lib/auth/rate-limit";
import { AppError, ConflictError, NotFoundError, RateLimitError, ServiceUnavailableError, ValidationError } from "@/lib/server/errors";
import { cloudinaryConfig, verifyCloudinaryImage } from "@/lib/media/cloudinary";
import { CASE_STUDIES_CACHE_TAG, isCloudinaryUrl } from "./constants";
import type { CaseStudyContent } from "./types";
import { mongoCaseStudyRepository } from "./repository";
import { CaseStudyError, createCaseStudyService } from "./service";

export const caseStudyService = createCaseStudyService({
  repo: mongoCaseStudyRepository,
  audit: (event) => recordAudit({ ...event, action: `case_study.${event.action}`, entityType: "CaseStudy" }),
  revalidatePublic: () => revalidateTag(CASE_STUDIES_CACHE_TAG, { expire: 0 }),
});

export function toAppError(error: unknown): unknown {
  if (!(error instanceof CaseStudyError)) return error;
  switch (error.kind) {
    case "NOT_FOUND":
      return new NotFoundError(error.message);
    case "STALE_RECORD":
      return new ConflictError(error.message, "STALE_RECORD");
    case "SLUG_TAKEN":
      return new ConflictError(error.message, "SLUG_TAKEN", { ...error.fields, ...(error.suggestion ? { slugSuggestion: error.suggestion } : {}) });
    case "INVALID_TRANSITION":
      return new ConflictError(error.message, "INVALID_TRANSITION");
    case "PUBLISH_VALIDATION":
      return new ValidationError(error.fields ?? {}, error.message, "PUBLISH_VALIDATION");
  }
}

/** Runs a service call and rethrows its domain errors as AppErrors (for apiHandler). */
export async function run<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    const mapped = toAppError(error);
    if (mapped instanceof AppError) throw mapped;
    throw error;
  }
}

type ImageFields = Partial<Pick<CaseStudyContent, "coverImage" | "gallery" | "seo">>;

/**
 * Verifies every Cloudinary image in a create body or a PATCH `changes` (only the fields
 * present are checked; site images need no network check). Throws ValidationError with
 * field keys matching the form, or ServiceUnavailableError when Cloudinary can't be reached.
 */
export async function assertImagesUsable(content: ImageFields) {
  const refs: { field: string; url: string; publicId?: string; requireId: boolean }[] = [];
  if (content.coverImage?.kind === "IMAGE" && content.coverImage.url) refs.push({ field: "coverImage.url", url: content.coverImage.url, publicId: content.coverImage.publicId, requireId: true });
  content.gallery?.forEach((g, i) => refs.push({ field: `gallery.${i}.url`, url: g.url, publicId: g.publicId, requireId: true }));
  if (content.seo?.ogImage) refs.push({ field: "seo.ogImage", url: content.seo.ogImage, requireId: false });

  const uploaded = refs.filter((r) => isCloudinaryUrl(r.url));
  if (uploaded.length === 0) return;
  const config = cloudinaryConfig();
  const results = await Promise.all(uploaded.map((r) => verifyCloudinaryImage(r.url, r.requireId ? (r.publicId ?? "") : undefined, config)));
  if (results.some((r) => !r.ok && r.unavailable)) throw new ServiceUnavailableError("Couldn't check the uploaded images with Cloudinary. Please try again.");
  const fields: Record<string, string> = {};
  results.forEach((r, i) => {
    if (!r.ok) fields[uploaded[i].field] = r.message;
  });
  if (Object.keys(fields).length) throw new ValidationError(fields, "Some images can't be used. Check the highlighted fields.");
}

/** Every case study write counts toward a generous per-admin window (abuse / runaway-script guard). */
export async function assertMutationAllowed(adminId: string) {
  const key = rateLimitKeys.caseStudyWrite(adminId);
  const wait = await rateLimitRetryAfter(key, RATE_LIMITS.caseStudyWrite);
  if (wait > 0) throw new RateLimitError(wait, "Too many changes in a short time. Please wait a moment and try again.");
  await recordRateLimitFailure(key, RATE_LIMITS.caseStudyWrite);
}
