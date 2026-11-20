"use client";

import type { BlogPost, BlogSummary } from "@/lib/admin/types";
import { diffBlogChanges, toBlogInput, type BlogFormValues } from "@/lib/admin/blog-utils";
import { adminRequest, type ApiResult } from "../settings/settings-api";

/** Typed calls to /api/admin/blogs (same-origin; session cookie sent automatically). */

const BASE = "/api/admin/blogs";
const one = (id: string) => `${BASE}/${encodeURIComponent(id)}`;

export const fetchBlogList = (signal?: AbortSignal) => adminRequest<{ items: BlogSummary[]; truncated: boolean }>(BASE, { signal });
export const fetchBlog = (id: string, signal?: AbortSignal) => adminRequest<BlogPost>(one(id), { signal });
export const createBlog = (values: BlogFormValues) => adminRequest<BlogPost>(BASE, { method: "POST", body: toBlogInput(values) });

/** Saves only the changed fields. Resolves with `post` unchanged when nothing changed. */
export async function updateBlog(post: BlogPost, baseline: BlogFormValues, values: BlogFormValues): Promise<ApiResult<BlogPost>> {
  const changes = diffBlogChanges(baseline, values);
  if (Object.keys(changes).length === 0) return { ok: true, data: post };
  return adminRequest<BlogPost>(one(post.id), { method: "PATCH", body: { expectedUpdatedAt: post.updatedAt, changes } });
}

export const publishBlog = (id: string, expectedUpdatedAt?: string) => adminRequest<BlogPost>(`${one(id)}/publish`, { method: "POST", body: expectedUpdatedAt ? { expectedUpdatedAt } : {} });
export const unpublishBlog = (id: string, expectedUpdatedAt?: string) => adminRequest<BlogPost>(`${one(id)}/unpublish`, { method: "POST", body: expectedUpdatedAt ? { expectedUpdatedAt } : {} });
export const deleteBlog = (id: string) => adminRequest<{ deleted: true }>(one(id), { method: "DELETE" });
export const deleteBlogs = (ids: string[]) => adminRequest<{ changed: string[] }>(`${BASE}/bulk`, { method: "POST", body: { action: "delete", ids } });

/** API field keys → editor field names (e.g. coverImage.alt → coverImageAlt). */
export function toFormErrors(fields: Record<string, string> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, message] of Object.entries(fields ?? {})) {
    const k =
      key === "coverImage.alt" || key === "coverImageAlt"
        ? "coverImageAlt"
        : key.startsWith("coverImage")
          ? "coverImage"
          : key === "displayDate"
            ? "publishDate"
            : key === "seo.title" || key === "seo"
              ? "seoTitle"
              : key === "seo.description"
                ? "seoDescription"
                : key.split(".")[0];
    if (k !== "slugSuggestion" && !out[k]) out[k] = message;
  }
  return out;
}
