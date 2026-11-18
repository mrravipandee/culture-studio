"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Eye, EyeOff, Info, Layers, Plus, SearchX, Trash2 } from "lucide-react";
import type { AdminCaseStudy, CaseStudyStatus } from "@/lib/admin/types";
import {
  CASE_STUDY_PAGE_SIZE,
  emptyCaseStudyFilters,
  emptyCaseStudyForm,
  filterCaseStudies,
  getCategories,
  hasCaseStudyFilters,
  toFormValues,
  type CaseStudyFilters,
  type CaseStudyFormValues,
} from "@/lib/admin/case-study-utils";
import { pageCount, paginate } from "@/lib/admin/enquiry-utils";
import ConfirmDialog from "../ConfirmDialog";
import EnquiryPagination from "../enquiries/EnquiryPagination";
import CaseStudyStats from "./CaseStudyStats";
import CaseStudyToolbar, { type CaseStudyView } from "./CaseStudyToolbar";
import { CaseStudyCard, CaseStudyRow, isLive, type CaseStudyItemActions } from "./CaseStudyItems";
import CaseStudyDetailPanel from "./CaseStudyDetailPanel";
import CaseStudyForm from "./CaseStudyForm";

/**
 * Case studies workspace: single source of truth for this page's UI state.
 * Every change (create, edit, publish, delete) is LOCAL to this browser tab: nothing is
 * persisted, nothing is uploaded, and the public website's publishing allowlist is never
 * touched. Replace `initial` and the handlers with API calls when the backend exists.
 */

const DESKTOP = "(min-width: 1280px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

type Confirm = { kind: "delete" | "publish" | "unpublish"; id: string } | null;
type FormState = { mode: "create" } | { mode: "edit"; id: string } | null;

interface Props {
  initial: AdminCaseStudy[];
  categoryOptions: string[];
  serviceOptions: string[];
  serifClassName: string;
}

export default function CaseStudiesWorkspace({ initial, categoryOptions, serviceOptions, serifClassName }: Props) {
  const [items, setItems] = useState<AdminCaseStudy[]>(initial);
  const [filters, setFilters] = useState<CaseStudyFilters>(emptyCaseStudyFilters);
  const [view, setView] = useState<CaseStudyView>("grid");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState(false);
  /** Synchronous guard against double confirmation clicks (state is async). */
  const confirmLock = useRef(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewUrls = useRef<Set<string>>(new Set());
  const localCount = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);

  const categories = useMemo(() => getCategories(items), [items]);
  const filtered = useMemo(() => filterCaseStudies(items, filters), [items, filters]);
  const pages = pageCount(filtered.length, CASE_STUDY_PAGE_SIZE);
  const current = Math.min(page, pages);
  const visible = paginate(filtered, current, CASE_STUDY_PAGE_SIZE);
  // Never show a stale record: the selection is always looked up in the current items.
  const selected = items.find((c) => c.id === selectedId) ?? null;
  const editing = form?.mode === "edit" ? items.find((c) => c.id === form.id) ?? null : null;
  const confirmItem = confirm ? items.find((c) => c.id === confirm.id) ?? null : null;

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  // Release local image previews when leaving the page.
  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  /* Filters */
  const changeFilters = (next: CaseStudyFilters) => {
    setFilters(next);
    setPage(1);
  };

  /* Selection */
  const select = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };
  const closeDetail = () => {
    setDrawerOpen(false);
    if (isDesktop) setSelectedId(null);
  };

  /* Create / edit */
  const openCreate = () => setForm({ mode: "create" });
  const openEdit = (id: string) => {
    if (!items.some((c) => c.id === id)) {
      notify("That case study no longer exists.");
      return;
    }
    setDrawerOpen(false);
    setForm({ mode: "edit", id });
  };

  const save = (values: CaseStudyFormValues, status: CaseStudyStatus) => {
    const now = new Date().toISOString();
    if (form?.mode === "edit") {
      const target = items.find((c) => c.id === form.id);
      if (!target) {
        notify("That case study no longer exists, so the changes could not be applied.");
        setForm(null);
        return;
      }
      setItems((list) => list.map((c) => (c.id === target.id ? { ...c, ...values, status, updatedAt: now } : c)));
      setSelectedId(target.id);
      notify(`Saved in this preview${status === "PUBLISHED" ? " as published" : " as a draft"}. Not saved to a server.`);
    } else {
      localCount.current += 1;
      const record: AdminCaseStudy = {
        ...values,
        id: `local-${Date.now().toString(36)}-${localCount.current}`,
        number: null,
        status,
        coverIsTemporary: false,
        createdAt: now,
        updatedAt: now,
        publicSlug: null,
        isLocal: true,
      };
      setItems((list) => [record, ...list]);
      changeFilters(emptyCaseStudyFilters);
      setSelectedId(record.id);
      notify("Case study added to this preview. It is not on the public website and resets on reload.");
    }
    setForm(null);
  };

  /* Publish / unpublish / delete (always confirmed) */
  /** Opening a new confirmation re-arms the double-click guard. */
  const ask = (next: NonNullable<Confirm>) => {
    confirmLock.current = false;
    setConfirm(next);
  };

  const actions: CaseStudyItemActions = {
    onSelect: select,
    onEdit: openEdit,
    onTogglePublish: (id) => {
      const c = items.find((x) => x.id === id);
      if (c) ask({ kind: c.status === "PUBLISHED" ? "unpublish" : "publish", id });
    },
    onDelete: (id) => ask({ kind: "delete", id }),
  };

  const runConfirm = () => {
    if (!confirm || busy || confirmLock.current) return;
    confirmLock.current = true;
    const target = items.find((c) => c.id === confirm.id);
    if (!target) {
      setConfirm(null);
      notify("That case study no longer exists.");
      confirmLock.current = false;
      return;
    }
    setBusy(true);
    if (confirm.kind === "delete") {
      if (selectedId === target.id) {
        const index = filtered.findIndex((c) => c.id === target.id);
        const remaining = filtered.filter((c) => c.id !== target.id);
        const next = remaining[Math.min(Math.max(index, 0), remaining.length - 1)] ?? null;
        setSelectedId(next?.id ?? null);
        if (!next) setDrawerOpen(false);
      }
      setItems((list) => list.filter((c) => c.id !== target.id));
      notify(`“${target.title}” removed from this preview. Nothing was deleted from the site.`);
    } else {
      const status: CaseStudyStatus = confirm.kind === "publish" ? "PUBLISHED" : "DRAFT";
      setItems((list) => list.map((c) => (c.id === target.id ? { ...c, status, updatedAt: new Date().toISOString() } : c)));
      notify(`${confirm.kind === "publish" ? "Published" : "Unpublished"} in this preview only. The public website has not changed.`);
    }
    setConfirm(null);
    setBusy(false);
  };

  /* Detail drawer below 1280px */
  const drawerVisible = drawerOpen && !isDesktop && selected !== null && form === null;
  useEffect(() => {
    if (!drawerVisible) return;
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("dialog[open]")) setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [drawerVisible]);

  /* Lock background scroll while the form is open */
  useEffect(() => {
    if (!form) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [form]);

  const emptyMessage =
    items.length === 0
      ? "No case studies in this preview. Reload the page to restore the approved projects, or add one."
      : filters.search.trim()
        ? `No case studies match “${filters.search.trim()}”.`
        : "No case studies match these filters.";

  const addButton = (
    <button
      type="button"
      onClick={openCreate}
      className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-[#5a0c14] px-4 text-sm font-medium text-white transition-colors hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
    >
      <Plus aria-hidden="true" size={17} /> Add Case Study
    </button>
  );

  const from = filtered.length === 0 ? 0 : (current - 1) * CASE_STUDY_PAGE_SIZE + 1;
  const to = Math.min(current * CASE_STUDY_PAGE_SIZE, filtered.length);

  return (
    <>
      <CaseStudyStats items={items} />

      <p className="mt-4 flex gap-2 rounded-lg border border-[#c08a2d]/20 bg-[#c08a2d]/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-[#6b4a12]">
        <Info aria-hidden="true" size={15} className="mt-px shrink-0" />
        The nine approved projects are real. Edits, publishing and deletions here are a preview kept in this tab only: they are not saved, nothing is uploaded, and the public website keeps using its publishing list.
      </p>

      <div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)] xl:gap-6">
        {/* Listing */}
        <section aria-label="Case studies" className="@container admin-fade-up min-w-0 rounded-xl border border-black/[0.08] bg-white/80 p-4 [animation-delay:320ms] sm:p-5">
          <div className="mb-4 flex justify-end xl:hidden">{addButton}</div>
          <CaseStudyToolbar filters={filters} categories={categories} view={view} onChange={changeFilters} onClear={() => changeFilters(emptyCaseStudyFilters)} onView={setView} />

          <div className="mt-5">
            {visible.length === 0 ? (
              <div className="admin-row-in grid place-items-center rounded-lg border border-dashed border-black/15 px-6 py-14 text-center">
                {items.length === 0 ? <Layers aria-hidden="true" size={28} strokeWidth={1.4} className="text-ink-3" /> : <SearchX aria-hidden="true" size={28} strokeWidth={1.4} className="text-ink-3" />}
                <p className="mt-3 max-w-sm text-sm text-ink-2">{emptyMessage}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {hasCaseStudyFilters(filters) && (
                    <button type="button" onClick={() => changeFilters(emptyCaseStudyFilters)} className="h-10 rounded-md border border-black/20 px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
                      Clear filters
                    </button>
                  )}
                  {items.length === 0 && addButton}
                </div>
              </div>
            ) : view === "grid" ? (
              <ul key="grid" className="admin-row-in grid grid-cols-1 gap-3.5 @[32rem]:grid-cols-2 @[40rem]:grid-cols-3">
                {visible.map((c) => (
                  <li key={c.id}>
                    <CaseStudyCard item={c} selected={c.id === selectedId} actions={actions} />
                  </li>
                ))}
              </ul>
            ) : (
              <ul key="list" className="admin-row-in divide-y divide-black/[0.06]">
                {visible.map((c) => (
                  <CaseStudyRow key={c.id} item={c} selected={c.id === selectedId} actions={actions} />
                ))}
              </ul>
            )}
          </div>

          <div className="mt-5 border-t border-black/[0.06] pt-4">
            <EnquiryPagination page={current} pages={pages} total={filtered.length} from={from} to={to} onPage={setPage} noun={filtered.length === 1 ? "case study" : "case studies"} />
          </div>
        </section>

        {/* Detail (desktop) */}
        <div className="hidden space-y-4 xl:sticky xl:top-6 xl:block">
          <div className="flex justify-end">{addButton}</div>
          <aside aria-labelledby={selected ? "case-study-detail-title" : undefined} aria-label={selected ? undefined : "Case study details"} className="admin-fade-up rounded-xl border border-black/[0.08] bg-white/80 [animation-delay:400ms]">
            <CaseStudyDetailPanel item={selected} actions={actions} onClose={closeDetail} serifClassName={serifClassName} />
          </aside>
        </div>
      </div>

      {/* Detail drawer (below 1280px) */}
      <div className="xl:hidden">
        <div aria-hidden="true" onClick={() => setDrawerOpen(false)} className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${drawerVisible ? "opacity-100" : "pointer-events-none opacity-0"}`} />
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-detail-title"
          inert={!drawerVisible}
          className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto overscroll-contain bg-[var(--cream)] shadow-[-12px_0_40px_-20px_rgba(36,12,14,0.4)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md ${
            drawerVisible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selected && <CaseStudyDetailPanel item={selected} actions={actions} onClose={() => setDrawerOpen(false)} variant="drawer" serifClassName={serifClassName} />}
        </div>
      </div>

      {/* Create / edit form */}
      {form && (form.mode === "create" || editing) && (
        <CaseStudyForm
          key={form.mode === "edit" ? form.id : "create"}
          mode={form.mode}
          initial={editing ? toFormValues(editing) : emptyCaseStudyForm}
          initialStatus={editing?.status ?? "DRAFT"}
          takenSlugs={items.filter((c) => c.id !== editing?.id).map((c) => c.slug)}
          categories={categoryOptions}
          serviceOptions={serviceOptions}
          serifClassName={serifClassName}
          onSubmit={save}
          onClose={() => setForm(null)}
          onPreviewUrl={(url) => previewUrls.current.add(url)}
        />
      )}

      <ConfirmDialog
        open={confirm?.kind === "delete" && confirmItem !== null}
        tone="danger"
        icon={<Trash2 size={20} strokeWidth={1.75} />}
        title={`Delete “${confirmItem?.title ?? ""}”?`}
        description="It will be removed from this preview only. The project files, images and the public website are not changed, and it returns when the page reloads."
        confirmLabel="Delete"
        busy={busy}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={(confirm?.kind === "publish" || confirm?.kind === "unpublish") && confirmItem !== null}
        icon={confirm?.kind === "unpublish" ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
        title={confirm?.kind === "unpublish" ? `Unpublish “${confirmItem?.title ?? ""}” in this preview?` : `Publish “${confirmItem?.title ?? ""}” in this preview?`}
        description={
          confirm?.kind === "unpublish" && confirmItem && isLive(confirmItem)
            ? "It will show as a draft here, but it stays live on the public website: the publishing list is not changed from the admin yet."
            : "This changes its status in the admin only. The public website is not changed: going live needs the publishing list or the future backend."
        }
        confirmLabel={confirm?.kind === "unpublish" ? "Unpublish" : "Publish"}
        busy={busy}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex justify-center px-4">
        {toast && <p className="admin-pop max-w-lg rounded-lg bg-[#240C0E] px-4 py-2.5 text-center text-sm text-[#F8F5F0] shadow-lg">{toast}</p>}
      </div>
    </>
  );
}
