"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/react";
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, FileWarning, Info, Pencil, Send, Trash2 } from "lucide-react";
import type { BlogStatus } from "@/lib/admin/types";
import {
  BLOG_LIMITS,
  blogStats,
  blogToForm,
  emptyBlogForm,
  formatBlogAdminDate,
  hasBlogErrors,
  slugify,
  validateBlog,
  type BlogFormErrors,
  type BlogFormValues,
} from "@/lib/admin/blog-utils";
import { readingTimeLabel, type RichNode } from "@/lib/rich-text";
import ConfirmDialog from "../ConfirmDialog";
import CaseStudyCover from "../case-studies/CaseStudyCover";
import BlogArticle from "@/components/blog/BlogArticle";
import { useBlogStore } from "./BlogStore";
import ImagePicker, { type LibraryImage } from "./ImagePicker";
import RichTextEditor from "./editor/RichTextEditor";
import { FieldError, PublishingPanel, SeoPanel } from "./BlogSidePanels";

interface Props {
  mode: "create" | "edit";
  postId?: string;
  siteUrl: string;
  today: string;
  library: LibraryImage[];
  serifClassName: string;
  startInPreview?: boolean;
}

type Confirm = { kind: "publish" | "update" | "unpublish" | "delete" } | { kind: "leave"; href: string } | null;

export default function BlogEditorWorkspace(props: Props) {
  const store = useBlogStore();
  const post = props.postId ? store.items.find((b) => b.id === props.postId) : undefined;

  if (props.mode === "edit" && !post) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div>
          <FileWarning aria-hidden="true" size={32} strokeWidth={1.4} className="mx-auto text-ink-3" />
          <h1 className={`${props.serifClassName} mt-4 text-3xl text-[#1a0a0c]`}>Article not found</h1>
          <p className="mt-2 max-w-sm text-sm text-ink-2">It may have been deleted in this preview, or the link is wrong. Preview changes reset when the page reloads.</p>
          <Link href="/admin/blogs" className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-[#5a0c14] px-4 text-sm font-medium text-white hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy">
            <ArrowLeft aria-hidden="true" size={16} /> All articles
          </Link>
        </div>
      </div>
    );
  }
  // Remount when switching records so all state starts from that record.
  return <EditorForm key={post?.id ?? "new"} {...props} />;
}

function EditorForm({ mode, postId, siteUrl, today, library, serifClassName, startInPreview = false }: Props) {
  const store = useBlogStore();
  const router = useRouter();
  const post = postId ? store.items.find((b) => b.id === postId) : undefined;
  const status: BlogStatus | "NEW" = post?.status ?? "NEW";

  const [baseline, setBaseline] = useState<BlogFormValues>(() => (post ? blogToForm(post) : emptyBlogForm()));
  const [values, setValues] = useState<BlogFormValues>(baseline);
  const [errors, setErrors] = useState<BlogFormErrors>({});
  const [submitted, setSubmitted] = useState<"draft" | "publish" | null>(null);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [savedAt, setSavedAt] = useState<string | null>(post?.updatedAt ?? null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [preview, setPreview] = useState(startInPreview);
  const editorRef = useRef<Editor | null>(null);
  const lock = useRef(false);
  const allowLeave = useRef(false);

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(baseline), [values, baseline]);
  const { words, readingTime } = blogStats(values.content);
  const takenSlugs = useMemo(() => store.items.filter((b) => b.id !== postId).map((b) => b.slug), [store.items, postId]);

  /** Latest values, including editor content that is still inside the debounce window. */
  const current = useCallback((): BlogFormValues => {
    const json = editorRef.current?.getJSON() as RichNode | undefined;
    return json ? { ...values, content: json } : values;
  }, [values]);

  const patch = (changes: Partial<BlogFormValues>) => {
    const next = { ...values, ...changes };
    if (changes.title !== undefined && !slugTouched) next.slug = slugify(changes.title);
    setValues(next);
    if (saveState === "saved") setSaveState("idle");
    if (submitted) setErrors(validateBlog(next, { takenSlugs, intent: submitted, today }));
  };

  /* Unsaved changes: browser close/reload and in-app links */
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const onClick = (e: MouseEvent) => {
      if (allowLeave.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      setConfirm({ kind: "leave", href: url.pathname + url.search + url.hash });
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  /* Saving */
  const validate = (intent: "draft" | "publish") => {
    const v = current();
    setValues(v);
    setSubmitted(intent);
    const found = validateBlog(v, { takenSlugs, intent, today });
    setErrors(found);
    if (hasBlogErrors(found)) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return null;
    }
    return v;
  };

  const commit = (v: BlogFormValues, nextStatus: BlogStatus, message: string) => {
    if (lock.current) return;
    lock.current = true;
    setSaveState("saving");
    const saved = post ? store.update(post.id, v, nextStatus) : store.create(v, nextStatus);
    if (!saved) {
      store.notify("This article no longer exists in the preview, so it could not be saved.");
      setSaveState("idle");
      lock.current = false;
      return;
    }
    setBaseline(v);
    setValues(v);
    setSavedAt(saved.updatedAt);
    setSaveState("saved");
    setErrors({});
    setSubmitted(null);
    store.notify(message);
    if (!post) {
      allowLeave.current = true;
      router.replace(`/admin/blogs/${saved.id}/edit`);
    }
    // Release after this tick so a second click on the same button is ignored.
    setTimeout(() => {
      lock.current = false;
    }, 0);
  };

  const saveDraft = () => {
    const v = validate("draft");
    if (v) commit(v, "DRAFT", "Draft saved locally in this tab (not on a server).");
  };
  const askPublish = (kind: "publish" | "update") => {
    if (validate("publish")) {
      lock.current = false;
      setConfirm({ kind });
    }
  };
  const runConfirm = () => {
    if (!confirm) return;
    const c = confirm;
    setConfirm(null);
    if (c.kind === "leave") {
      allowLeave.current = true;
      router.push(c.href);
      return;
    }
    if (c.kind === "delete") {
      if (post) store.remove([post.id]);
      store.notify("Article removed from this preview. Nothing was deleted from the site.");
      allowLeave.current = true;
      router.push("/admin/blogs");
      return;
    }
    if (c.kind === "unpublish") {
      const v = validate("draft");
      if (v) commit(v, "DRAFT", "Unpublished in this preview. The public website has not changed.");
      return;
    }
    const v = current();
    commit(v, "PUBLISHED", c.kind === "publish" ? "Published in this preview only. The public website has not changed." : "Published article updated in this preview (not on a server).");
  };

  const openPreview = () => {
    setValues(current());
    setPreview(true);
    window.scrollTo({ top: 0 });
  };

  const stateLabel =
    saveState === "saving"
      ? "Saving locally…"
      : dirty
        ? "Unsaved changes"
        : saveState === "saved" && savedAt
          ? `Saved locally · ${formatBlogAdminDate(savedAt, true)}`
          : savedAt
            ? `Last updated ${formatBlogAdminDate(savedAt, true)}`
            : "Not saved yet";
  const errorList = Object.values(errors).filter(Boolean) as string[];
  const ids = { title: "blog-title", slug: "blog-slug", excerpt: "blog-excerpt", content: "blog-content-error", alt: "blog-cover-alt", caption: "blog-cover-caption" };

  return (
    <div className="min-h-screen">
      {/* Sticky action bar */}
      <div className="sticky top-0 z-30 border-b border-black/10 bg-[var(--cream)]/95 backdrop-blur-sm max-md:top-16">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6 lg:px-10">
          <Link href="/admin/blogs" className="inline-flex items-center gap-1.5 rounded-md py-1 text-sm font-medium text-ink-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-burgundy">
            <ArrowLeft aria-hidden="true" size={16} /> <span className="hidden sm:inline">All articles</span>
          </Link>
          <p aria-live="polite" className={`mr-auto inline-flex items-center gap-1.5 text-xs ${dirty ? "text-[#a86b12]" : "text-ink-3"}`}>
            {!dirty && saveState === "saved" && <Check aria-hidden="true" size={13} />}
            {stateLabel}
          </p>
          {preview ? (
            <button type="button" onClick={() => setPreview(false)} className="inline-flex h-10 items-center gap-2 rounded-md border border-black/20 bg-white px-3.5 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
              <Pencil aria-hidden="true" size={15} /> Back to editor
            </button>
          ) : (
            <button type="button" onClick={openPreview} className="inline-flex h-10 items-center gap-2 rounded-md border border-black/20 bg-white px-3.5 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
              <Eye aria-hidden="true" size={15} /> Preview
            </button>
          )}
          {status === "PUBLISHED" ? (
            <>
              <button type="button" onClick={() => setConfirm({ kind: "unpublish" })} className="inline-flex h-10 items-center gap-2 rounded-md border border-black/20 bg-white px-3.5 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
                <EyeOff aria-hidden="true" size={15} /> Unpublish
              </button>
              <button type="button" onClick={() => askPublish("update")} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#5a0c14] px-4 text-sm font-medium text-white hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy">
                <Send aria-hidden="true" size={15} /> Update
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={saveDraft} className="inline-flex h-10 items-center gap-2 rounded-md border border-black/20 bg-white px-3.5 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
                Save Draft
              </button>
              <button type="button" onClick={() => askPublish("publish")} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#5a0c14] px-4 text-sm font-medium text-white hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy">
                <Send aria-hidden="true" size={15} /> Publish
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview (private, admin only) */}
      {preview && (
        <div className="admin-detail-in mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <p className="mx-auto mb-8 flex max-w-3xl items-start gap-2 rounded-lg border border-[#c08a2d]/25 bg-[#c08a2d]/[0.07] p-3 text-xs leading-relaxed text-[#6b4a12]">
            <Info aria-hidden="true" size={15} className="mt-px shrink-0" />
            Private preview inside the admin, styled like the public article page. It is not available on the public website.
          </p>
          <BlogArticle
            allowBlobImages
            article={{
              title: values.title || "Untitled article",
              category: values.category || "No category",
              excerpt: values.excerpt,
              author: values.author || "CULT.URE",
              dateLabel: formatBlogAdminDate(values.publishDate ? `${values.publishDate}T10:00:00+05:30` : post?.publishedAt ?? new Date().toISOString()) ?? "",
              dateIso: values.publishDate || null,
              readingTime: words ? readingTimeLabel(words) : "No content yet",
              coverImage: values.coverImage,
              coverImageAlt: values.coverImageAlt,
              coverCaption: values.coverCaption,
              content: values.content,
            }}
          />
        </div>
      )}

      {/* Editor (kept mounted during preview so undo history is preserved) */}
      <div hidden={preview} className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <p className="mb-5 flex items-start gap-2 text-xs text-ink-3">
          <Info aria-hidden="true" size={14} className="mt-px shrink-0" />
          {mode === "create" ? "New article." : `Editing “${baseline.title}”.`} Changes are kept in this browser tab only; nothing is uploaded or published to the website.
        </p>

        {errorList.length > 0 && (
          <div role="alert" className="mb-6 rounded-lg border border-[#a3242f]/25 bg-[#a3242f]/[0.05] p-4 text-sm text-[#a3242f]">
            <p className="flex items-center gap-2 font-medium">
              <AlertCircle aria-hidden="true" size={16} />
              {submitted === "publish" ? "Not ready to publish yet:" : "Please fix:"}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              {errorList.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-10">
          {/* Writing canvas */}
          <div className="admin-fade-up min-w-0 space-y-6">
            <div>
              <label htmlFor={ids.title} className="sr-only">
                Article title
              </label>
              <textarea
                id={ids.title}
                rows={1}
                value={values.title}
                maxLength={BLOG_LIMITS.title + 30}
                onChange={(e) => patch({ title: e.target.value.replace(/\n/g, " ") })}
                placeholder="Article title"
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? `${ids.title}-error` : undefined}
                className={`${serifClassName} field-sizing-content w-full resize-none border-0 bg-transparent p-0 text-[2.25rem] font-medium leading-[1.1] text-[#1a0a0c] placeholder:text-ink-4 focus-visible:outline-none sm:text-5xl`}
              />
              <div className="mt-2 flex items-center justify-between gap-3 border-b border-black/10 pb-3">
                <FieldError id={`${ids.title}-error`} error={errors.title} />
                <span className={`ml-auto text-xs tabular-nums ${values.title.length > BLOG_LIMITS.title ? "text-[#a3242f]" : "text-ink-3"}`}>
                  {values.title.length}/{BLOG_LIMITS.title}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor={ids.slug} className="text-sm font-medium text-ink">
                Slug
              </label>
              <div className={`mt-1.5 flex items-center overflow-hidden rounded-lg border bg-white focus-within:outline-2 focus-within:outline-burgundy ${errors.slug ? "border-[#a3242f]" : "border-black/15"}`}>
                <span className="shrink-0 border-r border-black/10 bg-black/[0.03] px-3 py-2.5 font-mono text-xs text-ink-3">/blog/</span>
                <input
                  id={ids.slug}
                  value={values.slug}
                  maxLength={100}
                  onChange={(e) => {
                    setSlugTouched(true);
                    patch({ slug: e.target.value.toLowerCase() });
                  }}
                  spellCheck={false}
                  autoCapitalize="none"
                  aria-invalid={errors.slug ? true : undefined}
                  aria-describedby={`${ids.slug}-help${errors.slug ? ` ${ids.slug}-error` : ""}`}
                  className="h-11 min-w-0 flex-1 bg-transparent px-3 font-mono text-[0.8125rem] text-ink outline-none"
                />
                {slugTouched && values.title && slugify(values.title) !== values.slug && (
                  <button
                    type="button"
                    onClick={() => {
                      setSlugTouched(false);
                      patch({ slug: slugify(values.title) });
                    }}
                    className="mr-1.5 h-8 shrink-0 rounded-md px-2.5 text-xs font-medium text-burgundy hover:bg-burgundy/5 focus-visible:outline-2 focus-visible:outline-burgundy"
                  >
                    Use title
                  </button>
                )}
              </div>
              <p id={`${ids.slug}-help`} className="mt-1 text-xs text-ink-3">
                {slugTouched ? "Edited by hand: it won't change with the title." : "Follows the title until you edit it."}
              </p>
              <FieldError id={`${ids.slug}-error`} error={errors.slug} />
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={ids.excerpt} className="text-sm font-medium text-ink">
                  Excerpt
                </label>
                <span className={`text-xs tabular-nums ${values.excerpt.length > BLOG_LIMITS.excerpt ? "text-[#a3242f]" : values.excerpt.length > BLOG_LIMITS.excerptIdeal[1] ? "text-[#a86b12]" : "text-ink-3"}`}>
                  {values.excerpt.length} · aim for {BLOG_LIMITS.excerptIdeal[0]}–{BLOG_LIMITS.excerptIdeal[1]}
                </span>
              </div>
              <textarea
                id={ids.excerpt}
                rows={3}
                value={values.excerpt}
                maxLength={BLOG_LIMITS.excerpt + 50}
                onChange={(e) => patch({ excerpt: e.target.value })}
                placeholder="A one or two sentence summary for cards and search results."
                aria-invalid={errors.excerpt ? true : undefined}
                aria-describedby={errors.excerpt ? `${ids.excerpt}-error` : undefined}
                className={`mt-1.5 w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[0.9375rem] leading-relaxed text-ink placeholder:text-ink-3 focus-visible:outline-2 focus-visible:outline-burgundy ${errors.excerpt ? "border-[#a3242f]" : "border-black/15"}`}
              />
              <FieldError id={`${ids.excerpt}-error`} error={errors.excerpt} />
            </div>

            {/* Cover */}
            <section aria-label="Cover image" className="rounded-xl border border-black/[0.08] bg-white/70 p-4 sm:p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-medium text-ink">Cover image</h2>
                <span className="text-xs text-ink-3">16:9 · at least 1600 × 900 px</span>
              </div>
              <CaseStudyCover src={values.coverImage} alt={values.coverImageAlt} label={values.title.charAt(0) || "—"} sizes="(min-width: 1024px) 50vw, 100vw" className={`mt-3 aspect-[16/9] rounded-lg ${errors.coverImage ? "ring-2 ring-[#a3242f]" : ""}`} />
              <FieldError id="blog-cover-error" error={errors.coverImage} />
              <div className="mt-3 flex flex-wrap items-start gap-2">
                <div className="min-w-0 flex-1">
                  <ImagePicker library={library} selected={values.coverImage} onPreviewUrl={store.trackPreview} label={values.coverImage ? "Replace image" : "Choose a file"} onPick={(src, alt) => patch({ coverImage: src, coverImageAlt: values.coverImageAlt || alt })} />
                </div>
                {values.coverImage && (
                  <button type="button" onClick={() => patch({ coverImage: null, coverImageAlt: "", coverCaption: "" })} className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-[#a3242f] hover:bg-[#a3242f]/5 focus-visible:outline-2 focus-visible:outline-burgundy">
                    <Trash2 aria-hidden="true" size={15} /> Remove
                  </button>
                )}
              </div>
              {values.coverImage && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={ids.alt} className="text-sm font-medium text-ink">
                      Alt text
                    </label>
                    <input
                      id={ids.alt}
                      value={values.coverImageAlt}
                      maxLength={BLOG_LIMITS.alt + 20}
                      onChange={(e) => patch({ coverImageAlt: e.target.value })}
                      aria-invalid={errors.coverImageAlt ? true : undefined}
                      aria-describedby={errors.coverImageAlt ? `${ids.alt}-error` : undefined}
                      className={`mt-1.5 h-11 w-full rounded-lg border bg-white px-3.5 text-sm focus-visible:outline-2 focus-visible:outline-burgundy ${errors.coverImageAlt ? "border-[#a3242f]" : "border-black/15"}`}
                    />
                    <FieldError id={`${ids.alt}-error`} error={errors.coverImageAlt} />
                  </div>
                  <div>
                    <label htmlFor={ids.caption} className="text-sm font-medium text-ink">
                      Caption <span className="font-normal text-ink-3">(optional)</span>
                    </label>
                    <input id={ids.caption} value={values.coverCaption} maxLength={BLOG_LIMITS.caption + 20} onChange={(e) => patch({ coverCaption: e.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-black/15 bg-white px-3.5 text-sm focus-visible:outline-2 focus-visible:outline-burgundy" />
                  </div>
                </div>
              )}
            </section>

            {/* Body */}
            <section aria-label="Article body">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-medium text-ink">Article</h2>
                <span className="text-xs text-ink-3">
                  {words} words · {readingTime}
                </span>
              </div>
              <RichTextEditor
                initialContent={values.content}
                onChange={(doc) => patch({ content: doc })}
                editorRef={editorRef}
                library={library}
                onPreviewUrl={store.trackPreview}
                invalid={Boolean(errors.content)}
                describedBy={errors.content ? ids.content : undefined}
              />
              <FieldError id={ids.content} error={errors.content} />
              <p className="mt-2 text-xs text-ink-3">Tip: the title above is the page&rsquo;s main heading, so start sections with Heading 2.</p>
            </section>
          </div>

          {/* Sidebar */}
          <aside aria-label="Article settings" className="admin-fade-up space-y-4 [animation-delay:120ms] lg:sticky lg:top-24">
            <PublishingPanel values={values} errors={errors} patch={patch} status={status} words={words} readingTime={readingTime} today={today} />
            <SeoPanel values={values} errors={errors} patch={patch} siteUrl={siteUrl} />
            {post && (
              <button type="button" onClick={() => setConfirm({ kind: "delete" })} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#a3242f]/25 bg-[#a3242f]/[0.04] text-sm font-medium text-[#a3242f] hover:bg-[#a3242f]/10 focus-visible:outline-2 focus-visible:outline-[#a3242f]">
                <Trash2 aria-hidden="true" size={16} /> Delete article
              </button>
            )}
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={confirm?.kind === "publish" || confirm?.kind === "update"}
        icon={<Send size={20} strokeWidth={1.75} />}
        title={confirm?.kind === "update" ? "Update the published article?" : "Publish this article?"}
        description="It will show as Published in the admin. The public website does not change: going live needs the blog publishing list or the future backend."
        confirmLabel={confirm?.kind === "update" ? "Update" : "Publish"}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === "unpublish"}
        icon={<EyeOff size={20} strokeWidth={1.75} />}
        title="Unpublish this article?"
        description="It becomes a draft in the admin. Your content and any unsaved edits are kept as the draft."
        confirmLabel="Unpublish"
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === "delete"}
        tone="danger"
        icon={<Trash2 size={20} strokeWidth={1.75} />}
        title={`Delete “${baseline.title || "this article"}”?`}
        description="Removed from this preview only. Nothing on the website or in the project files is deleted."
        confirmLabel="Delete"
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === "leave"}
        tone="danger"
        title="Leave without saving?"
        description="You have unsaved changes to this article. They will be lost."
        confirmLabel="Leave"
        cancelLabel="Keep editing"
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
