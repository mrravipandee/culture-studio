"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { AlertCircle, ChevronDown, Globe, X } from "lucide-react";
import { BLOG_CATEGORIES, type BlogStatus } from "@/lib/admin/types";
import { BLOG_LIMITS, canonicalFor, cleanTag, seoDescriptionFor, seoTitleFor, type BlogFormErrors, type BlogFormValues } from "@/lib/admin/blog-utils";
import CaseStudyStatusBadge from "../case-studies/CaseStudyStatusBadge";

type Patch = (changes: Partial<BlogFormValues>) => void;

const inputClass = (error?: string) =>
  `w-full rounded-lg border bg-white px-3.5 text-sm text-ink placeholder:text-ink-3 focus-visible:outline-2 focus-visible:outline-burgundy ${error ? "border-[#a3242f]" : "border-black/15 hover:border-black/30"}`;

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-xs text-[#a3242f]">
      <AlertCircle aria-hidden="true" size={13} className="mt-px shrink-0" />
      {error}
    </p>
  );
}

/** Collapsible side panel (open by default on desktop). */
export function Panel({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-black/[0.08] bg-white/80 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-4 text-sm font-semibold text-[#1a0a0c] focus-visible:outline-2 focus-visible:outline-burgundy">
        {title}
        <ChevronDown aria-hidden="true" size={16} className="text-ink-2 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-black/[0.06] px-5 pb-5 pt-4">{children}</div>
    </details>
  );
}

const count = (n: number, ideal: number, max: number) => (n > max ? "text-[#a3242f]" : n > ideal ? "text-[#a86b12]" : "text-ink-3");

/* Publishing ------------------------------------------------------------------- */

export function PublishingPanel({
  values,
  errors,
  patch,
  status,
  words,
  readingTime,
  today,
}: {
  values: BlogFormValues;
  errors: BlogFormErrors;
  patch: Patch;
  status: BlogStatus | "NEW";
  words: number;
  readingTime: string;
  today: string;
}) {
  const id = useId();
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);

  const addTag = () => {
    const { tag, error } = cleanTag(tagInput, values.tags);
    if (error) return setTagError(error);
    setTagError(null);
    setTagInput("");
    patch({ tags: [...values.tags, tag as string] });
  };
  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !tagInput && values.tags.length) {
      patch({ tags: values.tags.slice(0, -1) });
    }
  };

  return (
    <Panel title="Publishing">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-ink-2">Status</span>
        {status === "NEW" ? <span className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-xs text-ink-2">Not saved yet</span> : <CaseStudyStatusBadge status={status} />}
      </div>
      <p className="text-xs text-ink-3">
        {words} words · {readingTime}
      </p>

      <div>
        <label htmlFor={`${id}-cat`} className="text-sm font-medium text-ink">
          Category
        </label>
        <select
          id={`${id}-cat`}
          value={values.category}
          onChange={(e) => patch({ category: e.target.value })}
          aria-invalid={errors.category ? true : undefined}
          aria-describedby={errors.category ? `${id}-cat-error` : undefined}
          className={`${inputClass(errors.category)} mt-1.5 h-11`}
        >
          <option value="">Choose a category</option>
          {BLOG_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <FieldError id={`${id}-cat-error`} error={errors.category} />
      </div>

      <div>
        <label htmlFor={`${id}-tag`} className="text-sm font-medium text-ink">
          Tags
        </label>
        {values.tags.length > 0 ? (
          <ul aria-label="Tags" className="mt-1.5 flex flex-wrap gap-1.5">
            {values.tags.map((t) => (
              <li key={t} className="flex items-center gap-1 rounded-full bg-[#f7e4e4] py-1 pl-2.5 pr-1 text-xs text-[#7a1f2b]">
                {t}
                <button type="button" onClick={() => patch({ tags: values.tags.filter((x) => x !== t) })} aria-label={`Remove tag ${t}`} className="grid size-5 place-items-center rounded-full hover:bg-[#7a1f2b]/10 focus-visible:outline-2 focus-visible:outline-burgundy">
                  <X aria-hidden="true" size={11} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-ink-3">No tags yet. Type a tag and press Enter.</p>
        )}
        <div className="mt-2 flex gap-2">
          <input
            id={`${id}-tag`}
            value={tagInput}
            maxLength={BLOG_LIMITS.tag + 10}
            onChange={(e) => {
              setTagInput(e.target.value);
              setTagError(null);
            }}
            onKeyDown={onTagKey}
            placeholder="e.g. positioning"
            aria-describedby={tagError || errors.tags ? `${id}-tag-error` : undefined}
            className={`${inputClass(tagError ?? errors.tags)} h-10`}
          />
          <button type="button" onClick={addTag} className="h-10 shrink-0 rounded-lg border border-black/15 bg-white px-3 text-sm font-medium text-ink hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy">
            Add
          </button>
        </div>
        <FieldError id={`${id}-tag-error`} error={tagError ?? errors.tags} />
      </div>

      <div>
        <label htmlFor={`${id}-author`} className="text-sm font-medium text-ink">
          Author
        </label>
        <input id={`${id}-author`} value={values.author} maxLength={BLOG_LIMITS.author + 10} onChange={(e) => patch({ author: e.target.value })} className={`${inputClass(errors.author)} mt-1.5 h-11`} />
        <FieldError id={`${id}-author-error`} error={errors.author} />
      </div>

      <div>
        <label htmlFor={`${id}-date`} className="text-sm font-medium text-ink">
          Publish date
        </label>
        <input
          id={`${id}-date`}
          type="date"
          value={values.publishDate}
          max={today}
          onChange={(e) => patch({ publishDate: e.target.value })}
          aria-invalid={errors.publishDate ? true : undefined}
          aria-describedby={`${id}-date-help${errors.publishDate ? ` ${id}-date-error` : ""}`}
          className={`${inputClass(errors.publishDate)} mt-1.5 h-11`}
        />
        <p id={`${id}-date-help`} className="mt-1 text-xs text-ink-3">
          Leave empty to use the day you publish. Scheduling isn&rsquo;t available yet.
        </p>
        <FieldError id={`${id}-date-error`} error={errors.publishDate} />
      </div>
    </Panel>
  );
}

/* SEO -------------------------------------------------------------------------- */

export function SeoPanel({ values, errors, patch, siteUrl }: { values: BlogFormValues; errors: BlogFormErrors; patch: Patch; siteUrl: string }) {
  const id = useId();
  const title = seoTitleFor(values);
  const description = seoDescriptionFor(values);
  const canonical = canonicalFor(siteUrl, values.slug);
  const host = new URL(siteUrl).host;

  return (
    <Panel title="SEO & social" defaultOpen={false}>
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={`${id}-title`} className="text-sm font-medium text-ink">
            SEO title
          </label>
          <span className={`text-xs tabular-nums ${count(title.length, BLOG_LIMITS.seoTitleIdeal, BLOG_LIMITS.seoTitle)}`}>
            {title.length}/{BLOG_LIMITS.seoTitleIdeal}
          </span>
        </div>
        <input
          id={`${id}-title`}
          value={values.seoTitle}
          maxLength={BLOG_LIMITS.seoTitle + 30}
          placeholder={values.title || "Defaults to the article title"}
          onChange={(e) => patch({ seoTitle: e.target.value })}
          aria-invalid={errors.seoTitle ? true : undefined}
          className={`${inputClass(errors.seoTitle)} mt-1.5 h-11`}
        />
        <FieldError id={`${id}-title-error`} error={errors.seoTitle} />
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={`${id}-desc`} className="text-sm font-medium text-ink">
            Meta description
          </label>
          <span className={`text-xs tabular-nums ${count(description.length, BLOG_LIMITS.seoDescriptionIdeal, BLOG_LIMITS.seoDescription)}`}>
            {description.length}/{BLOG_LIMITS.seoDescriptionIdeal}
          </span>
        </div>
        <textarea
          id={`${id}-desc`}
          rows={3}
          value={values.seoDescription}
          maxLength={BLOG_LIMITS.seoDescription + 50}
          placeholder={values.excerpt || "Defaults to the excerpt"}
          onChange={(e) => patch({ seoDescription: e.target.value })}
          aria-invalid={errors.seoDescription ? true : undefined}
          className={`${inputClass(errors.seoDescription)} mt-1.5 resize-y py-2.5`}
        />
        <FieldError id={`${id}-desc-error`} error={errors.seoDescription} />
      </div>
      <div className="text-sm">
        <p className="font-medium text-ink">Canonical URL</p>
        <p className="mt-1 break-all font-mono text-xs text-ink-2">{canonical}</p>
        <p className="mt-1 text-xs text-ink-3">Generated from the slug on the production domain.</p>
      </div>

      {/* Search result preview */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Search preview</p>
        <div className="mt-2 rounded-lg border border-black/10 bg-white p-3.5">
          <p className="flex items-center gap-1.5 truncate text-xs text-ink-2">
            <Globe aria-hidden="true" size={12} /> {host} › blog › {values.slug || "your-slug"}
          </p>
          <p className="mt-1 line-clamp-2 text-[1.0625rem] leading-snug text-[#1a0dab]">{title ? `${title} | CULT.URE` : "Article title | CULT.URE"}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-2">{description || "The meta description appears here."}</p>
        </div>
      </div>

      {/* Social preview */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Social preview</p>
        <div className="mt-2 overflow-hidden rounded-lg border border-black/10 bg-white">
          <div className="aspect-[1.91/1] bg-[#3a0f15] bg-cover bg-center" style={values.coverImage ? { backgroundImage: `url("${values.coverImage}")` } : undefined} role="img" aria-label={values.coverImage ? "Shared image: the cover image" : "No cover image: the site's default share image is used"} />
          <div className="border-t border-black/10 p-3">
            <p className="text-[0.6875rem] uppercase text-ink-3">{host}</p>
            <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-[#1a0a0c]">{title || "Article title"}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-ink-2">{description || "Description"}</p>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-ink-3">The share image is the cover image.</p>
      </div>
    </Panel>
  );
}
