"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CheckCircle2, Eye, Inbox, SearchX, Trash2, X } from "lucide-react";
import { enquiryStatusLabels, serviceLabels, type Enquiry, type EnquiryStatus } from "@/lib/admin/types";
import {
  emptyFilters,
  filterEnquiries,
  hasActiveFilters,
  nextStatuses,
  pageCount,
  paginate,
  PAGE_SIZE,
  type EnquiryFilters,
} from "@/lib/admin/enquiry-utils";
import EnquiryStats from "./EnquiryStats";
import EnquiryToolbar from "./EnquiryToolbar";
import EnquiryTable from "./EnquiryTable";
import EnquiryMobileList from "./EnquiryMobileList";
import EnquiryDetailPanel from "./EnquiryDetailPanel";
import EnquiryPagination from "./EnquiryPagination";
import DeleteEnquiryDialog from "./DeleteEnquiryDialog";

/**
 * Enquiries workspace: the single source of truth for the page's UI state.
 * Status changes and deletions are TEMPORARY (this browser tab only) — demo data is
 * not persisted and resets on reload. Swap `initial` for API data later; the UI stays.
 */

const DESKTOP = "(min-width: 1280px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export default function EnquiriesWorkspace({ initial, serifClassName }: { initial: Enquiry[]; serifClassName: string }) {
  const [items, setItems] = useState<Enquiry[]>(initial);
  const [filters, setFilters] = useState<EnquiryFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawerClose = useRef<HTMLDivElement>(null);
  const isDesktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);

  const filtered = useMemo(() => filterEnquiries(items, filters), [items, filters]);
  const pages = pageCount(filtered.length);
  const current = Math.min(page, pages);
  const rows = paginate(filtered, current);
  const selected = items.find((e) => e.id === selectedId) ?? null;
  const from = filtered.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
  const to = Math.min(current * PAGE_SIZE, filtered.length);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  /* Filters: any change returns to page 1 */
  const changeFilters = (next: EnquiryFilters) => {
    setFilters(next);
    setPage(1);
  };
  const clearFilters = () => changeFilters(emptyFilters);

  /* Selection */
  const select = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };
  const closeDetail = () => {
    setDrawerOpen(false);
    if (isDesktop) setSelectedId(null);
  };

  /* Status */
  const setStatus = (ids: string[], status: EnquiryStatus) => {
    const valid = new Set(items.filter((e) => ids.includes(e.id) && nextStatuses[e.status].includes(status)).map((e) => e.id));
    if (valid.size === 0) return 0;
    setItems((list) => list.map((e) => (valid.has(e.id) ? { ...e, status } : e)));
    return valid.size;
  };
  const changeStatus = (id: string, status: EnquiryStatus) => {
    if (setStatus([id], status)) notify(`Marked as ${enquiryStatusLabels[status].toLowerCase()} (preview only, not saved).`);
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
  const bulkStatus = (status: EnquiryStatus) => {
    const n = setStatus([...checked], status);
    notify(
      n === 0
        ? `None of the selected enquiries can be marked as ${enquiryStatusLabels[status].toLowerCase()}.`
        : `${n} marked as ${enquiryStatusLabels[status].toLowerCase()} (preview only, not saved).`,
    );
    setChecked(new Set());
  };

  /* Delete (after confirmation) */
  const confirmDelete = () => {
    if (!pendingDelete) return;
    const remove = new Set(pendingDelete);
    if (selectedId && remove.has(selectedId)) {
      // Select the next available enquiry in the current view (or the previous one at the end).
      const index = filtered.findIndex((e) => e.id === selectedId);
      const remaining = filtered.filter((e) => !remove.has(e.id));
      const next = remaining[Math.min(index, remaining.length - 1)] ?? null;
      setSelectedId(next?.id ?? null);
      if (!next) setDrawerOpen(false);
    }
    setItems((list) => list.filter((e) => !remove.has(e.id)));
    setChecked((prev) => new Set([...prev].filter((id) => !remove.has(id))));
    notify(`${remove.size === 1 ? "Enquiry" : `${remove.size} enquiries`} deleted from this preview (not saved).`);
    setPendingDelete(null);
  };

  /* Drawer (below 1280px): scroll lock, Escape, focus */
  const drawerVisible = drawerOpen && !isDesktop && selected !== null;
  useEffect(() => {
    if (!drawerVisible) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    drawerClose.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector("dialog[open]")) setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerVisible]);

  /* Empty state copy */
  const emptyMessage = (() => {
    if (items.length === 0) return initial.length === 0 ? "No enquiries yet." : "All enquiries were deleted in this preview. Reload the page to restore the demo data.";
    if (filters.search.trim()) return `No enquiries match “${filters.search.trim()}”.`;
    const status = filters.status !== "all" ? `${enquiryStatusLabels[filters.status].toLowerCase()} ` : "";
    const service = filters.service !== "all" ? ` for ${serviceLabels[filters.service]}` : "";
    return `No ${status}enquiries${service}.`;
  })();

  const deleteName = pendingDelete?.length === 1 ? items.find((e) => e.id === pendingDelete[0])?.name : undefined;

  return (
    <>
      <EnquiryStats items={items} />

      <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:mt-6 xl:grid-cols-[minmax(0,1fr)_minmax(19.5rem,22rem)] xl:gap-6">
        {/* List */}
        <section
          aria-label="Enquiries list"
          className="admin-fade-up min-w-0 rounded-xl border border-black/[0.08] bg-white/80 p-4 [animation-delay:320ms] sm:p-6"
        >
          <EnquiryToolbar filters={filters} onChange={changeFilters} onClear={clearFilters} />

          {checked.size > 0 && (
            <div className="admin-pop mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-[#f7e7e6] px-3 py-2 text-sm" role="region" aria-label="Bulk actions">
              <span className="mr-auto font-medium text-[#5a0c14]">{checked.size} selected</span>
              <button type="button" onClick={() => bulkStatus("READ")} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-ink hover:bg-white focus-visible:outline-2 focus-visible:outline-burgundy">
                <Eye aria-hidden="true" size={15} /> Mark as Read
              </button>
              <button type="button" onClick={() => bulkStatus("CLOSED")} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-ink hover:bg-white focus-visible:outline-2 focus-visible:outline-burgundy">
                <CheckCircle2 aria-hidden="true" size={15} /> Mark as Closed
              </button>
              <button type="button" onClick={() => setPendingDelete([...checked])} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[#a3242f] hover:bg-white focus-visible:outline-2 focus-visible:outline-burgundy">
                <Trash2 aria-hidden="true" size={15} /> Delete
              </button>
              <button type="button" onClick={() => setChecked(new Set())} aria-label="Clear selection" className="grid size-9 place-items-center rounded-md text-ink-2 hover:bg-white focus-visible:outline-2 focus-visible:outline-burgundy">
                <X aria-hidden="true" size={16} />
              </button>
            </div>
          )}

          <div className="mt-4">
            {rows.length === 0 ? (
              <div className="admin-row-in grid place-items-center rounded-lg border border-dashed border-black/15 px-6 py-14 text-center">
                {items.length === 0 ? <Inbox aria-hidden="true" size={28} strokeWidth={1.4} className="text-ink-3" /> : <SearchX aria-hidden="true" size={28} strokeWidth={1.4} className="text-ink-3" />}
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
                  <EnquiryTable rows={rows} selectedId={selectedId} checked={checked} onSelect={select} onToggle={toggle} onToggleAll={toggleAll} />
                </div>
                <div className="md:hidden">
                  <EnquiryMobileList rows={rows} selectedId={selectedId} checked={checked} onSelect={select} onToggle={toggle} />
                </div>
              </>
            )}
          </div>

          <div className="mt-5 border-t border-black/[0.06] pt-5">
            <EnquiryPagination page={current} pages={pages} total={filtered.length} from={from} to={to} onPage={setPage} />
          </div>
        </section>

        {/* Detail panel (desktop) */}
        <aside
          aria-labelledby={selected ? "enquiry-detail-title" : undefined}
          aria-label={selected ? undefined : "Enquiry details"}
          className="admin-fade-up sticky top-6 hidden min-h-[36rem] rounded-xl border border-black/[0.08] bg-white/80 [animation-delay:400ms] xl:block"
        >
          <EnquiryDetailPanel enquiry={selected} onStatus={changeStatus} onDelete={(id) => setPendingDelete([id])} onClose={closeDetail} serifClassName={serifClassName} />
        </aside>
      </div>

      {/* Detail drawer (below 1280px) */}
      <div className="xl:hidden">
        <div
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${drawerVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
        />
        <div
          ref={drawerClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-detail-title"
          inert={!drawerVisible}
          className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[var(--cream)] shadow-[-12px_0_40px_-20px_rgba(36,12,14,0.4)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md ${
            drawerVisible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selected && (
            <EnquiryDetailPanel
              enquiry={selected}
              variant="drawer"
              onStatus={changeStatus}
              onDelete={(id) => setPendingDelete([id])}
              onClose={() => setDrawerOpen(false)}
              serifClassName={serifClassName}
            />
          )}
        </div>
      </div>

      <DeleteEnquiryDialog count={pendingDelete ? pendingDelete.length : null} name={deleteName} onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)} />

      {/* Feedback */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
        {toast && <p className="admin-pop rounded-lg bg-[#240C0E] px-4 py-2.5 text-sm text-[#F8F5F0] shadow-lg">{toast}</p>}
      </div>
    </>
  );
}
