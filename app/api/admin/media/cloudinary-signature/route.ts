import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { RATE_LIMITS, rateLimitKeys, rateLimitRetryAfter, recordRateLimitFailure } from "@/lib/auth/rate-limit";
import { cloudinaryConfig, createUploadSignature } from "@/lib/media/cloudinary";
import { ConfigurationError, RateLimitError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";

/**
 * POST /api/admin/media/cloudinary-signature — body {}.
 * Returns a one-off signed upload request for the case study image folder (signed: folder,
 * allowed formats, timestamp; valid for one hour). The API secret never leaves the server.
 * 200 { cloudName, apiKey, uploadUrl, params, signature, maxBytes } · 401 · 403 cross-site ·
 * 429 rate limited · 500 NOT_CONFIGURED when the CLOUDINARY_* variables are missing.
 */
export const POST = apiHandler(async (request: NextRequest) => {
  await readJsonMutation(request, 256);
  const { admin } = await requireAdminApi();
  const config = cloudinaryConfig();
  if (!config) throw new ConfigurationError("Image uploads aren't configured on the server.");

  const key = rateLimitKeys.mediaSignature(admin.id);
  const wait = await rateLimitRetryAfter(key, RATE_LIMITS.mediaSignature);
  if (wait > 0) throw new RateLimitError(wait, "Too many uploads in a short time. Please wait a moment.");
  await recordRateLimitFailure(key, RATE_LIMITS.mediaSignature);

  return apiOk(createUploadSignature(config));
}, "admin-media");
