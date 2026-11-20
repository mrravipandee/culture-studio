"use client";

import { CLOUDINARY_IMAGE_PATTERN, MEDIA_UPLOAD } from "@/lib/case-studies/constants";
import { validateImageFile } from "@/lib/admin/case-study-utils";
import { adminRequest } from "../settings/settings-api";

/**
 * Uploads one image to Cloudinary from the browser with a server-issued signature
 * (POST /api/admin/media/cloudinary-signature). The API secret never reaches the browser.
 * Resolves with the delivery URL and public id to store, or a friendly error. Never throws,
 * except AbortError when `signal` is aborted.
 */

interface SignatureResponse {
  cloudName: string;
  apiKey: string;
  uploadUrl: string;
  params: { folder: string; timestamp: number; allowed_formats: string };
  signature: string;
  maxBytes: number;
}

export type UploadResult = { ok: true; url: string; publicId: string } | { ok: false; message: string };

export async function uploadImageToCloudinary(file: File, options: { signal?: AbortSignal; onProgress?: (fraction: number) => void } = {}): Promise<UploadResult> {
  const problem = validateImageFile(file, MEDIA_UPLOAD.maxBytes);
  if (problem) return { ok: false, message: problem };

  const signed = await adminRequest<SignatureResponse>("/api/admin/media/cloudinary-signature", { method: "POST", body: {}, signal: options.signal });
  if (!signed.ok) return { ok: false, message: signed.error.message };
  const s = signed.data;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", s.apiKey);
  form.append("timestamp", String(s.params.timestamp));
  form.append("folder", s.params.folder);
  form.append("allowed_formats", s.params.allowed_formats);
  form.append("signature", s.signature);

  // XMLHttpRequest (not fetch) for upload progress.
  const response = await new Promise<{ status: number; body: unknown } | null>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", s.uploadUrl);
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) options.onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => resolve({ status: xhr.status, body: xhr.response as unknown });
    xhr.onerror = () => resolve(null);
    xhr.ontimeout = () => resolve(null);
    xhr.timeout = 120_000;
    options.signal?.addEventListener("abort", () => {
      xhr.abort();
      reject(new DOMException("Upload cancelled.", "AbortError"));
    });
    xhr.send(form);
  });

  if (!response) return { ok: false, message: "Couldn't reach Cloudinary. Check your connection and try again." };
  const body = response.body as { secure_url?: unknown; public_id?: unknown; error?: { message?: unknown } } | null;
  if (response.status < 200 || response.status >= 300 || !body) {
    const reason = typeof body?.error?.message === "string" && /format/i.test(body.error.message) ? "Use a JPG, PNG or WebP image." : "The upload failed. Please try again.";
    return { ok: false, message: reason };
  }
  const url = typeof body.secure_url === "string" ? body.secure_url : "";
  const publicId = typeof body.public_id === "string" ? body.public_id : "";
  if (!CLOUDINARY_IMAGE_PATTERN.test(url) || !publicId.startsWith(`${MEDIA_UPLOAD.folder}/`)) {
    return { ok: false, message: "Cloudinary returned an unexpected image address. Please try again." };
  }
  return { ok: true, url, publicId };
}
