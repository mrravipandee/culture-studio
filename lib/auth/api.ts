/**
 * Helpers for the admin Settings Route Handlers. SERVER-ONLY.
 *
 * Every response uses the ApiResponse envelope from lib/admin/settings-schemas.ts and is
 * never cached. Error bodies carry a code and a human message only, never driver errors,
 * stack traces or secrets.
 */

import { NextResponse, type NextRequest } from "next/server";
import type { ApiErrorBody, ApiResponse } from "@/lib/admin/settings-schemas";
import { isSameOrigin } from "./request";

const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status, headers: HEADERS });
}

export function apiError(status: number, code: string, message: string, fields?: Record<string, string>, extraHeaders: Record<string, string> = {}) {
  const error: ApiErrorBody = fields ? { code, message, fields } : { code, message };
  return NextResponse.json<ApiResponse<never>>({ success: false, error }, { status, headers: { ...HEADERS, ...extraHeaders } });
}

const MAX_BODY_BYTES = 4096;

/**
 * Guards for a JSON mutation: same-origin (CSRF), JSON content type, bounded size, valid JSON.
 * Returns the parsed body or an error response.
 */
export async function readJsonMutation(request: NextRequest): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  if (!isSameOrigin(request)) return { ok: false, response: apiError(403, "FORBIDDEN", "This request was blocked.") };
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return { ok: false, response: apiError(415, "UNSUPPORTED_MEDIA_TYPE", "Send the request as JSON.") };
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return { ok: false, response: apiError(413, "TOO_LARGE", "The request is too large.") };
  try {
    return { ok: true, body: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, response: apiError(400, "INVALID_JSON", "The request could not be read.") };
  }
}
