"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { errorSummary, hasErrors, slugify, validateForm, type CaseStudyFormValues, type FormErrors } from "@/lib/admin/case-study-utils";
import type { AdminCaseStudy } from "@/lib/admin/types";
import ConfirmDialog from "../ConfirmDialog";
import { BasicSection, FiguresSection, ServicesSection } from "./CaseStudyFormSections";
import { ImagesSection, SeoSection } from "./CaseStudyMediaSections";

export type SubmitIntent = "save" | "publish";
export type SubmitResult = { ok: true } | { ok: false; message: string; fields?: FormErrors };

interface Props {
  mode: "create" | "edit";
  initial: CaseStudyFormValues;
  /** The stored record (edit mode). */
  record?: AdminCaseStudy;
  serifClassName: string;
  /** Saves (and publishes); resolves with server errors on failure. The form stays open with its values. */
  onSubmit: (values: CaseStudyFormValues, intent: SubmitIntent) => Promise<SubmitResult>;
  onClose: () => void;
  /** Opened because an action failed (e.g. publishing validation): show these at once. */
  initialErrors?: FormErrors;
  initialMessage?: string;
  /** Cloudinary is configured on the server: show the Upload buttons. */
  uploadsEnabled: boolean;
}

/**
 * Create / edit sheet. Validation runs with the server's own rules (drafts: content rules;
 * publish: + publishing rules) before anything is sent; server errors come back field by
 * field. Values are never lost on a failed request. Unsaved changes are protected (close,
 * Escape and leaving the page all ask first).
 */
export default function CaseStudyForm({ mode, initial, record, serifClassName, onSubmit, onClose, initialErrors, initialMessage, uploadsEnabled }: Props) {
  const [values, setValues] = useState<CaseStudyFormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>(initialErrors ?? {});
  const [formMessage, setFormMessage] = useState<string | null>(initialMessage ?? null);
  const [validated, setValidated] = useState<SubmitIntent | null>(initialErrors ? "publish" : null);
  const [slugTouched, setSlugTouched] = useState(mode === "edit" || initial.slug !== "");
  const [confirm, setConfirm] = useState<"publish" | "discard" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const body = useRef<HTMLDivElement>(null);
  const headingId = useId();

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initial), [values, initial]);
  const isPublished = record?.status === "PUBLISHED";
  const canPublishHere = !isPublished;

  const patch = (changes: Partial<CaseStudyFormValues>) => {
    const next = { ...values, ...changes };
    if (changes.title !== undefined && !slugTouched) next.slug = slugify(changes.title);
    setValues(next);
    if (validated) setErrors(validateForm(next, validated));
  };

  useEffect(() => {
    body.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, []);

  // Leaving the page (reload, close tab, navigation) with unsaved edits asks first.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const requestClose = () => {
    if (submitting) return;
    if (dirty) setConfirm("discard");
    else onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("dialog[open]")) return;
      e.preventDefault();
      if (submitting) return;
      if (dirty) setConfirm("discard");
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dirty, onClose, submitting]);

  const focusFirstError = () => requestAnimationFrame(() => body.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());

  const attempt = (intent: SubmitIntent) => {
    if (inFlight.current) return;
    setValidated(intent);
    setFormMessage(null);
    const found = validateForm(values, intent);
    setErrors(found);
    if (hasErrors(found)) {
      setFormMessage(intent === "publish" ? "Not ready to publish yet. Fix the highlighted fields." : "Please fix the highlighted fields.");
      focusFirstError();
      return;
    }
    if (intent === "publish") setConfirm("publish");
    else void finish("save");
  };

  const finish = async (intent: SubmitIntent) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setConfirm(null);
    const result = await onSubmit(values, intent);
    inFlight.current = false;
    setSubmitting(false);
    if (!result.ok) {
      setErrors(result.fields ?? {});
      setFormMessage(result.message);
      if (result.fields) focusFirstError();
    }
  };

  const summary = errorSummary(errors);
  const statusLine = mode === "create" ? "New case studies are saved as drafts." : isPublished ? "Published: changes go live when saved." : record?.status === "ARCHIVED" ? "Archived: not on the website." : "Draft: not on the website.";

  return (
    <>
      <div className="fixed inset-0 z-[70]">
        <div aria-hidden="true" onClick={requestClose} className="admin-overlay-in absolute inset-0 bg-black/45" />
        <div role="dialog" aria-modal="true" aria-labelledby={headingId} aria-busy={submitting} className="admin-sheet-in absolute inset-y-0 right-0 flex w-full flex-col bg-[var(--cream)] shadow-[-16px_0_48px_-24px_rgba(36,12,14,0.5)] sm:max-w-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-black/10 px-5 py-4 sm:px-8 sm:py-5">
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-burgundy">{mode === "create" ? "New case study" : "Edit case study"}</p>
              <h2 id={headingId} className={`${serifClassName} mt-1 truncate text-[1.75rem] font-medium leading-tight text-[#1a0a0c]`}>
                {mode === "create" ? "Add Case Study" : values.title || initial.title}
              </h2>
            </div>
            <button type="button" onClick={requestClose} aria-label="Close form" className="grid size-10 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-black/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-burgundy">
              <X aria-hidden="true" size={20} />
            </button>
          </div>

          <div ref={body} className="flex-1 space-y-9 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8">
            {formMessage && (
              <div role="alert" className="flex gap-2 rounded-lg border border-[#a3242f]/25 bg-[#a3242f]/[0.05] p-3 text-sm text-[#a3242f]">
                <AlertCircle aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p>{formMessage}</p>
                  {summary.length > 0 && <p className="mt-1 text-xs">Check: {summary.join(", ")}.</p>}
                  {errors.slugSuggestion && (
                    <button
                      type="button"
                      onClick={() => {
                        setSlugTouched(true);
                        patch({ slug: errors.slugSuggestion });
                      }}
                      className="mt-2 rounded-md border border-[#a3242f]/30 px-2.5 py-1 text-xs font-medium hover:bg-[#a3242f]/10 focus-visible:outline-2 focus-visible:outline-burgundy"
                    >
                      Use “{errors.slugSuggestion}”
                    </button>
                  )}
                </div>
              </div>
            )}

            <BasicSection values={values} errors={errors} patch={patch} onSlugEdit={() => setSlugTouched(true)} publicSlugNote={isPublished && values.slug !== initial.slug ? `the old address /case-studies/${initial.slug} will redirect here` : undefined} />
            <ServicesSection values={values} errors={errors} patch={patch} />
            <FiguresSection values={values} errors={errors} patch={patch} />
            <ImagesSection values={values} errors={errors} patch={patch} uploadsEnabled={uploadsEnabled} />
            <SeoSection values={values} errors={errors} patch={patch} uploadsEnabled={uploadsEnabled} />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-black/10 bg-[var(--cream)] px-4 py-3.5 sm:gap-2.5 sm:px-8 sm:py-4">
            <p className="mr-auto hidden text-xs text-ink-3 sm:block">{submitting ? "Saving…" : statusLine}</p>
            <button type="button" onClick={requestClose} disabled={submitting} className="h-11 rounded-md px-3 text-sm font-medium text-ink hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-50 sm:px-4">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => attempt("save")}
              disabled={submitting || (mode === "edit" && !dirty)}
              className={`h-11 rounded-md px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:opacity-50 ${isPublished ? "bg-[#5a0c14] text-white hover:bg-[#6b111b]" : "border border-black/20 bg-white text-ink hover:border-black/40"}`}
            >
              {isPublished ? "Save changes" : mode === "create" ? "Save Draft" : "Save"}
            </button>
            {canPublishHere && (
              <button type="button" onClick={() => attempt("publish")} disabled={submitting} className="h-11 rounded-md bg-[#5a0c14] px-4 text-sm font-medium text-white hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:opacity-60">
                {dirty || mode === "create" ? "Save & Publish" : "Publish"}
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirm === "publish"}
        title="Publish this case study?"
        description={<>It will be saved and go live at <strong>/case-studies/{values.slug || slugify(values.title)}</strong>, in the listing, the sitemap{values.featured ? " and on the Home page" : ""}.</>}
        confirmLabel="Publish"
        busy={submitting}
        onConfirm={() => void finish("publish")}
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
