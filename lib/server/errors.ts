import "server-only";

/**
 * Typed application errors. SERVER-ONLY.
 *
 * Throw these from services/repositories; lib/server/http.ts maps them to the shared
 * ApiResponse envelope and an HTTP status. `message` must always be safe to show a user:
 * never put driver errors, queries, stack traces or secrets in it.
 */

import type { ApiErrorCode } from "@/lib/api/response";

export abstract class AppError extends Error {
  abstract readonly status: number;
  readonly code: ApiErrorCode;
  readonly fields?: Record<string, string>;
  readonly headers?: Record<string, string>;

  constructor(code: ApiErrorCode, message: string, options: { fields?: Record<string, string>; headers?: Record<string, string> } = {}) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.fields = options.fields;
    this.headers = options.headers;
  }
}

/** 400 — the request itself is malformed (bad JSON, wrong content type, bad query). */
export class BadRequestError extends AppError {
  readonly status: number;
  constructor(code: ApiErrorCode = "VALIDATION_ERROR", message = "The request could not be read.", fields?: Record<string, string>, status = 400) {
    super(code, message, { fields });
    this.status = status;
  }
}

/** 422 — well-formed request with invalid values. */
export class ValidationError extends AppError {
  readonly status = 422;
  constructor(fields: Record<string, string>, message = "Please check the highlighted fields.", code: ApiErrorCode = "VALIDATION_ERROR") {
    super(code, message, { fields });
  }
}

/** 401 — not signed in, or the session ended / was revoked. */
export class UnauthorizedError extends AppError {
  readonly status = 401;
  constructor(message = "Your session has ended. Please sign in again.", code: ApiErrorCode = "UNAUTHENTICATED") {
    super(code, message);
  }
}

/** 403 — signed in (or not) but not allowed: cross-site request, missing permission. */
export class ForbiddenError extends AppError {
  readonly status = 403;
  constructor(message = "This request was blocked.") {
    super("FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  readonly status = 404;
  constructor(message = "Not found.", code: ApiErrorCode = "NOT_FOUND") {
    super(code, message);
  }
}

/** 409 — duplicate value or a concurrent change. */
export class ConflictError extends AppError {
  readonly status = 409;
  constructor(message: string, code: ApiErrorCode = "CONFLICT", fields?: Record<string, string>) {
    super(code, message, { fields });
  }
}

export class RateLimitError extends AppError {
  readonly status = 429;
  readonly retryAfterSeconds: number;
  constructor(retryAfterSeconds: number, message = "Too many attempts. Please wait and try again.") {
    super("RATE_LIMITED", message, { headers: { "Retry-After": String(Math.max(1, Math.ceil(retryAfterSeconds))) } });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** 503 — MongoDB unreachable or a query failed. The cause is never exposed. */
export class DatabaseUnavailableError extends AppError {
  readonly status = 503;
  constructor(message = "The database is unavailable right now. Please try again shortly.") {
    super("DATABASE_UNAVAILABLE", message);
  }
}

/** 503 — an external service (e.g. Cloudinary) couldn't be reached. The cause is never exposed. */
export class ServiceUnavailableError extends AppError {
  readonly status = 503;
  constructor(message = "A required service is unavailable right now. Please try again shortly.") {
    super("SERVICE_UNAVAILABLE", message);
  }
}

/** 500 — the server is missing required configuration (names the problem in logs only). */
export class ConfigurationError extends AppError {
  readonly status = 500;
  constructor(message = "This feature is not configured on the server.") {
    super("NOT_CONFIGURED", message);
  }
}

/** Duplicate-key error from MongoDB (E11000). */
export const isDuplicateKeyError = (error: unknown) => typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === 11000;
