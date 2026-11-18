"use client";

import { isApiResponse, type ApiErrorBody } from "@/lib/admin/settings-schemas";

/** Same path as SESSION_ENDED_PATH in lib/auth/require-admin.ts (server-only module). */
export const SESSION_ENDED_URL = "/api/admin/session/ended";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: ApiErrorBody };

const NETWORK: ApiErrorBody = { code: "NETWORK_ERROR", message: "Couldn't reach the server. Check your connection and try again." };
const UNEXPECTED: ApiErrorBody = { code: "UNEXPECTED_RESPONSE", message: "Something went wrong. Please try again." };

/**
 * Calls a Settings API route (same origin, cookies included automatically).
 * Never throws: network failures and unreadable responses become friendly errors.
 * A 401 means the session ended (expired or revoked): the browser is sent to sign in again.
 */
export async function settingsRequest<T>(url: string, init: { method?: "GET" | "PATCH"; body?: unknown; signal?: AbortSignal } = {}): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: init.method ?? "GET",
      headers: init.body === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      credentials: "same-origin",
      signal: init.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return { ok: false, status: 0, error: NETWORK };
  }

  if (response.status === 401) {
    window.location.replace(SESSION_ENDED_URL);
    return { ok: false, status: 401, error: { code: "UNAUTHENTICATED", message: "Your session has ended. Redirecting to sign in…" } };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    return { ok: false, status: response.status, error: UNEXPECTED };
  }
  if (!isApiResponse(body)) return { ok: false, status: response.status, error: UNEXPECTED };
  if (body.success) return { ok: true, data: body.data as T };
  return { ok: false, status: response.status, error: body.error };
}

/** Local date + time in the viewer's time zone. */
export const formatDateTime = (iso: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
