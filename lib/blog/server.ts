import "server-only";

/**
 * Blog — production wiring and HTTP glue. SERVER-ONLY.
 *  - blogService: MongoDB + audit log + immediate cache invalidation of public blog pages.
 *  - runBlog: maps service errors to the shared API error envelope.
 *  - assertBlogImagesUsable: server-side check of every uploaded (Cloudinary) image in a body
 *    or cover before it is saved (same cloud, blog folder, exists, format, size).
 *  - assertBlogWriteAllowed: per-admin rate limit.
 */

import { revalidateTag } from "next/cache";
import { recordAudit } from "@/lib/audit/log";
import { RATE_LIMITS, rateLimitKeys, rateLimitRetryAfter, recordRateLimitFailure } from "@/lib/auth/rate-limit";
import { isCloudinaryUrl } from "@/lib/case-studies/constants";
import { cloudinaryConfig, verifyCloudinaryImage } from "@/lib/media/cloudinary";
import { AppError, ConflictError, NotFoundError, RateLimitError, ServiceUnavailableError, ValidationError } from "@/lib/server/errors";
import { sanitizeRichDoc } from "./content";
import { BLOG_CACHE_TAG } from "./constants";
import { mongoBlogRepository } from "./repository";
import type { BlogContent } from "./rules";
import { BlogError, createBlogService } from "./service";

export const blogService = createBlogService({
  repo: mongoBlogRepository,
  audit: (e) => recordAudit({ ...e, action: `blog.${e.action}`, entityType: "BlogPost" }),
  revalidatePublic: () => revalidateTag(BLOG_CACHE_TAG, { expire: 0 }),
});

function toAppError(error: unknown): unknown {
  if (!(error instanceof BlogError)) return error;
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

export async function runBlog<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    const mapped = toAppError(error);
    if (mapped instanceof AppError) throw mapped;
    throw error;
  }
}

/** Verifies uploaded images in the given (partial) content. Site images need no network check. */
export async function assertBlogImagesUsable(content: Partial<Pick<BlogContent, "content" | "coverImage">>) {
  const refs: { field: string; url: string; publicId?: string }[] = [];
  if (content.coverImage && isCloudinaryUrl(content.coverImage.url)) refs.push({ field: "coverImage", url: content.coverImage.url, publicId: content.coverImage.publicId ?? "" });
  if (content.content) {
    for (const src of new Set(sanitizeRichDoc(content.content).images)) if (isCloudinaryUrl(src)) refs.push({ field: "content", url: src });
  }
  if (!refs.length) return;
  const config = cloudinaryConfig();
  const results = await Promise.all(refs.map((r) => verifyCloudinaryImage(r.url, r.publicId, config, "blog")));
  if (results.some((r) => !r.ok && r.unavailable)) throw new ServiceUnavailableError("Couldn't check the uploaded images with Cloudinary. Please try again.");
  const fields: Record<string, string> = {};
  results.forEach((r, i) => {
    if (!r.ok && !fields[refs[i].field]) fields[refs[i].field] = refs[i].field === "content" ? `An image in the article can't be used: ${r.message}` : r.message;
  });
  if (Object.keys(fields).length) throw new ValidationError(fields, "Some images can't be used. Check the highlighted fields.");
}

export async function assertBlogWriteAllowed(adminId: string) {
  const key = rateLimitKeys.blogWrite(adminId);
  const wait = await rateLimitRetryAfter(key, RATE_LIMITS.blogWrite);
  if (wait > 0) throw new RateLimitError(wait, "Too many changes in a short time. Please wait a moment and try again.");
  await recordRateLimitFailure(key, RATE_LIMITS.blogWrite);
}
