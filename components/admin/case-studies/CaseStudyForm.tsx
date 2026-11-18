"use client";

import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { AlertCircle, ImagePlus, Info, Plus, Trash2, X } from "lucide-react";
import {
  hasErrors,
  IMAGE_TYPES,
  LIMITS,
  normaliseForm,
  slugify,
  validateCaseStudy,
  validateImageFile,
  type CaseStudyFormErrors,
  type CaseStudyFormValues,
} from "@/lib/admin/case-study-utils";
import type { CaseStudyStatus } from "@/lib/admin/types";
import ConfirmDialog from "../ConfirmDialog";
import CaseStudyCover from "./CaseStudyCover";

interface Props {
  mode: "create" | "edit";
  initial: CaseStudyFormValues;
  initialStatus: CaseStudyStatus;
  /** Slugs used by other records (duplicate check). */
  takenSlugs: string[];
  categories: string[];
  serviceOptions: string[];
  serifClassName: string;
  /** Called with trimmed, validated values. */
  onSubmit: (values: CaseStudyFormValues, status: CaseStudyStatus) => void;
  onClose: () => void;
  /** Lets the parent revoke local preview URLs later. */
  onPreviewUrl: (url: string) => void;
}

const inputClass = (error?: string) =>
  `w-full rounded-lg border bg-white px-3.5 text-sm text-ink placeholder:text-ink-3 transition-colors focus-visible:outline-2 focus-visible:outline-burgundy ${
    error ? "border-[#a3242f]" : "border-black/15 hover:border-black/30"
  }`;

function Field({ id, label, hint, error, count, children }: { id: string; label: string; hint?: string; error?: string; count?: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {count && <span className="text-xs tabular-nums text-ink-3">{count}</span>}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-xs text-ink-3">
          {hint}
        </p>
      )}
      <div className="mt-1.5">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-[#a3242f]">
          <AlertCircle aria-hidden="true" size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

function ItemList({
  legend,
  items,
  errors,
  onChange,
  addLabel,
  placeholder,
}: {
  legend: string;
  items: string[];
  errors?: Record<number, string>;
  onChange: (items: string[]) => void;
  addLabel: string;
  placeholder: string;
}) {
  const base = useId();
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      <ul className="mt-2 space-y-2">
        {items.map((item, i) => (
          <li key={i}>
            <div className="flex items-center gap-2">
              <label htmlFor={`${base}-${i}`} className="sr-only">
                {legend} item {i + 1}
              </label>
              <input
                id={`${base}-${i}`}
                value={item}
                maxLength={LIMITS.item + 20}
                onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
                placeholder={placeholder}
                aria-invalid={errors?.[i] ? true : undefined}
                aria-describedby={errors?.[i] ? `${base}-${i}-error` : undefined}
                className={`${inputClass(errors?.[i])} h-11`}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                aria-label={`Remove ${legend.toLowerCase()} item ${i + 1}`}
                className="grid size-11 shrink-0 place-items-center rounded-lg border border-black/15 text-ink-2 hover:border-[#a3242f]/40 hover:text-[#a3242f] focus-visible:outline-2 focus-visible:outline-burgundy"
              >
                <Trash2 aria-hidden="true" size={16} />
              </button>
            </div>
            {errors?.[i] && (
              <p id={`${base}-${i}-error`} className="mt-1 text-xs text-[#a3242f]">
                {errors[i]}
              </p>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        disabled={items.length >= 6}
        className="mt-2 inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-burgundy hover:bg-burgundy/5 focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-40"
      >
        <Plus aria-hidden="true" size={16} /> {addLabel}
      </button>
    </fieldset>
  );
}

export default function CaseStudyForm({ mode, initial, initialStatus, takenSlugs, categories, serviceOptions, serifClassName, onSubmit, onClose, onPreviewUrl }: Props) {
  const [values, setValues] = useState<CaseStudyFormValues>(initial);
  const [errors, setErrors] = useState<CaseStudyFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [imageError, setImageError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"publish" | "discard" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  /** Synchronous guard: state updates are async, so a fast double click could submit twice. */
  const submittedOnce = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const ids = { title: useId(), slug: useId(), highlight: useId(), overview: useId(), category: useId(), services: useId(), alt: useId(), heading: useId() };

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initial), [values, initial]);
  const available = serviceOptions.filter((s) => !values.services.includes(s));

  /** Apply changes; keep the slug in sync with the title until it is edited by hand. */
  const patch = (changes: Partial<CaseStudyFormValues>) => {
    const next = { ...values, ...changes };
    if (changes.title !== undefined && !slugTouched) next.slug = slugify(changes.title);
    setValues(next);
    if (submitted) setErrors(validateCaseStudy(next, takenSlugs, categories));
  };
  const update = <K extends keyof CaseStudyFormValues>(key: K, value: CaseStudyFormValues[K]) => patch({ [key]: value } as Partial<CaseStudyFormValues>);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  /* Close: warn when there are unsaved changes */
  const requestClose = () => {
    if (submitting) return;
    if (dirty) setConfirm("discard");
    else onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("dialog[open]")) return;
      e.preventDefault();
      if (dirty) setConfirm("discard");
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dirty, onClose]);

  /* Image: local preview only (nothing is uploaded) */
  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setImageError(problem);
      return;
    }
    setImageError(null);
    const url = URL.createObjectURL(file);
    onPreviewUrl(url);
    update("coverImage", url);
  };

  /* Submit */
  const attempt = (status: CaseStudyStatus) => {
    if (submitting || submittedOnce.current) return;
    setSubmitted(true);
    const found = validateCaseStudy(values, takenSlugs, categories);
    setErrors(found);
    if (hasErrors(found)) {
      requestAnimationFrame(() => body.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    if (status === "PUBLISHED") setConfirm("publish");
    else finish("DRAFT");
  };

  const finish = (status: CaseStudyStatus) => {
    if (submittedOnce.current) return;
    submittedOnce.current = true;
    setSubmitting(true);
    setConfirm(null);
    onSubmit(normaliseForm(values), status);
  };

  const errorCount = Object.keys(errors).length;
  const describe = (id: string, error?: string, hint?: boolean) => [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <>
      <div className="fixed inset-0 z-[70]">
        <div aria-hidden="true" onClick={requestClose} className="admin-overlay-in absolute inset-0 bg-black/45" />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={ids.heading}
          className="admin-sheet-in absolute inset-y-0 right-0 flex w-full flex-col bg-[var(--cream)] shadow-[-16px_0_48px_-24px_rgba(36,12,14,0.5)] sm:max-w-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-black/10 px-5 py-4 sm:px-8 sm:py-5">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-burgundy">{mode === "create" ? "New case study" : "Edit case study"}</p>
              <h2 id={ids.heading} className={`${serifClassName} mt-1 text-[1.75rem] font-medium leading-tight text-[#1a0a0c]`}>
                {mode === "create" ? "Add Case Study" : values.title || initial.title}
              </h2>
            </div>
            <button type="button" onClick={requestClose} aria-label="Close form" className="grid size-10 place-items-center rounded-full text-ink-2 hover:bg-black/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-burgundy">
              <X aria-hidden="true" size={20} />
            </button>
          </div>

          {/* Body */}
          <div ref={body} className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8">
            <p className="flex gap-2 rounded-lg border border-[#c08a2d]/25 bg-[#c08a2d]/[0.07] p-3 text-xs leading-relaxed text-[#6b4a12]">
              <Info aria-hidden="true" size={15} className="mt-px shrink-0" />
              Changes are kept in this browser tab only and reset on reload. Nothing is uploaded, and the public website does not change.
            </p>

            {submitted && errorCount > 0 && (
              <p role="alert" className="mt-4 flex items-center gap-2 rounded-lg border border-[#a3242f]/25 bg-[#a3242f]/[0.05] p-3 text-sm text-[#a3242f]">
                <AlertCircle aria-hidden="true" size={16} />
                Please fix {errorCount === 1 ? "the highlighted field" : `the ${errorCount} highlighted fields`}.
              </p>
            )}

            <section aria-label="Basic information" className="mt-6 space-y-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Basic information</h3>
              <Field id={ids.title} label="Project title" error={errors.title} count={`${values.title.length}/${LIMITS.title}`}>
                <input
                  ref={titleRef}
                  id={ids.title}
                  value={values.title}
                  maxLength={LIMITS.title + 20}
                  onChange={(e) => update("title", e.target.value)}
                  aria-invalid={errors.title ? true : undefined}
                  aria-describedby={describe(ids.title, errors.title)}
                  className={`${inputClass(errors.title)} h-11`}
                />
              </Field>
              <Field id={ids.slug} label="Slug" hint={`Public address: /case-studies/${values.slug || "your-slug"}`} error={errors.slug}>
                <input
                  id={ids.slug}
                  value={values.slug}
                  maxLength={LIMITS.slug + 20}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update("slug", e.target.value.toLowerCase());
                  }}
                  spellCheck={false}
                  autoCapitalize="none"
                  aria-invalid={errors.slug ? true : undefined}
                  aria-describedby={describe(ids.slug, errors.slug, true)}
                  className={`${inputClass(errors.slug)} h-11 font-mono text-[0.8125rem]`}
                />
              </Field>
              <Field id={ids.highlight} label="Project highlight" error={errors.highlight} count={`${values.highlight.length}/${LIMITS.highlight}`}>
                <textarea
                  id={ids.highlight}
                  value={values.highlight}
                  rows={2}
                  maxLength={LIMITS.highlight + 40}
                  onChange={(e) => update("highlight", e.target.value)}
                  aria-invalid={errors.highlight ? true : undefined}
                  aria-describedby={describe(ids.highlight, errors.highlight)}
                  className={`${inputClass(errors.highlight)} resize-y py-2.5 leading-relaxed`}
                />
              </Field>
              <Field id={ids.overview} label="Overview" error={errors.overview} count={`${values.overview.length}/${LIMITS.overview}`}>
                <textarea
                  id={ids.overview}
                  value={values.overview}
                  rows={4}
                  maxLength={LIMITS.overview + 100}
                  onChange={(e) => update("overview", e.target.value)}
                  aria-invalid={errors.overview ? true : undefined}
                  aria-describedby={describe(ids.overview, errors.overview)}
                  className={`${inputClass(errors.overview)} resize-y py-2.5 leading-relaxed`}
                />
              </Field>
              <Field id={ids.category} label="Category" error={errors.category}>
                <select
                  id={ids.category}
                  value={values.category}
                  onChange={(e) => update("category", e.target.value)}
                  aria-invalid={errors.category ? true : undefined}
                  aria-describedby={describe(ids.category, errors.category)}
                  className={`${inputClass(errors.category)} h-11`}
                >
                  <option value="">Choose a category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </section>

            <section aria-label="Services" className="mt-8 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Services</h3>
              {values.services.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {values.services.map((s) => (
                    <li key={s} className="flex items-center gap-1 rounded-full bg-[#f7e4e4] py-1 pl-3 pr-1 text-xs text-[#7a1f2b]">
                      {s}
                      <button
                        type="button"
                        onClick={() => update("services", values.services.filter((x) => x !== s))}
                        aria-label={`Remove ${s}`}
                        className="grid size-6 place-items-center rounded-full hover:bg-[#7a1f2b]/10 focus-visible:outline-2 focus-visible:outline-burgundy"
                      >
                        <X aria-hidden="true" size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Field id={ids.services} label="Add a service" error={errors.services}>
                <select
                  id={ids.services}
                  value=""
                  onChange={(e) => {
                    const s = e.target.value;
                    if (s && !values.services.includes(s)) update("services", [...values.services, s]);
                  }}
                  aria-invalid={errors.services ? true : undefined}
                  aria-describedby={describe(ids.services, errors.services)}
                  className={`${inputClass(errors.services)} h-11`}
                >
                  <option value="">{available.length ? "Choose a service to add" : "All services added"}</option>
                  {available.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </section>

            <section aria-label="Scope and results" className="mt-8 space-y-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Scope and results</h3>
              <fieldset>
                <legend className="text-sm font-medium text-ink">Shown on the project page as</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["Results", "Project Scope"] as const).map((label) => (
                    <label
                      key={label}
                      className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-burgundy ${
                        values.figuresLabel === label ? "border-[#5a0c14] bg-[#5a0c14] text-white" : "border-black/15 bg-white text-ink hover:border-black/30"
                      }`}
                    >
                      <input type="radio" name="figuresLabel" value={label} checked={values.figuresLabel === label} onChange={() => update("figuresLabel", label)} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <ItemList legend="Project scope" items={values.scope} errors={errors.scopeItems} onChange={(v) => update("scope", v)} addLabel="Add scope item" placeholder="e.g. 03 Brand Touchpoints" />
              <ItemList legend="Results" items={values.results} errors={errors.resultItems} onChange={(v) => update("results", v)} addLabel="Add result" placeholder="e.g. 25% Sales Growth" />
              {errors.items && (
                <p role="alert" className="flex items-center gap-1.5 text-xs text-[#a3242f]">
                  <AlertCircle aria-hidden="true" size={13} />
                  {errors.items}
                </p>
              )}
            </section>

            <section aria-label="Cover image" className="mt-8 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Cover image</h3>
              <CaseStudyCover src={values.coverImage} alt={values.coverAlt} label={values.title.charAt(0) || "—"} sizes="40rem" className="aspect-[16/9] rounded-lg" />
              <input ref={fileInput} type="file" accept={IMAGE_TYPES.join(",")} onChange={onFile} className="sr-only" tabIndex={-1} aria-hidden="true" />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-black/20 bg-white px-3.5 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy"
                >
                  <ImagePlus aria-hidden="true" size={16} /> {values.coverImage ? "Replace image" : "Choose image"}
                </button>
                {values.coverImage && (
                  <button
                    type="button"
                    onClick={() => {
                      patch({ coverImage: null, coverAlt: "" });
                      setImageError(null);
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-[#a3242f] hover:bg-[#a3242f]/5 focus-visible:outline-2 focus-visible:outline-burgundy"
                  >
                    <Trash2 aria-hidden="true" size={16} /> Remove
                  </button>
                )}
                <span className="text-xs text-ink-3">PNG, JPG or WebP, up to 2 MB. Preview only, not uploaded.</span>
              </div>
              {imageError && (
                <p role="alert" className="flex items-center gap-1.5 text-xs text-[#a3242f]">
                  <AlertCircle aria-hidden="true" size={13} />
                  {imageError}
                </p>
              )}
              {values.coverImage && (
                <Field id={ids.alt} label="Image description (alt text)" error={errors.coverAlt}>
                  <input
                    id={ids.alt}
                    value={values.coverAlt}
                    maxLength={LIMITS.alt + 20}
                    onChange={(e) => update("coverAlt", e.target.value)}
                    aria-invalid={errors.coverAlt ? true : undefined}
                    aria-describedby={describe(ids.alt, errors.coverAlt)}
                    className={`${inputClass(errors.coverAlt)} h-11`}
                  />
                </Field>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-3 items-center gap-2 border-t border-black/10 bg-[var(--cream)] px-4 py-3.5 sm:flex sm:gap-2.5 sm:px-8 sm:py-4">
            <p className="mr-auto hidden text-xs text-ink-3 sm:block">{mode === "edit" ? `Currently ${initialStatus === "PUBLISHED" ? "published" : "a draft"}` : "New records start as drafts unless published"}</p>
            <button type="button" onClick={requestClose} disabled={submitting} className="h-11 rounded-md px-3 text-sm font-medium text-ink hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-50 sm:px-4">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => attempt("DRAFT")}
              disabled={submitting}
              className="h-11 rounded-md border border-black/20 bg-white px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => attempt("PUBLISHED")}
              disabled={submitting}
              className="h-11 rounded-md bg-[#5a0c14] px-4 text-sm font-medium text-white hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:opacity-60"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirm === "publish"}
        title="Publish in this preview?"
        description={
          <>
            It will show as <strong>Published</strong> in the admin. The public website does not change: going live needs the publishing list or the future backend.
          </>
        }
        confirmLabel="Publish"
        busy={submitting}
        onConfirm={() => finish("PUBLISHED")}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "discard"}
        title="Discard unsaved changes?"
        description="Your edits to this case study will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        tone="danger"
        onConfirm={() => {
          setConfirm(null);
          onClose();
        }}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
