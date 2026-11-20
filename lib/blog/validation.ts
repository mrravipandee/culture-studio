/**
 * Blog — request validation (Zod). CLIENT-SAFE.
 *
 * Strict objects everywhere: status, ids, timestamps, audit fields and anything unknown are
 * rejected (no mass assignment). The article body is rebuilt by the whitelist sanitiser
 * (./content.ts) as part of parsing, so only clean content ever reaches the database.
 * Status changes only through the publish / unpublish actions.
 */

import { z } from "zod";
import { CONTROL_CHARS, objectIdSchema } from "@/lib/validation/common";
import { CASE_STUDY_SLUG_PATTERN, RESERVED_SLUGS, isAllowedImageUrl, isCloudinaryUrl } from "@/lib/case-studies/constants";
import { BLOG_BULK_MAX, BLOG_CATEGORIES, BLOG_DEFAULT_AUTHOR, BLOG_LIMITS as L } from "./constants";
import { sanitizeRichDoc } from "./content";
import type { RichNode } from "@/lib/rich-text";

const line = (label: string, max: number) =>
  z
    .string({ error: `${label} must be text.` })
    .refine((v) => !CONTROL_CHARS.test(v), `${label} contains characters that aren't allowed.`)
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(z.string().max(max, `Keep ${label.toLowerCase()} under ${max} characters.`));

const optionalLine = (label: string, max: number) => line(label, max).optional().transform((v) => v || undefined);

export const blogSlugSchema = z
  .string({ error: "Enter a slug." })
  .transform((v) => v.trim().toLowerCase())
  .pipe(
    z
      .string()
      .min(1, "Enter a slug.")
      .max(L.slug, `Keep the slug under ${L.slug} characters.`)
      .regex(CASE_STUDY_SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens only.")
      .refine((v) => !RESERVED_SLUGS.has(v), "This slug is reserved. Choose another."),
  );

export const publicBlogSlugSchema = z.string().max(L.slug).regex(CASE_STUDY_SLUG_PATTERN);
export const blogIdSchema = objectIdSchema;

/** The body: any JSON in, sanitised RichNode out (errors become field messages). */
const contentSchema = z.unknown().transform((value, ctx): RichNode => {
  const { doc, errors } = sanitizeRichDoc(value);
  for (const message of errors) ctx.addIssue({ code: "custom", message });
  return doc;
});

const imageUrl = z
  .string()
  .trim()
  .max(400, "This image address is too long.")
  .refine(isAllowedImageUrl, "Upload an image, or choose one of the site images.");

const coverSchema = z
  .strictObject({
    url: imageUrl,
    publicId: z.string().trim().max(200).regex(/^[\w/-]+$/, "Invalid image id.").optional(),
    alt: line("Alt text", L.alt).optional().transform((v) => v ?? ""),
    caption: line("Caption", L.caption).optional().transform((v) => v ?? ""),
  })
  .superRefine((c, ctx) => {
    if (isCloudinaryUrl(c.url) && !c.publicId) ctx.addIssue({ code: "custom", path: ["publicId"], message: "Upload the cover again (its Cloudinary id is missing)." });
    if (!isCloudinaryUrl(c.url) && c.publicId) ctx.addIssue({ code: "custom", path: ["publicId"], message: "A site image has no Cloudinary id." });
  });

/** Today in India time (the editorial calendar). */
export const istToday = (now = Date.now()) => new Date(now + 5.5 * 3600_000).toISOString().slice(0, 10);

const displayDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v), "Enter a valid date.")
  .refine((v) => v <= istToday(), "Scheduling isn't available yet. Choose today or an earlier date.");

const tagsSchema = z
  .array(line("Tag", L.tag).pipe(z.string().min(1, "Remove empty tags.")))
  .max(L.tags, `Use up to ${L.tags} tags.`)
  .refine((tags) => new Set(tags.map((t) => t.toLowerCase())).size === tags.length, "Remove duplicate tags.");

const seoSchema = z.strictObject({
  title: optionalLine("SEO title", L.seoTitle),
  description: optionalLine("Meta description", L.seoDescription),
});

const shape = {
  title: line("Title", L.title).pipe(z.string().min(1, "Enter a title.")),
  slug: blogSlugSchema,
  excerpt: z
    .string()
    .refine((v) => !CONTROL_CHARS.test(v.replace(/\n/g, " ")), "The excerpt contains characters that aren't allowed.")
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(z.string().max(L.excerpt, `Keep the excerpt under ${L.excerpt} characters.`)),
  content: contentSchema,
  category: z.enum(BLOG_CATEGORIES, { error: "Choose a category from the list." }).optional(),
  tags: tagsSchema,
  author: line("Author", L.author).transform((v) => v || BLOG_DEFAULT_AUTHOR),
  coverImage: coverSchema.nullable(),
  displayDate: displayDateSchema.nullable(),
  seo: seoSchema,
};

export const blogContentSchema = z.strictObject(shape);

/** POST body. Slug optional (generated from the title). New posts are always drafts. */
export const blogCreateSchema = z.strictObject({
  ...shape,
  slug: blogSlugSchema.optional(),
  excerpt: shape.excerpt.optional().transform((v) => v ?? ""),
  content: contentSchema.optional().transform((v) => v ?? { type: "doc", content: [{ type: "paragraph" }] }),
  tags: tagsSchema.optional().transform((v) => v ?? []),
  author: shape.author.optional().transform((v) => v ?? BLOG_DEFAULT_AUTHOR),
  coverImage: shape.coverImage.optional().transform((v) => v ?? null),
  displayDate: shape.displayDate.optional().transform((v) => v ?? null),
  seo: seoSchema.optional().transform((v) => v ?? {}),
});
export type BlogCreateInput = z.output<typeof blogCreateSchema>;

/**
 * PATCH body: `expectedUpdatedAt` (optimistic concurrency) + only the changed fields.
 * `category: null` clears it; `coverImage: null` removes the cover; `displayDate: null` = use the publish date.
 */
export const blogUpdateSchema = z.strictObject({
  expectedUpdatedAt: z.iso.datetime({ error: "Reload the article and try again." }),
  changes: blogContentSchema
    .partial()
    .extend({ category: shape.category.nullable().optional() })
    .refine((c) => Object.keys(c).length > 0, "There are no changes to save."),
});
export type BlogUpdateInput = z.output<typeof blogUpdateSchema>;
export type BlogChanges = BlogUpdateInput["changes"];

export const blogActionSchema = z.strictObject({
  expectedUpdatedAt: z.iso.datetime({ error: "Reload the article and try again." }).optional(),
});

export const blogBulkSchema = z.strictObject({
  action: z.enum(["delete"], { error: "Choose a valid action." }),
  ids: z
    .array(blogIdSchema)
    .min(1, "Select at least one article.")
    .max(BLOG_BULK_MAX, `Select at most ${BLOG_BULK_MAX} articles at a time.`)
    .refine((ids) => new Set(ids).size === ids.length, "Each article can only be selected once."),
});
