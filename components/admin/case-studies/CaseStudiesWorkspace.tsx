"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AlertTriangle, Archive, Eye, EyeOff, Layers, Plus, RotateCcw, SearchX, Trash2 } from "lucide-react";
import type { AdminCaseStudy, CaseStudyListResult } from "@/lib/admin/types";
import { CASE_STUDY_PAGE_SIZE } from "@/lib/case-studies/constants";
import { emptyCaseStudyForm, toFormValues, type CaseStudyFormValues, type FormErrors } from "@/lib/admin/case-study-utils";
import type { ApiResult } from "../settings/settings-api";
import ConfirmDialog from "../ConfirmDialog";
import EnquiryPagination from "../enquiries/EnquiryPagination";
import CaseStudyStats from "./CaseStudyStats";
import CaseStudyToolbar, { emptyCaseStudyFilters, hasCaseStudyFilters, type CaseStudyFilters, type CaseStudyView } from "./CaseStudyToolbar";
import { CaseStudyCard, CaseStudyRow, type CaseStudyCommand, type CaseStudyItemActions } from "./CaseStudyItems";
import CaseStudyDetailPanel from "./CaseStudyDetailPanel";
import CaseStudyForm, { type SubmitIntent, type SubmitResult } from "./CaseStudyForm";
import { createCaseStudy, deleteCaseStudy, fetchList, fetchOne, listUrl, runAction, updateCaseStudy } from "./case-study-api";

/**
 * Case studies workspace (MongoDB via /api/admin/case-studies). Owns the page state: list
 * query, selection, the editor sheet and confirmations. Every action calls the API and then
 * reloads the list, so what you see is what is stored. Status changes are always confirmed.
 */

const DESKTOP = "(min-width: 1280px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

type StatusCommand = Exclude<CaseStudyCommand, "edit">;
type Confirm = { command: StatusCommand; record: AdminCaseStudy; slug?: string } | null;
type FormState = { mode: "create" } | { mode: "edit"; record: AdminCaseStudy; initial: CaseStudyFormValues; errors?: FormErrors; message?: string } | null;

const CONFIRM_COPY: Record<StatusCommand, { title: (t: string) => string; description: string; label: string; icon: React.ReactNode; danger?: boolean }> = {
  publish: { title: (t) => `Publish “${t}”?`, description: "It goes live on the website, the listing and the sitemap straight away.", label: "Publish", icon: <Eye size={20} strokeWidth={1.75} /> },
  unpublish: { title: (t) => `Unpublish “${t}”?`, description: "It is removed from the website immediately and becomes a draft. Its content is kept.", label: "Unpublish", icon: <EyeOff size={20} strokeWidth={1.75} /> },
  archive: { title: (t) => `Archive “${t}”?`, description: "It is removed from the website and kept in the admin as archived. You can restore it as a draft later.", label: "Archive", icon: <Archive size={20} strokeWidth={1.75} /> },
  restore: { title: (t) => `Restore “${t}” as a draft?`, description: "It comes back as a draft (not public). Publish it separately when it is ready.", label: "Restore", icon: <RotateCcw size={20} strokeWidth={1.75} /> },
  delete: { title: (t) => `Delete “${t}”?`, description: "It is removed from the website and the normal lists. It is kept in the database and can be restored from the Deleted view.", label: "Delete", icon: <Trash2 size={20} strokeWidth={1.75} />, danger: true },
};

const DONE: Record<StatusCommand, string> = { publish: "Published", unpublish: "Unpublished", archive: "Archived", restore: "Restored as a draft", delete: "Deleted" };

export default function CaseStudiesWorkspace({ serifClassName, uploadsEnabled }: { serifClassName: string; uploadsEnabled: boolean }) {
  const [filters, setFilters] = useState<CaseStudyFilters>(emptyCaseStudyFilters);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<CaseStudyView>("grid");
  const [data, setData] = useState<CaseStudyListResult | null>(null);
  /** Request key of the last completed load; "loading" is derived from it (no setState in effects). */
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<AdminCaseStudy | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [toast, setToast] = useState<{ text: string; tone: "ok" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);

  const notify = useCallback((text: string, tone: "ok" | "error" = "ok") => {
    setToast({ text, tone });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);
  useEffect(() => () => void (toastTimer.current && clearTimeout(toastTimer.current)), []);

  // Search is debounced; other filters apply at once.
  useEffect(() => {
    const t = setTimeout(() => setSearch(filters.search.trim()), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const url = listUrl(filters, search, page, CASE_STUDY_PAGE_SIZE);
  const requestKey = `${url}#${reloadKey}`;
  const loading = loadedKey !== requestKey;
  useEffect(() => {
    const controller = new AbortController();
    const key = `${url}#${reloadKey}`;
    fetchList(url, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.ok) {
          setData(result.data);
          setLoadError(null);
          if (result.data.page > result.data.pages) setPage(result.data.pages);
          setSelected((current) => (current ? (result.data.items.find((c) => c.id === current.id) ?? current) : null));
        } else setLoadError(result.error.message);
        setLoadedKey(key);
      })
      .catch(() => undefined); // aborted
    return () => controller.abort();
  }, [url, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);
  const changeFilters = (next: CaseStudyFilters) => {
    setFilters(next);
    setPage(1);
  };

  /* Selection */
  const select = (id: string) => {
    const record = data?.items.find((c) => c.id === id);
    if (!record) return;
    setSelected(record);
    setDrawerOpen(true);
  };
  const closeDetail = () => {
    setDrawerOpen(false);
    if (isDesktop) setSelected(null);
  };

  /* Editor */
  const openEdit = async (record: AdminCaseStudy, errors?: FormErrors, message?: string) => {
    const fresh = await fetchOne(record.id); // always edit the latest stored version
    if (!fresh.ok) {
      notify(fresh.status === 404 ? "That case study no longer exists." : fresh.error.message, "error");
      if (fresh.status === 404) reload();
      return;
    }
    setDrawerOpen(false);
    setForm({ mode: "edit", record: fresh.data, initial: toFormValues(fresh.data), errors, message });
  };

  const failure = (result: Extract<ApiResult<unknown>, { ok: false }>): SubmitResult => {
    const fields = { ...(result.error.fields ?? {}) };
    const message = result.error.code === "STALE_RECORD" ? "Someone else changed this case study. Close the editor and open it again to see the latest version (your edits are still here)." : result.error.message;
    return { ok: false, message, fields };
  };

  const submit = async (values: CaseStudyFormValues, intent: SubmitIntent): Promise<SubmitResult> => {
    if (!form) return { ok: false, message: "The editor was closed." };
    const saved = form.mode === "create" ? await createCaseStudy(values) : await updateCaseStudy(form.record, form.initial, values);
    if (!saved.ok) return failure(saved);

    let record = saved.data;
    if (intent === "publish") {
      const published = await runAction(record, "publish");
      if (!published.ok) {
        // Saved, but not published: keep editing the stored version with the reasons shown.
        setForm({ mode: "edit", record, initial: toFormValues(record), errors: published.error.fields, message: `Saved as a draft, but not published: ${published.error.message}` });
        reload();
        return failure(published);
      }
      record = published.data;
    }
    setForm(null);
    setSelected(record);
    if (form.mode === "create") changeFilters(emptyCaseStudyFilters);
    reload();
    notify(intent === "publish" ? `“${record.title}” is published.` : form.mode === "create" ? `“${record.title}” saved as a draft.` : `Changes to “${record.title}” saved.`);
    return { ok: true };
  };

  /* Commands */
  const onCommand = (id: string, command: CaseStudyCommand) => {
    const record = data?.items.find((c) => c.id === id) ?? (selected?.id === id ? selected : null);
    if (!record) return;
    if (command === "edit") void openEdit(record);
    else {
      lock.current = false;
      setConfirm({ command, record });
    }
  };
  const actions: CaseStudyItemActions = { onSelect: select, onCommand };

  const runConfirm = async () => {
    if (!confirm || lock.current) return;
    lock.current = true;
    setBusy(true);
    const { command, record, slug } = confirm;
    const result = command === "delete" ? await deleteCaseStudy(record) : await runAction(record, command, slug);
    setBusy(false);
    setConfirm(null);

    if (result.ok) {
      notify(`${DONE[command]}: “${record.title}”.`);
      if (command === "delete") setSelected(null);
      else if ("slug" in result.data) setSelected(result.data);
      reload();
      return;
    }
    const code = result.error.code;
    if (code === "PUBLISH_VALIDATION") {
      notify("Not ready to publish. The editor shows what to fix.", "error");
      void openEdit(record, result.error.fields, result.error.message);
    } else if (code === "SLUG_TAKEN" && command === "restore" && result.error.fields?.slugSuggestion) {
      lock.current = false;
      setConfirm({ command: "restore", record, slug: result.error.fields.slugSuggestion });
    } else {
      notify(code === "STALE_RECORD" ? "It was changed elsewhere. The list has been refreshed; try again." : result.error.message, "error");
      if (code === "STALE_RECORD" || code === "NOT_FOUND" || code === "INVALID_TRANSITION") reload();
    }
  };

  /* Drawer below 1280px */
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

  useEffect(() => {
    if (!form) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [form]);

  const items = data?.items ?? [];
  const filtered = data?.filtered ?? 0;
  const pages = data?.pages ?? 1;
  const current = Math.min(page, pages);
  const from = filtered === 0 ? 0 : (current - 1) * CASE_STUDY_PAGE_SIZE + 1;
  const to = Math.min(current * CASE_STUDY_PAGE_SIZE, filtered);
  const nothingStored = data !== null && data.counts.all === 0 && data.counts.deleted === 0;

  const addButton = (
    <button type="button" onClick={() => setForm({ mode: "create" })} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-[#5a0c14] px-4 text-sm font-medium text-white transition-colors hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy">
      <Plus aria-hidden="true" size={17} /> Add Case Study
    </button>
  );

  const copy = confirm ? CONFIRM_COPY[confirm.command] : null;

  let listBody: React.ReactNode;
  if (loading && data === null) {
    listBody = (
      <ul aria-label="Loading case studies" className="grid grid-cols-1 gap-3.5 @[32rem]:grid-cols-2 @[40rem]:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="h-56 animate-pulse rounded-xl border border-black/[0.06] bg-black/[0.04] motion-reduce:animate-none" />
        ))}
      </ul>
    );
  } else if (loadError && data === null) {
    listBody = (
      <div role="alert" className="grid place-items-center rounded-lg border border-dashed border-[#a3242f]/30 px-6 py-14 text-center">
        <AlertTriangle aria-hidden="true" size={28} strokeWidth={1.4} className="text-[#a3242f]" />
        <p className="mt-3 max-w-sm text-sm text-ink-2">{loadError}</p>
        <button type="button" onClick={reload} className="mt-4 h-10 rounded-md border border-black/20 px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
          Try again
        </button>
      </div>
    );
  } else if (items.length === 0) {
    listBody = (
      <div className="admin-row-in grid place-items-center rounded-lg border border-dashed border-black/15 px-6 py-14 text-center">
        {nothingStored ? <Layers aria-hidden="true" size={28} strokeWidth={1.4} className="text-ink-3" /> : <SearchX aria-hidden="true" size={28} strokeWidth={1.4} className="text-ink-3" />}
        <p className="mt-3 max-w-sm text-sm text-ink-2">
          {nothingStored
            ? "No case studies yet. Add one, or run the approved-content migration (npm run cs:migrate)."
            : search
              ? `No case studies match “${search}”.`
              : filters.status === "deleted"
                ? "Nothing has been deleted."
                : "No case studies match these filters."}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {hasCaseStudyFilters(filters) && (
            <button type="button" onClick={() => changeFilters(emptyCaseStudyFilters)} className="h-10 rounded-md border border-black/20 px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
              Clear filters
            </button>
          )}
          {nothingStored && addButton}
        </div>
      </div>
    );
  } else if (view === "grid") {
    listBody = (
      <ul key="grid" className={`admin-row-in grid grid-cols-1 gap-3.5 transition-opacity @[32rem]:grid-cols-2 @[40rem]:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
        {items.map((c) => (
          <li key={c.id}>
            <CaseStudyCard item={c} selected={c.id === selected?.id} actions={actions} />
          </li>
        ))}
      </ul>
    );
  } else {
    listBody = (
      <ul key="list" className={`admin-row-in divide-y divide-black/[0.06] transition-opacity ${loading ? "opacity-60" : ""}`}>
        {items.map((c) => (
          <CaseStudyRow key={c.id} item={c} selected={c.id === selected?.id} actions={actions} />
        ))}
      </ul>
    );
  }

  return (
    <>
      <CaseStudyStats counts={data?.counts ?? null} />

      <div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)] xl:gap-6">
        <section aria-label="Case studies" aria-busy={loading} className="@container admin-fade-up min-w-0 rounded-xl border border-black/[0.08] bg-white/80 p-4 [animation-delay:320ms] sm:p-5">
          <div className="mb-4 flex justify-end xl:hidden">{addButton}</div>
          <CaseStudyToolbar filters={filters} view={view} onChange={changeFilters} onClear={() => changeFilters(emptyCaseStudyFilters)} onView={setView} />
          {loadError && data !== null && (
            <p role="alert" className="mt-4 rounded-lg border border-[#a3242f]/25 bg-[#a3242f]/[0.05] px-3 py-2 text-sm text-[#a3242f]">
              {loadError}{" "}
              <button type="button" onClick={reload} className="font-medium underline">
                Retry
              </button>
            </p>
          )}
          <div className="mt-5">{listBody}</div>
          <div className="mt-5 border-t border-black/[0.06] pt-4">
            <EnquiryPagination page={current} pages={pages} total={filtered} from={from} to={to} onPage={setPage} noun={filtered === 1 ? "case study" : "case studies"} />
          </div>
        </section>

        <div className="hidden space-y-4 xl:sticky xl:top-6 xl:block">
          <div className="flex justify-end">{addButton}</div>
          <aside aria-labelledby={selected ? "case-study-detail-title" : undefined} aria-label={selected ? undefined : "Case study details"} className="admin-fade-up rounded-xl border border-black/[0.08] bg-white/80 [animation-delay:400ms]">
            <CaseStudyDetailPanel item={selected} actions={actions} onClose={closeDetail} serifClassName={serifClassName} />
          </aside>
        </div>
      </div>

      <div className="xl:hidden">
        <div aria-hidden="true" onClick={() => setDrawerOpen(false)} className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${drawerVisible ? "opacity-100" : "pointer-events-none opacity-0"}`} />
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-detail-title"
          inert={!drawerVisible}
          className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto overscroll-contain bg-[var(--cream)] shadow-[-12px_0_40px_-20px_rgba(36,12,14,0.4)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md ${drawerVisible ? "translate-x-0" : "translate-x-full"}`}
        >
          {selected && <CaseStudyDetailPanel item={selected} actions={actions} onClose={() => setDrawerOpen(false)} variant="drawer" serifClassName={serifClassName} />}
        </div>
      </div>

      {form && (
        <CaseStudyForm
          key={form.mode === "edit" ? `${form.record.id}-${form.record.updatedAt}` : "create"}
          mode={form.mode}
          initial={form.mode === "edit" ? form.initial : emptyCaseStudyForm}
          record={form.mode === "edit" ? form.record : undefined}
          initialErrors={form.mode === "edit" ? form.errors : undefined}
          initialMessage={form.mode === "edit" ? form.message : undefined}
          serifClassName={serifClassName}
          uploadsEnabled={uploadsEnabled}
          onSubmit={submit}
          onClose={() => setForm(null)}
        />
      )}

      <ConfirmDialog
        open={confirm !== null && copy !== null}
        tone={copy?.danger ? "danger" : "primary"}
        icon={copy?.icon}
        title={copy && confirm ? copy.title(confirm.record.title) : ""}
        description={confirm?.slug ? `Its slug is now used by another case study, so it will be restored at /case-studies/${confirm.slug} (as a draft).` : (copy?.description ?? "")}
        confirmLabel={copy?.label ?? "Confirm"}
        busy={busy}
        onConfirm={() => void runConfirm()}
        onCancel={() => setConfirm(null)}
      />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex justify-center px-4">
        {toast && <p className={`admin-pop max-w-lg rounded-lg px-4 py-2.5 text-center text-sm shadow-lg ${toast.tone === "error" ? "bg-[#7a1f2b] text-white" : "bg-[#240C0E] text-[#F8F5F0]"}`}>{toast.text}</p>}
      </div>
    </>
  );
}
