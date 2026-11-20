"use client";

import type { AdminCaseStudy, CaseStudyListResult } from "@/lib/admin/types";
import type { CaseStudyAction } from "@/lib/case-studies/constants";
import { diffChanges, toContentInput, type CaseStudyFormValues } from "@/lib/admin/case-study-utils";
import { adminRequest, type ApiResult } from "../settings/settings-api";
import type { CaseStudyFilters } from "./CaseStudyToolbar";

/** Typed calls to /api/admin/case-studies (same-origin; the session cookie is sent automatically). */

const BASE = "/api/admin/case-studies";
const item = (id: string) => `${BASE}/${encodeURIComponent(id)}`;

export function listUrl(filters: CaseStudyFilters, search: string, page: number, pageSize: number) {
  const p = new URLSearchParams({ page: String(page), pageSize: String(pageSize), sort: filters.sort });
  if (search) p.set("search", search);
  if (filters.status !== "all") p.set("status", filters.status);
  if (filters.category !== "all") p.set("category", filters.category);
  if (filters.featured !== "all") p.set("featured", filters.featured);
  return `${BASE}?${p}`;
}

export const fetchList = (url: string, signal: AbortSignal) => adminRequest<CaseStudyListResult>(url, { signal });
export const fetchOne = (id: string) => adminRequest<AdminCaseStudy>(item(id));

export function createCaseStudy(values: CaseStudyFormValues) {
  const body: Partial<ReturnType<typeof toContentInput>> = toContentInput(values);
  if (!values.slug.trim()) delete body.slug; // generated from the title on the server
  return adminRequest<AdminCaseStudy>(BASE, { method: "POST", body });
}

/** Sends only the changed fields. Resolves with the unchanged record when nothing changed. */
export async function updateCaseStudy(record: AdminCaseStudy, initial: CaseStudyFormValues, values: CaseStudyFormValues): Promise<ApiResult<AdminCaseStudy>> {
  const changes = diffChanges(initial, values);
  if (Object.keys(changes).length === 0) return { ok: true, data: record };
  return adminRequest<AdminCaseStudy>(item(record.id), { method: "PATCH", body: { expectedUpdatedAt: record.updatedAt, changes } });
}

export const runAction = (record: AdminCaseStudy, action: CaseStudyAction, slug?: string) =>
  adminRequest<AdminCaseStudy>(`${item(record.id)}/${action}`, { method: "POST", body: { expectedUpdatedAt: record.updatedAt, ...(slug ? { slug } : {}) } });

export const deleteCaseStudy = (record: AdminCaseStudy) => adminRequest<{ id: string; deleted: true }>(item(record.id), { method: "DELETE" });
