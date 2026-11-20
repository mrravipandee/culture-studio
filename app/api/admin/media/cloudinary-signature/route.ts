import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { RATE_LIMITS, rateLimitKeys, rateLimitRetryAfter, recordRateLimitFailure } from "@/lib/auth/rate-limit";
import { cloudinaryConfig, createUploadSignature } from "@/lib/media/cloudinary";
import { MEDIA_PURPOSES, type MediaPurpose } from "@/lib/case-studies/constants";
import { ConfigurationError, RateLimitError, ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { z } from "zod";

/** `purpose` picks the upload folder; omitted = case studies (the original behaviour). */
const bodySchema = z.strictObject({ purpose: z.enum(MEDIA_PURPOSES as [string, ...string[]]).optional() });

/**
 * POST /api/admin/media/cloudinary-signature — body {} or { purpose: "case-study" | "blog" }.
 * Returns a one-off signed upload request for that feature's image folder (signed: folder,
 * allowed formats, timestamp; valid for one hour). The API secret never leaves the server.
 * 200 { cloudName, apiKey, uploadUrl, params, signature, maxBytes } · 401 · 403 cross-site ·
 * 429 rate limited · 500 NOT_CONFIGURED when the CLOUDINARY_* variables are missing.
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await readJsonMutation(request, 256);
  const { admin } = await requireAdminApi();
  const parsed = parseWith(bodySchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields);
  const purpose = (parsed.data.purpose ?? "case-study") as MediaPurpose;
  const config = cloudinaryConfig();
  if (!config) throw new ConfigurationError("Image uploads aren't configured on the server.");

  const key = rateLimitKeys.mediaSignature(admin.id);
  const wait = await rateLimitRetryAfter(key, RATE_LIMITS.mediaSignature);
  if (wait > 0) throw new RateLimitError(wait, "Too many uploads in a short time. Please wait a moment.");
  await recordRateLimitFailure(key, RATE_LIMITS.mediaSignature);

  return apiOk(createUploadSignature(config, Date.now(), purpose));
}, "admin-media");
