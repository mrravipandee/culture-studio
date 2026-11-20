/**
 * Case Studies — request validation (Zod). CLIENT-SAFE.
 *
 * Authoritative in the Route Handlers; the admin form reuses it for instant feedback.
 * Every object schema is strict: unknown properties (status, ids, timestamps, audit fields,
 * anything else) are rejected, so nothing can be mass-assigned. Status only ever changes
 * through the dedicated publish / unpublish / archive / restore actions.
 *
 * Two levels:
 *  - content schemas (here): what may be SAVED, drafts included;
 *  - publishing readiness (rules.ts → publishIssues): what must be true to PUBLISH.
 */

import { z } from "zod";
import { CONTROL_CHARS, objectIdSchema } from "@/lib/validation/common";
import {
  CASE_STUDY_CATEGORY_IDS,
  CASE_STUDY_FILTER_IDS,
  CASE_STUDY_GROUPS,
  CASE_STUDY_LIMITS as L,
  CASE_STUDY_PAGE_SIZE,
  CASE_STUDY_PAGE_SIZE_MAX,
  CASE_STUDY_SLUG_PATTERN,
  CASE_STUDY_SORTS,
  CASE_STUDY_STATUSES,
  CATALOG_SERVICE_IDS,
  COVER_KINDS,
  OBJECT_POSITION_PATTERN,
  RESERVED_SLUGS,
  isAllowedImageUrl,
  isCloudinaryUrl,
} from "./constants";

/* Text primitives -------------------------------------------------------------------------- */

/** One line: no control characters, inner whitespace collapsed, trimmed. */
const line = (label: string, max: number) =>
  z
    .string({ error: `${label} must be text.` })
    .refine((v) => !CONTROL_CHARS.test(v), `${label} contains characters that aren't allowed.`)
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(z.string().max(max, `Keep ${label.toLowerCase()} under ${max} characters.`));

const requiredLine = (label: string, max: number, message = `Enter ${label.toLowerCase()}.`) => line(label, max).pipe(z.string().min(1, message));

/** Optional line: "" and whitespace become undefined. */
const optionalLine = (label: string, max: number) =>
  line(label, max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Paragraph text: line breaks kept (normalised), other control characters rejected. */
const paragraph = (label: string, max: number) =>
  z
    .string({ error: `Enter ${label.toLowerCase()}.` })
    .transform((v) => v.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim())
    .refine((v) => !/[\u0000-\u0009\u000b-\u001f\u007f]/.test(v), `${label} contains characters that aren't allowed.`)
    .pipe(z.string().min(1, `Enter ${label.toLowerCase()}.`).max(max, `Keep ${label.toLowerCase()} under ${max} characters.`));

/* Slugs -------------------------------------------------------------------------------------- */

export const caseStudySlugSchema = z
  .string({ error: "Enter a slug." })
  .transform((v) => v.trim().toLowerCase())
  .pipe(
    z
      .string()
      .min(1, "Enter a slug.")
      .max(L.slug, `Keep the slug under ${L.slug} characters.`)
      .regex(CASE_STUDY_SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens only (e.g. brand-refresh).")
      .refine((v) => !RESERVED_SLUGS.has(v), "This slug is reserved. Choose another."),
  );

/** Public route / API param: same pattern, no transformation (an uppercase URL is not a slug). */
export const publicSlugParamSchema = z.string().max(L.slug).regex(CASE_STUDY_SLUG_PATTERN);

export const caseStudyIdSchema = objectIdSchema;

/* Images --------------------------------------------------------------------------------------- */

const imageUrl = z
  .string({ error: "Choose an image." })
  .trim()
  .max(400, "This image address is too long.")
  .refine(isAllowedImageUrl, "Upload an image, or use an existing site image (a path under /images/, e.g. /images/case-studies/cover.jpg).");

const publicIdSchema = z.string().trim().max(200).regex(/^[\w/-]+$/, "Invalid image id.").optional();

/** An uploaded (Cloudinary) image carries its public id; a site image never has one. */
const checkPublicId = (image: { url?: string; publicId?: string }, ctx: z.RefinementCtx) => {
  if (!image.url) return;
  if (isCloudinaryUrl(image.url) && !image.publicId) ctx.addIssue({ code: "custom", path: ["publicId"], message: "Upload the image again (its Cloudinary id is missing)." });
  if (!isCloudinaryUrl(image.url) && image.publicId) ctx.addIssue({ code: "custom", path: ["publicId"], message: "A site image has no Cloudinary id." });
};

export const coverImageSchema = z
  .strictObject({
    kind: z.enum(COVER_KINDS, { error: "Choose a cover type." }),
    url: imageUrl.optional(),
    publicId: publicIdSchema,
    alt: line("Image description", L.alt).optional().transform((v) => v ?? ""),
    illustrative: z.boolean().optional().transform((v) => v ?? false),
    position: z.string().regex(OBJECT_POSITION_PATTERN, "Use a position like “50% 40%”.").optional(),
  })
  .superRefine((cover, ctx) => {
    checkPublicId(cover, ctx);
    if (cover.kind === "IMAGE" && !cover.url) ctx.addIssue({ code: "custom", path: ["url"], message: "Choose an image, or select another cover type." });
    if (cover.kind !== "IMAGE" && cover.url) ctx.addIssue({ code: "custom", path: ["url"], message: "Only an image cover has an image." });
  })
  .transform((cover) =>
    cover.kind === "IMAGE"
      ? cover
      : // NONE / TYPOGRAPHIC carry no photograph, so no image-only properties are kept.
        { kind: cover.kind, alt: "", illustrative: false },
  );

const galleryImageSchema = z
  .strictObject({
    url: imageUrl,
    publicId: publicIdSchema,
    alt: requiredLine("Image description", L.alt, "Describe this image for screen readers."),
  })
  .superRefine(checkPublicId);

/* Repeatable groups ---------------------------------------------------------------------------- */

const serviceSchema = z.strictObject({
  name: requiredLine("Service name", L.serviceName, "Enter the service name."),
  serviceId: z
    .string()
    .refine((v) => CATALOG_SERVICE_IDS.includes(v), "Choose a service from the catalog.")
    .optional(),
});

const scopeItemSchema = z.strictObject({
  value: optionalLine("Figure", L.resultValue),
  title: requiredLine("Scope item", L.scopeTitle, "Enter the scope item."),
  description: optionalLine("Description", L.scopeDescription),
});

const resultSchema = z.strictObject({
  value: requiredLine("Value", L.resultValue, "Enter the figure, e.g. 25%."),
  label: requiredLine("Label", L.resultLabel, "Enter what the figure measures."),
});

const uniqueBy = <T>(key: (item: T) => string, message: string) => (list: T[], ctx: z.RefinementCtx) => {
  const seen = new Set<string>();
  list.forEach((item, i) => {
    const k = key(item).toLowerCase();
    if (seen.has(k)) ctx.addIssue({ code: "custom", path: [i], message });
    seen.add(k);
  });
};

const seoSchema = z.strictObject({
  title: optionalLine("SEO title", L.seoTitle),
  description: optionalLine("SEO description", L.seoDescription),
  ogImage: imageUrl.optional(),
});

/* Content ---------------------------------------------------------------------------------------- */

const contentShape = {
  title: requiredLine("Title", L.title, "Enter a project title."),
  slug: caseStudySlugSchema,
  projectHighlight: requiredLine("Project highlight", L.highlight, "Enter the project highlight."),
  overview: paragraph("Overview", L.overview),
  category: z.enum(CASE_STUDY_CATEGORY_IDS, { error: "Choose a category from the list." }).optional(),
  group: z.enum(CASE_STUDY_GROUPS, { error: "Choose a listing group." }),
  filters: z
    .array(z.enum(CASE_STUDY_FILTER_IDS, { error: "Choose filters from the list." }))
    .max(CASE_STUDY_FILTER_IDS.length)
    .superRefine(uniqueBy((v) => v, "Each filter can only be chosen once.")),
  services: z
    .array(serviceSchema)
    .max(L.services, `Add at most ${L.services} services.`)
    .superRefine(uniqueBy((s) => s.name, "Each service can only be added once.")),
  scope: z.array(scopeItemSchema).max(L.scopeItems, `Add at most ${L.scopeItems} scope items.`),
  results: z
    .array(resultSchema)
    .max(L.results, `Add at most ${L.results} results.`)
    .superRefine(uniqueBy((r) => `${r.value} ${r.label}`, "This result is listed twice.")),
  coverImage: coverImageSchema,
  gallery: z
    .array(galleryImageSchema)
    .max(L.gallery, `Add at most ${L.gallery} gallery images.`)
    .superRefine(uniqueBy((g) => g.url, "This image is already in the gallery.")),
  featured: z.boolean({ error: "Featured must be true or false." }),
  sortOrder: z.number({ error: "Order must be a number." }).int("Order must be a whole number.").min(0, "Order can't be negative.").max(L.sortOrder, `Order must be at most ${L.sortOrder}.`),
  seo: seoSchema,
};

/** Full content (what the repository stores). */
export const caseStudyContentSchema = z.strictObject(contentShape);

/**
 * POST body. Slug may be omitted (generated from the title); optional groups default to
 * empty. Status is not accepted: new records are always DRAFT.
 */
export const caseStudyCreateSchema = z.strictObject({
  ...contentShape,
  slug: caseStudySlugSchema.optional(),
  category: contentShape.category,
  group: contentShape.group.optional().transform((v) => v ?? "selected"),
  filters: contentShape.filters.optional().transform((v) => v ?? []),
  services: contentShape.services.optional().transform((v) => v ?? []),
  scope: contentShape.scope.optional().transform((v) => v ?? []),
  results: contentShape.results.optional().transform((v) => v ?? []),
  coverImage: coverImageSchema.optional().transform((v) => v ?? { kind: "NONE" as const, alt: "", illustrative: false }),
  gallery: contentShape.gallery.optional().transform((v) => v ?? []),
  featured: contentShape.featured.optional().transform((v) => v ?? false),
  sortOrder: contentShape.sortOrder.optional().transform((v) => v ?? 0),
  seo: seoSchema.optional().transform((v) => v ?? {}),
});
export type CaseStudyCreateInput = z.output<typeof caseStudyCreateSchema>;

/**
 * PATCH body: `expectedUpdatedAt` (optimistic concurrency) plus the changed fields only.
 * A provided field replaces the stored value (groups and nested objects as a whole);
 * an omitted field is left unchanged. `category: null` clears the category.
 */
export const caseStudyUpdateSchema = z.strictObject({
  expectedUpdatedAt: z.iso.datetime({ error: "Reload the case study and try again." }),
  changes: caseStudyContentSchema
    .partial()
    .extend({ category: contentShape.category.nullable().optional() })
    .refine((c) => Object.keys(c).length > 0, "There are no changes to save."),
});
export type CaseStudyUpdateInput = z.output<typeof caseStudyUpdateSchema>;
export type CaseStudyChanges = CaseStudyUpdateInput["changes"];

/** publish / unpublish / archive take an optional concurrency token only. */
export const caseStudyActionSchema = z.strictObject({
  expectedUpdatedAt: z.iso.datetime({ error: "Reload the case study and try again." }).optional(),
});

/** restore may also give a new slug (when the old one was taken while the record was deleted). */
export const caseStudyRestoreSchema = caseStudyActionSchema.extend({ slug: caseStudySlugSchema.optional() });

/* Queries -------------------------------------------------------------------------------------------- */

const intParam = (min: number, max: number, fallback: number, label: string) =>
  z
    .string()
    .regex(/^\d{1,5}$/, `${label} must be a whole number.`)
    .transform(Number)
    .pipe(z.number().int().min(min, `${label} must be at least ${min}.`).max(max, `${label} must be at most ${max}.`))
    .optional()
    .transform((v) => v ?? fallback);

const boolParam = z
  .enum(["true", "false"], { error: "Use true or false." })
  .optional()
  .transform((v) => (v === undefined ? undefined : v === "true"));

const isoDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date.")
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Invalid date.");

/** India-time day boundaries (the admin works in IST). */
const istStart = (day: string) => new Date(`${day}T00:00:00+05:30`);
const istEndExclusive = (day: string) => new Date(istStart(day).getTime() + 86_400_000);

const searchParam = z
  .string()
  .max(L.search, "Search is too long.")
  .optional()
  .transform((v) => v?.replace(/\s+/g, " ").trim() || undefined);

export const caseStudyListQuerySchema = z
  .strictObject({
    page: intParam(1, 10_000, 1, "page"),
    pageSize: intParam(1, CASE_STUDY_PAGE_SIZE_MAX, CASE_STUDY_PAGE_SIZE, "pageSize"),
    search: searchParam,
    status: z.enum(["all", "deleted", ...CASE_STUDY_STATUSES], { error: "Choose a valid status." }).optional().transform((v) => v ?? "all"),
    featured: boolParam,
    category: z.enum(CASE_STUDY_CATEGORY_IDS, { error: "Choose a valid category." }).optional(),
    service: z.string().refine((v) => CATALOG_SERVICE_IDS.includes(v), "Choose a valid service.").optional(),
    from: isoDay.optional(),
    to: isoDay.optional(),
    sort: z.enum(CASE_STUDY_SORTS, { error: "Choose a valid sort." }).optional().transform((v) => v ?? "newest"),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, { path: ["to"], message: "`to` must be on or after `from`." })
  .transform(({ service, from, to, ...q }) => ({
    ...q,
    serviceId: service,
    from: from ? istStart(from) : undefined,
    to: to ? istEndExclusive(to) : undefined,
  }));

export const publicCaseStudyListQuerySchema = z
  .strictObject({
    page: intParam(1, 1000, 1, "page"),
    pageSize: intParam(1, CASE_STUDY_PAGE_SIZE_MAX, 24, "pageSize"),
    search: searchParam,
    category: z.enum(CASE_STUDY_CATEGORY_IDS, { error: "Choose a valid category." }).optional(),
    filter: z.enum(CASE_STUDY_FILTER_IDS, { error: "Choose a valid filter." }).optional(),
    service: z.string().refine((v) => CATALOG_SERVICE_IDS.includes(v), "Choose a valid service.").optional(),
    featured: boolParam,
    sort: z.enum(["order", "newest"], { error: "Choose a valid sort." }).optional().transform((v) => v ?? "order"),
  })
  .transform(({ service, ...q }) => ({ ...q, serviceId: service }));
