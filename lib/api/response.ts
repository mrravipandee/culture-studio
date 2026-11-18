/**
 * Shared API response envelope. Client-safe (types + a runtime guard only).
 *
 * Every JSON API route returns:
 *   { success: true,  data: T }
 *   { success: false, error: { code, message, fields? } }
 * `message` is always safe to show to a user; it never contains driver errors or stacks.
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_JSON"
  | "INVALID_QUERY"
  | "INVALID_ID"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "PAYLOAD_TOO_LARGE"
  | "UNAUTHENTICATED"
  | "INVALID_CREDENTIALS"
  | "INVALID_CURRENT_PASSWORD"
  | "PASSWORD_REQUIRED"
  | "PASSWORD_REUSED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "ADMIN_NOT_FOUND"
  | "CONFLICT"
  | "EMAIL_IN_USE"
  | "RATE_LIMITED"
  | "DATABASE_UNAVAILABLE"
  | "NOT_CONFIGURED"
  | "SERVER_ERROR";

export interface ApiErrorBody {
  code: ApiErrorCode | (string & {});
  message: string;
  fields?: Record<string, string>;
}

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: ApiErrorBody };

/** Runtime check for responses read in the browser. */
export function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (typeof value !== "object" || value === null || !("success" in value)) return false;
  const v = value as { success: unknown; error?: unknown };
  if (v.success === true) return "data" in v;
  return v.success === false && typeof v.error === "object" && v.error !== null && typeof (v.error as { message?: unknown }).message === "string";
}
