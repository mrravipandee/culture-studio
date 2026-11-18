import "server-only";

/**
 * HTTP helpers for Route Handlers. SERVER-ONLY.
 *
 *   export const PATCH = apiHandler(async (request) => { ...; return apiOk(data); });
 *
 * - apiOk / apiError build the shared ApiResponse envelope (lib/api/response.ts).
 * - apiHandler catches AppError subclasses and maps them to status + envelope; anything
 *   else becomes a generic 500. Driver messages and stacks never reach the client.
 * - readJsonMutation enforces same-origin (CSRF), JSON content type, a size cap and valid JSON.
 * Responses are never cached and never indexed.
 */

import { NextResponse, type NextRequest } from "next/server";
import type { ApiErrorBody, ApiErrorCode, ApiResponse } from "@/lib/api/response";
import { AppError, BadRequestError, ForbiddenError } from "./errors";

export const NO_STORE_HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } as const;

export function apiOk<T>(data: T, init: { status?: number; headers?: Record<string, string> } = {}) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status: init.status ?? 200, headers: { ...NO_STORE_HEADERS, ...init.headers } });
}

export function apiError(status: number, code: ApiErrorCode, message: string, fields?: Record<string, string>, headers: Record<string, string> = {}) {
  const error: ApiErrorBody = fields && Object.keys(fields).length ? { code, message, fields } : { code, message };
  return NextResponse.json<ApiResponse<never>>({ success: false, error }, { status, headers: { ...NO_STORE_HEADERS, ...headers } });
}

/** Maps any thrown value to a safe response. Unknown errors are logged by name only. */
export function errorResponse(error: unknown, context = "api") {
  if (error instanceof AppError) return apiError(error.status, error.code, error.message, error.fields, error.headers);
  if (error instanceof Error && error.name === "AuthConfigError") {
    // Names the misconfigured variable in server logs only (never its value, never to the client).
    console.error(`[${context}] Configuration error: ${error.message}`);
    return apiError(500, "NOT_CONFIGURED", "This feature is not configured on the server.");
  }
  console.error(`[${context}] Unexpected ${error instanceof Error ? error.name : "error"}.`);
  return apiError(500, "SERVER_ERROR", "Something went wrong. Please try again.");
}

type Handler<C> = (request: NextRequest, context: C) => Promise<Response>;

/** Wraps a Route Handler so every thrown AppError becomes a proper envelope. */
export function apiHandler<C = unknown>(handler: Handler<C>, context = "api"): Handler<C> {
  return async (request, ctx) => {
    try {
      return await handler(request, ctx);
    } catch (error) {
      return errorResponse(error, context);
    }
  };
}

/**
 * CSRF guard for state-changing requests: the browser-supplied Origin must be this site
 * (and Sec-Fetch-Site, when present, must be same-origin). The session cookie is also
 * SameSite=Lax, and mutations require a JSON body, which a cross-site HTML form can't send.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  return origin === request.nextUrl.origin;
}

export function assertSameOrigin(request: NextRequest) {
  if (!isSameOrigin(request)) throw new ForbiddenError();
}

/** Query string as a plain object; repeated keys are rejected (no array smuggling). */
export function searchParamsObject(request: NextRequest): Record<string, string> {
  const params = request.nextUrl.searchParams;
  const out: Record<string, string> = {};
  for (const [key, value] of params) {
    if (key in out) throw new BadRequestError("INVALID_QUERY", "The request parameters are invalid.", { [key]: "Repeated parameter." });
    out[key] = value;
  }
  return out;
}

/** Same-origin JSON body, at most `maxBytes`. Returns the parsed (still untrusted) value. */
export async function readJsonMutation(request: NextRequest, maxBytes = 4096): Promise<unknown> {
  assertSameOrigin(request);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new BadRequestError("UNSUPPORTED_MEDIA_TYPE", "Send the request as JSON.", undefined, 415);
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > maxBytes) throw new BadRequestError("PAYLOAD_TOO_LARGE", "The request is too large.", undefined, 413);
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new BadRequestError("INVALID_JSON", "The request could not be read.");
  }
}
