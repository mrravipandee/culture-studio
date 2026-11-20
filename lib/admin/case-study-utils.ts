/**
 * Case study helpers for the admin UI. CLIENT-SAFE (pure).
 *
 * The form keeps plain strings (easy to bind to inputs); `toContentInput` turns them into
 * the API body, and validation reuses the server's own schema (lib/case-studies/validation.ts)
 * and publishing rules (lib/case-studies/rules.ts), so the form and the API never disagree.
 */

import type { DisciplineId } from "@/lib/content/disciplines";
import { CASE_STUDY_SLUG_PATTERN, slugifyCaseStudy, type CaseStudyFilterId, type CaseStudyGroupId, type CoverKind } from "@/lib/case-studies/constants";
import { publishIssues } from "@/lib/case-studies/rules";
import type { AdminCaseStudy, CaseStudyContent } from "@/lib/case-studies/types";
import { caseStudyCreateSchema } from "@/lib/case-studies/validation";
import { parseNestedWith } from "@/lib/validation/common";

/* Shared with the Blog admin ---------------------------------------------------------------- */

export const SLUG_PATTERN = CASE_STUDY_SLUG_PATTERN;
export const slugify = slugifyCaseStudy;

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024; // 2 MB (Blog preview picker)

/** Type, extension, size and emptiness check for a picked file. */
export function validateImageFile(file: { type: string; size: number; name: string }, maxBytes: number = IMAGE_MAX_BYTES): string | null {
  const extOk = /\.(png|jpe?g|webp)$/i.test(file.name);
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type) || !extOk) return "Use a PNG, JPG or WebP image.";
  if (file.size > maxBytes) return `Image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${maxBytes / 1024 / 1024} MB.`;
  if (file.size === 0) return "This file is empty.";
  return null;
}

export const formatAdminDate = (iso: string | null | undefined) => {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(t));
};

/* Form values -------------------------------------------------------------------------------- */

export interface CaseStudyFormValues {
  title: string;
  slug: string;
  projectHighlight: string;
  overview: string;
  category: DisciplineId | "";
  group: CaseStudyGroupId;
  filters: CaseStudyFilterId[];
  featured: boolean;
  sortOrder: string;
  services: { name: string; serviceId: string }[];
  scope: { value: string; title: string; description: string }[];
  results: { value: string; label: string }[];
  /** publicId: set only for images uploaded to Cloudinary ("" for site images). */
  cover: { kind: CoverKind; url: string; publicId: string; alt: string; illustrative: boolean; position: string };
  gallery: { url: string; publicId: string; alt: string }[];
  seo: { title: string; description: string; ogImage: string };
}

export type FormErrors = Record<string, string>;

export const emptyCaseStudyForm: CaseStudyFormValues = {
  title: "",
  slug: "",
  projectHighlight: "",
  overview: "",
  category: "",
  group: "selected",
  filters: [],
  featured: false,
  sortOrder: "0",
  services: [],
  scope: [],
  results: [],
  cover: { kind: "NONE", url: "", publicId: "", alt: "", illustrative: false, position: "" },
  gallery: [],
  seo: { title: "", description: "", ogImage: "" },
};

export const toFormValues = (c: AdminCaseStudy): CaseStudyFormValues => ({
  title: c.title,
  slug: c.slug,
  projectHighlight: c.projectHighlight,
  overview: c.overview,
  category: c.category ?? "",
  group: c.group,
  filters: [...c.filters],
  featured: c.featured,
  sortOrder: String(c.sortOrder),
  services: c.services.map((s) => ({ name: s.name, serviceId: s.serviceId ?? "" })),
  scope: c.scope.map((s) => ({ value: s.value ?? "", title: s.title, description: s.description ?? "" })),
  results: c.results.map((r) => ({ ...r })),
  cover: { kind: c.coverImage.kind, url: c.coverImage.url ?? "", publicId: c.coverImage.publicId ?? "", alt: c.coverImage.alt, illustrative: c.coverImage.illustrative, position: c.coverImage.position ?? "" },
  gallery: c.gallery.map((g) => ({ url: g.url, publicId: g.publicId ?? "", alt: g.alt })),
  seo: { title: c.seo.title ?? "", description: c.seo.description ?? "", ogImage: c.seo.ogImage ?? "" },
});

const opt = (v: string) => (v.trim() ? v : undefined);

/** API body shape (create). Empty optional strings are omitted; the server re-validates. */
export function toContentInput(v: CaseStudyFormValues) {
  const n = v.sortOrder.trim() === "" ? 0 : Number(v.sortOrder);
  return {
    title: v.title,
    slug: v.slug,
    projectHighlight: v.projectHighlight,
    overview: v.overview,
    ...(v.category ? { category: v.category } : {}),
    group: v.group,
    filters: v.filters,
    featured: v.featured,
    sortOrder: Number.isFinite(n) ? n : -1,
    services: v.services.map((s) => ({ name: s.name, ...(s.serviceId ? { serviceId: s.serviceId } : {}) })),
    scope: v.scope.map((s) => ({ title: s.title, ...(opt(s.value) ? { value: s.value } : {}), ...(opt(s.description) ? { description: s.description } : {}) })),
    results: v.results.map((r) => ({ value: r.value, label: r.label })),
    coverImage:
      v.cover.kind === "IMAGE"
        ? { kind: "IMAGE" as const, url: v.cover.url, ...(opt(v.cover.publicId) ? { publicId: v.cover.publicId } : {}), alt: v.cover.alt, illustrative: v.cover.illustrative, ...(opt(v.cover.position) ? { position: v.cover.position } : {}) }
        : { kind: v.cover.kind },
    gallery: v.gallery.map((g) => ({ url: g.url, ...(opt(g.publicId) ? { publicId: g.publicId } : {}), alt: g.alt })),
    seo: { ...(opt(v.seo.title) ? { title: v.seo.title } : {}), ...(opt(v.seo.description) ? { description: v.seo.description } : {}), ...(opt(v.seo.ogImage) ? { ogImage: v.seo.ogImage } : {}) },
  };
}

type ContentInput = ReturnType<typeof toContentInput>;

/**
 * PATCH `changes`: only fields whose value differs from the loaded record. Groups and nested
 * objects are sent whole. Clearing the category sends null.
 */
export function diffChanges(initial: CaseStudyFormValues, current: CaseStudyFormValues): Partial<Record<keyof ContentInput, unknown>> {
  const before = toContentInput(initial);
  const after = toContentInput(current);
  const changes: Partial<Record<keyof ContentInput, unknown>> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)] as (keyof ContentInput)[]);
  for (const key of keys) {
    if (JSON.stringify(before[key]) === JSON.stringify(after[key])) continue;
    changes[key] = key === "category" && after.category === undefined ? null : after[key];
  }
  return changes;
}

/**
 * Field errors for the form. "save" applies the content rules (drafts); "publish" also the
 * publishing rules. Keys match the API's (e.g. "results.1.value", "coverImage.alt").
 */
export function validateForm(values: CaseStudyFormValues, level: "save" | "publish"): FormErrors {
  const input = toContentInput(values);
  if (!values.slug.trim()) delete (input as { slug?: string }).slug; // generated on create
  const parsed = parseNestedWith(caseStudyCreateSchema, input);
  if (!parsed.ok) return parsed.fields;
  if (level === "save") return {};
  return publishIssues({ ...(parsed.data as CaseStudyContent), slug: parsed.data.slug ?? slugify(values.title) });
}

export const hasErrors = (e: FormErrors) => Object.keys(e).length > 0;

/** Readable label for a list of error keys ("results.1.value" → "Results, item 2"). */
export function errorSummary(errors: FormErrors): string[] {
  const names: Record<string, string> = {
    title: "Title",
    slug: "Slug",
    projectHighlight: "Project highlight",
    overview: "Overview",
    category: "Category",
    services: "Services",
    scope: "Project scope",
    results: "Results",
    coverImage: "Cover image",
    gallery: "Gallery",
    seo: "SEO",
    sortOrder: "Order",
    filters: "Filters",
    group: "Listing group",
    form: "Form",
  };
  return [...new Set(Object.keys(errors).map((k) => names[k.split(".")[0]] ?? k))];
}
