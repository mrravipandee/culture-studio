"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { MailX, RotateCcw, SearchX, Trash2, Users, X } from "lucide-react";
import { subscriberSourceLabels, subscriberStatusLabels, type Subscriber } from "@/lib/admin/types";
import { pageCount, paginate } from "@/lib/admin/enquiry-utils";
import {
  csvFilename,
  dateRangeLabels,
  emptySubscriberFilters,
  filterSubscribers,
  getNewSubscribersThisMonth,
  getSubscriberGrowth,
  getTotalSubscribers,
  getUnsubscribedSubscribers,
  hasSubscriberFilters,
  SUBSCRIBER_PAGE_SIZE,
  subscribersToCsv,
  type NewSubscriberValues,
  type SubscriberFilters,
} from "@/lib/admin/subscriber-utils";
import ConfirmDialog from "../ConfirmDialog";
import { adminRequest } from "../settings/settings-api";
import EnquiryPagination from "../enquiries/EnquiryPagination";
import SubscriberStats from "./SubscriberStats";
import SubscriberToolbar from "./SubscriberToolbar";
import { SubscriberMobileList, SubscriberTable, type SubscriberActions } from "./SubscriberTable";
import SubscriberDetailPanel from "./SubscriberDetailPanel";
import AddSubscriberDialog from "./AddSubscriberDialog";

/**
 * Subscribers workspace: single source of truth for the page's UI state.
 * Records come from MongoDB (the page loads them on the server); add / unsubscribe /
 * reactivate / delete call /api/admin/subscribers and update the list from the response.
 * No email is sent and no mailing-list service is involved.
 */

const DESKTOP = "(min-width: 1280px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

type Pending = { kind: "unsubscribe" | "reactivate" | "delete"; ids: string[]; bulk?: boolean };

export default function SubscribersWorkspace({ initial, serifClassName }: { initial: Subscriber[]; serifClassName: string }) {
  // Reference time for KPIs and date filters. Moved forward on every change so records created
  // in this session are never treated as "in the future".
  const [now, setNow] = useState(() => Date.now());
  const [items, setItems] = useState<Subscriber[]>(initial);
  const [filters, setFilters] = useState<SubscriberFilters>(emptySubscriberFilters);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmLock = useRef(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);

  const filtered = useMemo(() => filterSubscribers(items, filters, now), [items, filters, now]);
  const pages = pageCount(filtered.length, SUBSCRIBER_PAGE_SIZE);
  const current = Math.min(page, pages);
  const rows = paginate(filtered, current, SUBSCRIBER_PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (current - 1) * SUBSCRIBER_PAGE_SIZE + 1;
  const to = Math.min(current * SUBSCRIBER_PAGE_SIZE, filtered.length);
  const selected = items.find((s) => s.id === selectedId) ?? null;

  /* Bulk actions only touch records that are both checked AND in the current filtered view. */
  const visibleChecked = useMemo(() => filtered.filter((s) => checked.has(s.id)), [filtered, checked]);

  const stats = useMemo(
    () => ({
      active: getTotalSubscribers(items),
      newThisMonth: getNewSubscribersThisMonth(items, now),
      unsubscribed: getUnsubscribedSubscribers(items).length,
      growth: getSubscriberGrowth(items, now),
    }),
    [items, now],
  );

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3800);
  }, []);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  /* Filters: any change returns to page 1 and clears the selection (avoids acting on hidden rows). */
  const changeFilters = (next: SubscriberFilters) => {
    setFilters(next);
    setPage(1);
    setChecked(new Set());
  };
  const clearFilters = () => changeFilters(emptySubscriberFilters);

  /* Detail */
  const select = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };
  const closeDetail = () => {
    setDrawerOpen(false);
    if (isDesktop) setSelectedId(null);
  };

  /* Checkboxes */
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

  /* Confirmations */
  const ask = (p: Pending) => {
    confirmLock.current = false;
    setPending(p);
  };
  const actions: SubscriberActions = {
    onSelect: select,
    onUnsubscribe: (id) => ask({ kind: "unsubscribe", ids: [id] }),
    onReactivate: (id) => ask({ kind: "reactivate", ids: [id] }),
    onDelete: (id) => ask({ kind: "delete", ids: [id] }),
  };

  const [busy, setBusy] = useState(false);

  /** Reloads the list from the server (after bulk actions, or when something changed elsewhere). */
  const reload = useCallback(async () => {
    const result = await adminRequest<{ items: Subscriber[]; truncated: boolean }>("/api/admin/subscribers");
    if (result.ok) {
      setItems(result.data.items);
      setNow(Date.now());
    } else notify(result.error.message);
  }, [notify]);

  const confirm = async () => {
    if (!pending || confirmLock.current) return;
    confirmLock.current = true;
    setBusy(true);
    const ids = new Set(pending.ids);
    const isBulk = pending.bulk === true || pending.ids.length > 1;

    let ok = false;
    if (isBulk) {
      const action = pending.kind === "delete" ? "delete" : "unsubscribe";
      const result = await adminRequest<{ changed: string[] }>("/api/admin/subscribers/bulk", { method: "POST", body: { action, ids: pending.ids } });
      if (result.ok) {
        ok = true;
        const n = result.data.changed.length;
        notify(n === 0 ? "No changes were needed." : `${n === 1 ? "Subscriber" : `${n} subscribers`} ${action === "delete" ? "deleted" : "unsubscribed"}.`);
        await reload();
      } else notify(result.error.message);
    } else {
      const [id] = pending.ids;
      if (pending.kind === "delete") {
        const result = await adminRequest<{ deleted: true }>(`/api/admin/subscribers/${encodeURIComponent(id)}`, { method: "DELETE" });
        if (result.ok || result.status === 404) {
          ok = true;
          setItems((list) => list.filter((s) => s.id !== id));
          notify(result.ok ? "Subscriber deleted." : "That subscriber was already removed.");
        } else notify(result.error.message);
      } else {
        const status = pending.kind === "unsubscribe" ? "UNSUBSCRIBED" : "ACTIVE";
        const result = await adminRequest<{ subscriber: Subscriber; changed: boolean }>(`/api/admin/subscribers/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } });
        if (result.ok) {
          ok = true;
          setItems((list) => list.map((s) => (s.id === id ? result.data.subscriber : s)));
          notify(result.data.changed ? `Subscriber ${status === "UNSUBSCRIBED" ? "unsubscribed" : "reactivated"}.` : `No change: already ${subscriberStatusLabels[status].toLowerCase()}.`);
        } else {
          notify(result.error.message);
          if (result.status === 404) await reload();
        }
      }
    }
    setNow(Date.now());

    if (ok && pending.kind === "delete" && selectedId && ids.has(selectedId)) {
      const index = filtered.findIndex((s) => s.id === selectedId);
      const remaining = filtered.filter((s) => !ids.has(s.id));
      const next = remaining[Math.min(index, remaining.length - 1)] ?? null;
      setSelectedId(next?.id ?? null);
      if (!next) setDrawerOpen(false);
    }
    if (ok) setChecked(isBulk ? new Set() : (prev) => new Set([...prev].filter((x) => !(pending.kind === "delete" && ids.has(x)))));
    setBusy(false);
    confirmLock.current = false;
    setPending(null);
  };

  /* Bulk */
  const bulk = (kind: Pending["kind"]) => {
    const targets = kind === "unsubscribe" ? visibleChecked.filter((s) => s.status === "ACTIVE") : visibleChecked;
    if (targets.length === 0) {
      notify(kind === "unsubscribe" ? "None of the selected subscribers are active." : "Nothing selected in the current view.");
      return;
    }
    ask({ kind, ids: targets.map((s) => s.id), bulk: true });
  };

  /* Add (saved to MongoDB; the dialog stays open with field errors on failure) */
  const add = async (v: NewSubscriberValues) => {
    const result = await adminRequest<Subscriber>("/api/admin/subscribers", { method: "POST", body: { email: v.email, ...(v.name ? { name: v.name } : {}), source: v.source, status: v.status } });
    if (!result.ok) return { ok: false as const, message: result.error.message, fields: result.error.fields };
    setNow(Date.now());
    setItems((list) => [result.data, ...list.filter((s) => s.id !== result.data.id)]);
    setAdding(false);
    setSelectedId(result.data.id);
    // Make the new record visible: clear filters and go to page 1.
    setFilters(emptySubscriberFilters);
    setPage(1);
    setChecked(new Set());
    notify("Subscriber added.");
    return { ok: true as const };
  };

  /* Export: the full filtered set, not just the current page. */
  const exportCsv = () => {
    if (filtered.length === 0) {
      notify("Nothing to export: no subscribers match the current filters.");
      return;
    }
    const blob = new Blob(["﻿", subscribersToCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = csvFilename(Date.now());
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`Exported ${filtered.length} ${filtered.length === 1 ? "subscriber" : "subscribers"} to CSV.`);
  };

  /* Drawer (below 1280px): scroll lock, Escape, focus */
  const drawerVisible = drawerOpen && !isDesktop && selected !== null;
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
  const empty = (() => {
    if (items.length === 0) return { icon: Users, text: "No subscribers yet. Sign-ups from the blog newsletter form appear here, or add one by hand." };
    if (filters.search.trim()) return { icon: SearchX, text: `No subscribers match “${filters.search.trim()}”.` };
    if (filters.status === "UNSUBSCRIBED" && filters.source === "all" && filters.range === "all") return { icon: SearchX, text: "No one has unsubscribed." };
    if (filters.status === "ACTIVE" && filters.source === "all" && filters.range === "all") return { icon: SearchX, text: "No active subscribers." };
    const parts = [
      filters.status !== "all" ? subscriberStatusLabels[filters.status].toLowerCase() : "",
      "subscribers",
      filters.source !== "all" ? `from ${subscriberSourceLabels[filters.source]}` : "",
      filters.range !== "all" ? `in ${dateRangeLabels[filters.range].toLowerCase()}` : "",
    ].filter(Boolean);
    return { icon: SearchX, text: `No ${parts.join(" ")}.` };
  })();

  /* Confirmation copy */
  const dialog = (() => {
    if (!pending) return null;
    const n = pending.ids.length;
    const one = n === 1 ? items.find((s) => s.id === pending.ids[0]) : undefined;
    const who = one ? <strong className="break-all font-medium text-ink">{one.email}</strong> : <strong className="font-medium text-ink">{n} subscribers</strong>;
    if (pending.kind === "delete")
      return {
        title: n === 1 ? "Delete subscriber?" : `Delete ${n} subscribers?`,
        description: <>This permanently removes {who} from the subscriber list. It can&rsquo;t be undone.</>,
        confirmLabel: "Delete",
        tone: "danger" as const,
        icon: <Trash2 aria-hidden="true" size={20} />,
      };
    if (pending.kind === "unsubscribe")
      return {
        title: n === 1 ? "Unsubscribe this person?" : `Unsubscribe ${n} subscribers?`,
        description: <>{who} will be marked as unsubscribed with today&rsquo;s date. No email is sent.</>,
        confirmLabel: "Unsubscribe",
        tone: "danger" as const,
        icon: <MailX aria-hidden="true" size={20} />,
      };
    return {
      title: "Reactivate subscriber?",
      description: <>{who} will be marked active again. Only do this if they asked to rejoin. No email is sent.</>,
      confirmLabel: "Reactivate",
      tone: "primary" as const,
      icon: <RotateCcw aria-hidden="true" size={20} />,
    };
  })();

  const EmptyIcon = empty.icon;

  return (
    <>
      <SubscriberStats data={stats} />

      <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:mt-6 xl:grid-cols-[minmax(0,1fr)_minmax(19.5rem,23rem)] xl:gap-6">
        <section aria-label="Subscribers list" className="admin-fade-up min-w-0 rounded-xl border border-black/[0.08] bg-white/80 p-4 [animation-delay:320ms] sm:p-6">
          <SubscriberToolbar filters={filters} onChange={changeFilters} onClear={clearFilters} onExport={exportCsv} onAdd={() => setAdding(true)} />

          {visibleChecked.length > 0 && (
            <div className="admin-pop mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-[#f7e7e6] px-3 py-2 text-sm" role="region" aria-label="Bulk actions">
              <span className="mr-auto font-medium text-[#5a0c14]">{visibleChecked.length} selected</span>
              <button type="button" onClick={() => bulk("unsubscribe")} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-ink hover:bg-white focus-visible:outline-2 focus-visible:outline-burgundy">
                <MailX aria-hidden="true" size={15} /> Unsubscribe
              </button>
              <button type="button" onClick={() => bulk("delete")} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[#a3242f] hover:bg-white focus-visible:outline-2 focus-visible:outline-burgundy">
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
                <EmptyIcon aria-hidden="true" size={28} strokeWidth={1.4} className="text-ink-3" />
                <p className="mt-3 max-w-sm text-sm text-ink-2">{empty.text}</p>
                {hasSubscriberFilters(filters) && (
                  <button type="button" onClick={clearFilters} className="mt-4 h-10 rounded-md border border-black/20 px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <SubscriberTable rows={rows} selectedId={selectedId} checked={checked} actions={actions} onToggle={toggle} onToggleAll={toggleAll} serifClassName={serifClassName} />
                </div>
                <div className="md:hidden">
                  <SubscriberMobileList rows={rows} selectedId={selectedId} checked={checked} actions={actions} onToggle={toggle} serifClassName={serifClassName} />
                </div>
              </>
            )}
          </div>

          <div className="mt-5 border-t border-black/[0.06] pt-5">
            <EnquiryPagination page={current} pages={pages} total={filtered.length} from={from} to={to} onPage={setPage} noun="subscribers" />
          </div>
        </section>

        <aside
          aria-labelledby={selected ? "subscriber-detail-title" : undefined}
          aria-label={selected ? undefined : "Subscriber details"}
          className="admin-fade-up sticky top-6 hidden min-h-[30rem] rounded-xl border border-black/[0.08] bg-white/80 [animation-delay:400ms] xl:block"
        >
          {isDesktop && <SubscriberDetailPanel subscriber={selected} actions={actions} onClose={closeDetail} serifClassName={serifClassName} />}
        </aside>
      </div>

      {/* Drawer (below 1280px) */}
      <div className="xl:hidden">
        <div aria-hidden="true" onClick={() => setDrawerOpen(false)} className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${drawerVisible ? "opacity-100" : "pointer-events-none opacity-0"}`} />
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="subscriber-detail-title"
          inert={!drawerVisible}
          className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[var(--cream)] shadow-[-12px_0_40px_-20px_rgba(36,12,14,0.4)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md ${
            drawerVisible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {!isDesktop && selected && <SubscriberDetailPanel subscriber={selected} variant="drawer" actions={actions} onClose={() => setDrawerOpen(false)} serifClassName={serifClassName} />}
        </div>
      </div>

      {adding && <AddSubscriberDialog open existingEmails={items.map((s) => s.email)} onSubmit={add} onClose={() => setAdding(false)} />}

      <ConfirmDialog
        open={dialog !== null}
        title={dialog?.title ?? ""}
        description={dialog?.description ?? ""}
        confirmLabel={dialog?.confirmLabel ?? "Confirm"}
        tone={dialog?.tone}
        icon={dialog?.icon}
        busy={busy}
        onConfirm={() => void confirm()}
        onCancel={() => setPending(null)}
      />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
        {toast && <p className="admin-pop rounded-lg bg-[#240C0E] px-4 py-2.5 text-sm text-[#F8F5F0] shadow-lg">{toast}</p>}
      </div>
    </>
  );
}
