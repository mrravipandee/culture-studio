"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AlertCircle, CheckCircle2, Eye, Inbox, LoaderCircle, RotateCcw, SearchX, Trash2, X } from "lucide-react";
import { enquiryStatusLabels, serviceLabels, type EnquiryDetail, type EnquiryStatus } from "@/lib/admin/types";
import { emptyFilters, enquiryQueryString, hasActiveFilters, type EnquiryFilters } from "@/lib/admin/enquiry-utils";
import { enquiryRangeLabels } from "@/lib/validation/enquiry";
import type { EnquiryListResult } from "@/lib/enquiries/types";
import { adminRequest } from "../settings/settings-api";
import { useAdminCounts } from "../AdminCountsContext";
import EnquiryStats from "./EnquiryStats";
import EnquiryToolbar from "./EnquiryToolbar";
import EnquiryTable from "./EnquiryTable";
import EnquiryMobileList from "./EnquiryMobileList";
import EnquiryDetailPanel from "./EnquiryDetailPanel";
import EnquiryPagination from "./EnquiryPagination";
import DeleteEnquiryDialog from "./DeleteEnquiryDialog";

/**
 * Enquiries workspace (real data). The first page arrives from the server; every filter,
 * page change, status update and delete goes through /api/admin/enquiries, and the list is
 * re-read afterwards so counts, filters and pagination always agree with MongoDB.
 */

const DESKTOP = "(min-width: 1280px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const SEARCH_DEBOUNCE_MS = 300;

export default function EnquiriesWorkspace({
  initial,
  initialDetail,
  serifClassName,
}: {
  initial: EnquiryListResult;
  initialDetail: EnquiryDetail | null;
  serifClassName: string;
}) {
  const { setNewEnquiries } = useAdminCounts();
  const [filters, setFilters] = useState<EnquiryFilters>(emptyFilters);
  const [data, setData] = useState<EnquiryListResult>(initial);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(initial.items[0]?.id ?? null);
  const [detail, setDetail] = useState<EnquiryDetail | null>(initialDetail);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(() => new Set());

  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listAbort = useRef<AbortController | null>(null);
  const detailAbort = useRef<AbortController | null>(null);
  const listSeq = useRef(0);
  const deleteLock = useRef(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);

  const notify = useCallback((text: string, tone: "ok" | "error" = "ok") => {
    setToast({ tone, text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);
  useEffect(
    () => () => {
      [toastTimer.current, searchTimer.current].forEach((t) => t && clearTimeout(t));
      listAbort.current?.abort();
      detailAbort.current?.abort();
    },
    [],
  );

  /* List loading (only the latest request may update the page) */
  const load = useCallback(
    async (f: EnquiryFilters, page: number) => {
      listAbort.current?.abort();
      const controller = new AbortController();
      listAbort.current = controller;
      const seq = ++listSeq.current;
      setLoading(true);
      setListError(null);
      try {
        const result = await adminRequest<EnquiryListResult>(`/api/admin/enquiries${(() => {
          const q = enquiryQueryString(f, page);
          return q ? `?${q}` : "";
        })()}`, { signal: controller.signal });
        if (seq !== listSeq.current) return;
        if (result.ok) {
          setData(result.data);
          setNewEnquiries(result.data.statusCounts.NEW);
        } else if (result.status !== 401) {
          setListError(result.error.message);
        }
      } catch {
        // aborted by a newer request
      } finally {
        if (seq === listSeq.current) setLoading(false);
      }
    },
    [setNewEnquiries],
  );
  const reload = useCallback(() => load(filters, data.page), [load, filters, data.page]);

  /* Filters: any change returns to page 1; typing in search is debounced */
  const changeFilters = (next: EnquiryFilters) => {
    const onlySearch = next.search !== filters.search && next.service === filters.service && next.status === filters.status && next.range === filters.range;
    setFilters(next);
    setChecked(new Set());
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (onlySearch) searchTimer.current = setTimeout(() => void load(next, 1), SEARCH_DEBOUNCE_MS);
    else void load(next, 1);
  };
  const clearFilters = () => changeFilters(emptyFilters);

  /* Detail */
  const fetchDetail = useCallback(async (id: string) => {
    detailAbort.current?.abort();
    const controller = new AbortController();
    detailAbort.current = controller;
    setDetailLoading(true);
    setDetailError(null);
    try {
      const result = await adminRequest<EnquiryDetail>(`/api/admin/enquiries/${encodeURIComponent(id)}`, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (result.ok) setDetail(result.data);
      else if (result.status !== 401) setDetailError(result.status === 404 ? "This enquiry no longer exists." : result.error.message);
    } catch {
      return; // aborted
    }
    setDetailLoading(false);
  }, []);

  const select = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
    if (detail?.id !== id) void fetchDetail(id);
  };
  const closeDetail = () => {
    setDrawerOpen(false);
    if (isDesktop) setSelectedId(null);
  };

  const selectedRow = data.items.find((e) => e.id === selectedId) ?? (detail && detail.id === selectedId ? detail : null);

  /* Status */
  const markBusy = (ids: string[], on: boolean) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const patchStatus = (id: string, status: EnquiryStatus) => adminRequest<EnquiryDetail>(`/api/admin/enquiries/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } });

  const changeStatus = async (id: string, status: EnquiryStatus) => {
    if (busyIds.has(id)) return;
    markBusy([id], true);
    const result = await patchStatus(id, status);
    markBusy([id], false);
    if (result.ok) {
      if (selectedId === id) setDetail(result.data);
      notify(`Marked as ${enquiryStatusLabels[status].toLowerCase()}.`);
    } else if (result.status !== 401) {
      notify(result.error.message, "error");
    }
    await reload();
  };

  /* Bulk */
  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = (ids: string[], on: boolean) =>
    setChecked((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const bulkStatus = async (status: EnquiryStatus) => {
    const ids = [...checked];
    markBusy(ids, true);
    let done = 0;
    let skipped = 0;
    for (const id of ids) {
      const result = await patchStatus(id, status); // sequential: gentle on the API
      if (result.ok) {
        done += 1;
        if (selectedId === id) setDetail(result.data);
      } else if (result.status === 401) {
        return;
      } else {
        skipped += 1;
      }
    }
    markBusy(ids, false);
    setChecked(new Set());
    const label = enquiryStatusLabels[status].toLowerCase();
    notify(done === 0 ? `None of the selected enquiries can be marked as ${label}.` : `${done} marked as ${label}${skipped ? `, ${skipped} skipped` : ""}.`, done === 0 ? "error" : "ok");
    await reload();
  };

  /* Delete (soft) */
  const confirmDelete = async () => {
    if (!pendingDelete || deleteLock.current) return;
    deleteLock.current = true;
    setDeleting(true);
    const ids = pendingDelete;
    let deleted = 0;
    let failed: string | null = null;
    for (const id of ids) {
      const result = await adminRequest<{ deleted: true }>(`/api/admin/enquiries/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (result.ok) deleted += 1;
      else if (result.status === 401) return;
      else failed = result.error.message;
    }
    if (selectedId && ids.includes(selectedId)) {
      const index = data.items.findIndex((e) => e.id === selectedId);
      const remaining = data.items.filter((e) => !ids.includes(e.id));
      const next = remaining[Math.min(index, remaining.length - 1)] ?? null;
      setSelectedId(next?.id ?? null);
      setDetail(null);
      if (next) void fetchDetail(next.id);
      else setDrawerOpen(false);
    }
    setChecked((prev) => new Set([...prev].filter((id) => !ids.includes(id))));
    setPendingDelete(null);
    setDeleting(false);
    deleteLock.current = false;
    notify(failed && deleted === 0 ? failed : `${deleted === 1 ? "Enquiry" : `${deleted} enquiries`} deleted.${failed ? ` Some could not be deleted: ${failed}` : ""}`, failed ? "error" : "ok");
    await reload();
  };

  /* Drawer (below 1280px): scroll lock, Escape, focus */
  const drawerVisible = drawerOpen && !isDesktop && selectedRow !== null;
  useEffect(() => {
    if (!drawerVisible) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const opener = document.activeElement as HTMLElement | null;
    drawerRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector("dialog[open]")) setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      if (opener?.isConnected) opener.focus();
    };
  }, [drawerVisible]);

  /* Empty-state copy */
  const emptyMessage = (() => {
    if (data.totalCount === 0) return "No enquiries yet. Submissions from the website's enquiry form will appear here.";
    if (filters.search.trim()) return `No enquiries match “${filters.search.trim()}”.`;
    const status = filters.status !== "all" ? `${enquiryStatusLabels[filters.status].toLowerCase()} ` : "";
    const service = filters.service !== "all" ? ` for ${serviceLabels[filters.service]}` : "";
    const range = filters.range !== "all" ? ` (${enquiryRangeLabels[filters.range].toLowerCase()})` : "";
    return `No ${status}enquiries${service}${range}.`;
  })();

  const deleteName = pendingDelete?.length === 1 ? data.items.find((e) => e.id === pendingDelete[0])?.name : undefined;
  const from = data.filteredCount === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const to = Math.min(data.page * data.pageSize, data.filteredCount);
  const anyBusy = busyIds.size > 0;

  const panel = (variant: "panel" | "drawer") => (
    <EnquiryDetailPanel
      enquiry={selectedRow}
      detail={detail}
      loading={detailLoading}
      error={detailError}
      onRetry={() => selectedId && void fetchDetail(selectedId)}
      busy={selectedId ? busyIds.has(selectedId) : false}
      variant={variant}
      onStatus={(id, s) => void changeStatus(id, s)}
      onDelete={(id) => setPendingDelete([id])}
      onClose={variant === "panel" ? closeDetail : () => setDrawerOpen(false)}
      serifClassName={serifClassName}
    />
  );

  return (
    <>
      <EnquiryStats total={data.totalCount} counts={data.statusCounts} />

      <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:mt-6 xl:grid-cols-[minmax(0,1fr)_minmax(19.5rem,22rem)] xl:gap-6">
        <section aria-label="Enquiries list" aria-busy={loading} className="admin-fade-up min-w-0 rounded-xl border border-black/[0.08] bg-white/80 p-4 [animation-delay:320ms] sm:p-6">
          <EnquiryToolbar filters={filters} onChange={changeFilters} onClear={clearFilters} />

          {checked.size > 0 && (
            <div className="admin-pop mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-[#f7e7e6] px-3 py-2 text-sm" role="region" aria-label="Bulk actions">
              <span className="mr-auto font-medium text-[#5a0c14]">{checked.size} selected</span>
              <button type="button" disabled={anyBusy} onClick={() => void bulkStatus("READ")} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-ink hover:bg-white focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-50">
                <Eye aria-hidden="true" size={15} /> Mark as Read
              </button>
              <button type="button" disabled={anyBusy} onClick={() => void bulkStatus("CLOSED")} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-ink hover:bg-white focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-50">
                <CheckCircle2 aria-hidden="true" size={15} /> Mark as Closed
              </button>
              <button type="button" disabled={anyBusy} onClick={() => setPendingDelete([...checked])} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[#a3242f] hover:bg-white focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-50">
                <Trash2 aria-hidden="true" size={15} /> Delete
              </button>
              <button type="button" onClick={() => setChecked(new Set())} aria-label="Clear selection" className="grid size-9 place-items-center rounded-md text-ink-2 hover:bg-white focus-visible:outline-2 focus-visible:outline-burgundy">
                <X aria-hidden="true" size={16} />
              </button>
            </div>
          )}

          <div className={`relative mt-4 transition-opacity duration-200 ${loading ? "opacity-60" : ""}`}>
            {listError ? (
              <div role="alert" className="admin-row-in grid place-items-center rounded-lg border border-dashed border-[#a3242f]/30 px-6 py-12 text-center">
                <AlertCircle aria-hidden="true" size={28} strokeWidth={1.4} className="text-[#a3242f]" />
                <p className="mt-3 max-w-sm text-sm text-ink-2">{listError}</p>
                <button type="button" onClick={() => void reload()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-md border border-black/20 px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
                  <RotateCcw aria-hidden="true" size={15} /> Try again
                </button>
              </div>
            ) : data.items.length === 0 ? (
              <div className="admin-row-in grid place-items-center rounded-lg border border-dashed border-black/15 px-6 py-14 text-center">
                {data.totalCount === 0 ? <Inbox aria-hidden="true" size={28} strokeWidth={1.4} className="text-ink-3" /> : <SearchX aria-hidden="true" size={28} strokeWidth={1.4} className="text-ink-3" />}
                <p className="mt-3 max-w-sm text-sm text-ink-2">{emptyMessage}</p>
                {hasActiveFilters(filters) && (
                  <button type="button" onClick={clearFilters} className="mt-4 h-10 rounded-md border border-black/20 px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <EnquiryTable rows={data.items} selectedId={selectedId} checked={checked} onSelect={select} onToggle={toggle} onToggleAll={toggleAll} />
                </div>
                <div className="md:hidden">
                  <EnquiryMobileList rows={data.items} selectedId={selectedId} checked={checked} onSelect={select} onToggle={toggle} />
                </div>
              </>
            )}
            {loading && (
              <p role="status" className="pointer-events-none absolute inset-x-0 top-2 mx-auto flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-ink-2 shadow-sm">
                <LoaderCircle aria-hidden="true" size={14} className="animate-spin motion-reduce:animate-none" /> Loading enquiries…
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-black/[0.06] pt-5">
            <EnquiryPagination page={data.page} pages={data.totalPages} total={data.filteredCount} from={from} to={to} onPage={(p) => void load(filters, p)} />
          </div>
        </section>

        <aside
          aria-labelledby={selectedRow ? "enquiry-detail-title" : undefined}
          aria-label={selectedRow ? undefined : "Enquiry details"}
          className="admin-fade-up sticky top-6 hidden min-h-[36rem] rounded-xl border border-black/[0.08] bg-white/80 [animation-delay:400ms] xl:block"
        >
          {isDesktop && panel("panel")}
        </aside>
      </div>

      {/* Detail drawer (below 1280px) */}
      <div className="xl:hidden">
        <div aria-hidden="true" onClick={() => setDrawerOpen(false)} className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${drawerVisible ? "opacity-100" : "pointer-events-none opacity-0"}`} />
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-detail-title"
          inert={!drawerVisible}
          className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[var(--cream)] shadow-[-12px_0_40px_-20px_rgba(36,12,14,0.4)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md ${
            drawerVisible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {!isDesktop && selectedRow && panel("drawer")}
        </div>
      </div>

      <DeleteEnquiryDialog count={pendingDelete ? pendingDelete.length : null} name={deleteName} busy={deleting} onConfirm={() => void confirmDelete()} onCancel={() => !deleting && setPendingDelete(null)} />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
        {toast && (
          <p className={`admin-pop rounded-lg px-4 py-2.5 text-sm shadow-lg ${toast.tone === "ok" ? "bg-[#240C0E] text-[#F8F5F0]" : "bg-[#a3242f] text-white"}`}>{toast.text}</p>
        )}
      </div>
    </>
  );
}
