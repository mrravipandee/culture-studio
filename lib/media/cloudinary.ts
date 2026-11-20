import "server-only";

/**
 * Cloudinary integration (signed direct uploads). SERVER-ONLY.
 *
 * Flow:
 *  1. The admin asks POST /api/admin/media/cloudinary-signature for a one-off signature.
 *  2. The browser uploads the file straight to Cloudinary with that signature. The API secret
 *     never leaves the server; the signature fixes the folder, the allowed formats and the
 *     timestamp (Cloudinary rejects it after one hour), so it can't be reused for anything else.
 *  3. On save, verifyCloudinaryImage() checks every Cloudinary image against the configured
 *     cloud, the upload folder and the Cloudinary Admin API (exists, allowed format, size).
 *
 * Configuration (server env, never NEXT_PUBLIC_): CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 * CLOUDINARY_API_SECRET. Without all three, uploads are switched off and only existing site
 * images can be used. Values are never logged.
 */

import { createHash } from "node:crypto";
import { MEDIA_UPLOAD } from "@/lib/case-studies/constants";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

const CLOUD_NAME = /^[a-z0-9_-]{1,64}$/;

/** The configuration, or null when Cloudinary isn't (fully or validly) configured. */
export function cloudinaryConfig(env: NodeJS.ProcessEnv = process.env): CloudinaryConfig | null {
  const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  const apiKey = env.CLOUDINARY_API_KEY?.trim() ?? "";
  const apiSecret = env.CLOUDINARY_API_SECRET?.trim() ?? "";
  if (!cloudName || !apiKey || !apiSecret) return null;
  if (!CLOUD_NAME.test(cloudName) || !/^\d{6,20}$/.test(apiKey) || apiSecret.length < 10) {
    console.error("[cloudinary] CLOUDINARY_* variables are set but malformed; uploads are disabled.");
    return null;
  }
  return { cloudName, apiKey, apiSecret };
}

export const isCloudinaryConfigured = () => cloudinaryConfig() !== null;

/**
 * Cloudinary API request signature: the parameters (except file, cloud_name, resource_type
 * and api_key) sorted by name, joined as `k=v&k=v`, the API secret appended, SHA-1 hex.
 * https://cloudinary.com/documentation/authentication_signatures
 */
export function signParams(params: Record<string, string | number>, apiSecret: string): string {
  const payload = Object.keys(params)
    .filter((k) => !["file", "cloud_name", "resource_type", "api_key"].includes(k) && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(payload + apiSecret).digest("hex");
}

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  uploadUrl: string;
  /** Exactly the parameters that were signed; the browser must send them unchanged. */
  params: { folder: string; timestamp: number; allowed_formats: string };
  signature: string;
  maxBytes: number;
}

export function createUploadSignature(config: CloudinaryConfig, now = Date.now()): UploadSignature {
  const params = { folder: MEDIA_UPLOAD.folder, timestamp: Math.floor(now / 1000), allowed_formats: MEDIA_UPLOAD.formats.join(",") };
  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey, // public by design in Cloudinary signed uploads; the secret is not
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    params,
    signature: signParams(params, config.apiSecret),
    maxBytes: MEDIA_UPLOAD.maxBytes,
  };
}

/**
 * Public id from a delivery URL of this cloud and folder, or null if the URL belongs to
 * another cloud / folder or carries transformations.
 * e.g. https://res.cloudinary.com/demo/image/upload/v123/culture-studio/case-studies/abc.jpg
 *      → "culture-studio/case-studies/abc"
 */
export function publicIdFromUrl(url: string, cloudName: string): string | null {
  const prefix = `https://res.cloudinary.com/${cloudName}/image/upload/`;
  if (!url.startsWith(prefix)) return null;
  const rest = url.slice(prefix.length).replace(/^v\d+\//, "");
  const match = rest.match(/^((?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+)\.(jpe?g|png|webp)$/);
  if (!match || !match[1].startsWith(`${MEDIA_UPLOAD.folder}/`)) return null;
  return match[1];
}

export type ImageCheck = { ok: true } | { ok: false; message: string; unavailable?: boolean };

/**
 * Verifies an uploaded image before it is saved: same cloud and folder, public id matches the
 * URL (when given), and Cloudinary confirms it exists with an allowed format and size.
 */
export async function verifyCloudinaryImage(url: string, publicId: string | undefined, config: CloudinaryConfig | null = cloudinaryConfig()): Promise<ImageCheck> {
  if (!config) return { ok: false, message: "Image uploads aren't configured on the server. Use an existing site image." };
  const fromUrl = publicIdFromUrl(url, config.cloudName);
  if (!fromUrl) return { ok: false, message: "This image isn't from the site's Cloudinary upload folder. Upload it again." };
  // Social images store only a URL; covers and gallery images also carry the public id.
  if (publicId !== undefined && publicId !== fromUrl) return { ok: false, message: "The image details don't match. Upload it again." };

  let response: Response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/resources/image/upload/${fromUrl.split("/").map(encodeURIComponent).join("/")}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64")}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    console.error("[cloudinary] Verification request failed (network or timeout).");
    return { ok: false, message: "Couldn't reach Cloudinary to check the image. Please try again.", unavailable: true };
  }
  if (response.status === 404) return { ok: false, message: "This image no longer exists on Cloudinary. Upload it again." };
  if (!response.ok) {
    console.error(`[cloudinary] Verification returned HTTP ${response.status}.`);
    return { ok: false, message: "Couldn't check the image with Cloudinary. Please try again.", unavailable: true };
  }
  const info = (await response.json().catch(() => null)) as { format?: unknown; bytes?: unknown } | null;
  if (!info || typeof info.format !== "string" || typeof info.bytes !== "number") return { ok: false, message: "Couldn't read the image details from Cloudinary.", unavailable: true };
  if (!(MEDIA_UPLOAD.formats as readonly string[]).includes(info.format)) return { ok: false, message: "Use a JPG, PNG or WebP image." };
  if (info.bytes > MEDIA_UPLOAD.maxBytes) return { ok: false, message: `The image is larger than ${MEDIA_UPLOAD.maxBytes / 1024 / 1024} MB.` };
  return { ok: true };
}
