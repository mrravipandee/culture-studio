"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronDown, Eye, EyeOff, FileText, Info, Plus, Search, SearchX, SlidersHorizontal, Trash2, X } from "lucide-react";
import { BLOG_CATEGORIES, blogStatusLabels, type BlogStatus } from "@/lib/admin/types";
import { BLOG_PAGE_SIZE, blogToForm, emptyBlogFilters, filterBlogs, hasBlogErrors, hasBlogFilters, validateBlog, type BlogFilters } from "@/lib/admin/blog-utils";
import { pageCount, paginate } from "@/lib/admin/enquiry-utils";
import ConfirmDialog from "../ConfirmDialog";
import EnquiryPagination from "../enquiries/EnquiryPagination";
import { useBlogStore } from "./BlogStore";
import BlogStats from "./BlogStats";
import { BlogMobileList, BlogTable, isBlogLive, type BlogRowActions } from "./BlogTable";
import BlogDetailPanel from "./BlogDetailPanel";

const DESKTOP = "(min-width: 1280px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-8 text-[0.8125rem] text-ink transition-colors hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy sm:pl-3.5 sm:pr-9 sm:text-sm";

type Confirm = { kind: "delete"; ids: string[] } | { kind: "publish" | "unpublish"; id: string } | { kind: "incomplete"; id: string; reasons: string[] } | null;

export default function BlogListWorkspace({ serifClassName }: { serifClassName: string }) {
  const store = useBlogStore();
  const router = useRouter();
  const [filters, setFilters] = useState<BlogFilters>(emptyBlogFilters);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(() => filterBlogs(store.items, emptyBlogFilters)[0]?.id ?? null);
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const lock = useRef(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);
  const ids = { search: useId(), status: useId(), category: useId() };

  const filtered = useMemo(() => filterBlogs(store.items, filters), [store.items, filters]);
  const pages = pageCount(filtered.length, BLOG_PAGE_SIZE);
  const current = Math.min(page, pages);
  const rows = paginate(filtered, current, BLOG_PAGE_SIZE);
  const selected = store.items.find((b) => b.id === selectedId) ?? null;

  const change = (next: BlogFilters) => {
    setFilters(next);
    setPage(1);
  };
  const ask = (next: NonNullable<Confirm>) => {
    lock.current = false;
    setConfirm(next);
  };

  const actions: BlogRowActions = {
    onSelect: (id) => {
      setSelectedId(id);
      setDrawerOpen(true);
    },
    onTogglePublish: (id) => {
      const post = store.find(id);
      if (!post) return;
      if (post.status === "PUBLISHED") return ask({ kind: "unpublish", id });
      // Never publish incomplete content: run the full publishing validation first.
      const errors = validateBlog(blogToForm(post), { takenSlugs: store.items.filter((b) => b.id !== id).map((b) => b.slug), intent: "publish" });
      if (hasBlogErrors(errors)) return ask({ kind: "incomplete", id, reasons: Object.values(errors) as string[] });
      ask({ kind: "publish", id });
    },
    onDelete: (id) => ask({ kind: "delete", ids: [id] }),
  };

  const run = () => {
    if (!confirm || lock.current) return;
    lock.current = true;
    if (confirm.kind === "incomplete") {
      router.push(`/admin/blogs/${confirm.id}/edit`);
    } else if (confirm.kind === "delete") {
      if (selectedId && confirm.ids.includes(selectedId)) {
        const index = filtered.findIndex((b) => b.id === selectedId);
        const remaining = filtered.filter((b) => !confirm.ids.includes(b.id));
        const next = remaining[Math.min(Math.max(index, 0), remaining.length - 1)] ?? null;
        setSelectedId(next?.id ?? null);
        if (!next) setDrawerOpen(false);
      }
      const n = store.remove(confirm.ids);
      setChecked((prev) => new Set([...prev].filter((id) => !confirm.ids.includes(id))));
      store.notify(`${n === 1 ? "Article" : `${n} articles`} removed from this preview. Nothing was deleted from the site.`);
    } else {
      const status: BlogStatus = confirm.kind === "publish" ? "PUBLISHED" : "DRAFT";
      if (store.setStatus(confirm.id, status)) store.notify(`${confirm.kind === "publish" ? "Published" : "Unpublished"} in this preview only. The public website has not changed.`);
    }
    setConfirm(null);
  };

  /* Drawer below 1280px */
  const drawerVisible = drawerOpen && !isDesktop && selected !== null;
  useEffect(() => {
    if (!drawerVisible) return;
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>("button, a")?.focus();
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

  const confirmPost = confirm && confirm.kind !== "delete" ? store.items.find((b) => b.id === confirm.id) : null;
  const createButton = (
    <Link href="/admin/blogs/new" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-[#5a0c14] px-4 text-sm font-medium text-white transition-colors hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy">
      <Plus aria-hidden="true" size={17} /> Create New Blog
    </Link>
  );
  const from = filtered.length === 0 ? 0 : (current - 1) * BLOG_PAGE_SIZE + 1;
  const to = Math.min(current * BLOG_PAGE_SIZE, filtered.length);

  return (
    <>
      <BlogStats items={store.items} />
      <p className="mt-4 flex gap-2 rounded-lg border border-[#c08a2d]/20 bg-[#c08a2d]/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-[#6b4a12]">
        <Info aria-hidden="true" size={15} className="mt-px shrink-0" />
        Sample articles from the Blog page. Changes are kept in this tab only: they are not saved to a server, images are not uploaded, and the public website keeps using its publishing list.
      </p>

      <div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)] xl:gap-6">
        <section aria-label="Articles" className="@container admin-fade-up min-w-0 rounded-xl border border-black/[0.08] bg-white/80 p-4 [animation-delay:320ms] sm:p-5">
          <div className="mb-4 flex justify-end xl:hidden">{createButton}</div>

          {/* Toolbar */}
          <div className="flex flex-col gap-3 @[40rem]:flex-row @[40rem]:items-center">
            <div role="search" className="relative min-w-0 flex-1">
              <label htmlFor={ids.search} className="sr-only">
                Search articles
              </label>
              <Search aria-hidden="true" size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                id={ids.search}
                type="search"
                value={filters.search}
                maxLength={120}
                onChange={(e) => change({ ...filters, search: e.target.value })}
                placeholder="Search by title, slug, tag or author…"
                autoComplete="off"
                className="h-11 w-full rounded-lg border border-black/15 bg-white pl-10 pr-10 text-sm text-ink placeholder:text-ink-3 hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy [&::-webkit-search-cancel-button]:hidden"
              />
              {filters.search && (
                <button type="button" onClick={() => change({ ...filters, search: "" })} aria-label="Clear search" className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-ink-3 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-burgundy">
                  <X aria-hidden="true" size={16} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 @[40rem]:flex">
              <div className="relative @[40rem]:w-32">
                <label htmlFor={ids.status} className="sr-only">
                  Filter by status
                </label>
                <select id={ids.status} value={filters.status} onChange={(e) => change({ ...filters, status: e.target.value as BlogStatus | "all" })} className={selectClass}>
                  <option value="all">All Status</option>
                  {(Object.keys(blogStatusLabels) as BlogStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {blogStatusLabels[s]}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2" />
              </div>
              <div className="relative @[40rem]:w-40">
                <label htmlFor={ids.category} className="sr-only">
                  Filter by category
                </label>
                <select id={ids.category} value={filters.category} onChange={(e) => change({ ...filters, category: e.target.value })} className={selectClass}>
                  <option value="all">All Categories</option>
                  {BLOG_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2" />
              </div>
              <button
                type="button"
                onClick={() => change(emptyBlogFilters)}
                disabled={!hasBlogFilters(filters)}
                aria-label="Clear search and filters"
                title="Clear search and filters"
                className="relative grid size-11 place-items-center rounded-lg border border-black/15 bg-white text-ink hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SlidersHorizontal aria-hidden="true" size={18} strokeWidth={1.6} />
                {hasBlogFilters(filters) && <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#7a1f2b]" />}
              </button>
            </div>
          </div>

          {checked.size > 0 && (
            <div role="region" aria-label="Bulk actions" className="admin-pop mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-[#f7e7e6] px-3 py-2 text-sm">
              <span className="mr-auto font-medium text-[#5a0c14]">{checked.size} selected</span>
              <button type="button" onClick={() => ask({ kind: "delete", ids: [...checked] })} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[#a3242f] hover:bg-white focus-visible:outline-2 focus-visible:outline-burgundy">
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
                {store.items.length === 0 ? <FileText aria-hidden="true" size={28} strokeWidth={1.4} className="text-ink-3" /> : <SearchX aria-hidden="true" size={28} strokeWidth={1.4} className="text-ink-3" />}
                <p className="mt-3 max-w-sm text-sm text-ink-2">
                  {store.items.length === 0
                    ? "No articles in this preview yet."
                    : filters.search.trim()
                      ? `No articles match “${filters.search.trim()}”.`
                      : "No articles match these filters."}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {hasBlogFilters(filters) && (
                    <button type="button" onClick={() => change(emptyBlogFilters)} className="h-10 rounded-md border border-black/20 px-4 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-burgundy">
                      Clear filters
                    </button>
                  )}
                  {store.items.length === 0 && createButton}
                </div>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <BlogTable rows={rows} selectedId={selectedId} checked={checked} actions={actions} onToggle={(id) => setChecked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; })} onToggleAll={(idList, on) => setChecked((p) => { const n = new Set(p); idList.forEach((id) => (on ? n.add(id) : n.delete(id))); return n; })} />
                </div>
                <div className="md:hidden">
                  <BlogMobileList rows={rows} selectedId={selectedId} checked={checked} actions={actions} onToggle={(id) => setChecked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; })} />
                </div>
              </>
            )}
          </div>

          <div className="mt-5 border-t border-black/[0.06] pt-4">
            <EnquiryPagination page={current} pages={pages} total={filtered.length} from={from} to={to} onPage={setPage} noun={filtered.length === 1 ? "blog" : "blogs"} />
          </div>
        </section>

        <div className="hidden space-y-4 xl:sticky xl:top-6 xl:block">
          <div className="flex justify-end">{createButton}</div>
          <aside aria-labelledby={selected ? "blog-detail-title" : undefined} aria-label={selected ? undefined : "Article details"} className="admin-fade-up rounded-xl border border-black/[0.08] bg-white/80 [animation-delay:400ms]">
            <BlogDetailPanel
              post={selected}
              actions={actions}
              onClose={() => {
                setDrawerOpen(false);
                if (isDesktop) setSelectedId(null);
              }}
              serifClassName={serifClassName}
            />
          </aside>
        </div>
      </div>

      {/* Drawer below 1280px */}
      <div className="xl:hidden">
        <div aria-hidden="true" onClick={() => setDrawerOpen(false)} className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${drawerVisible ? "opacity-100" : "pointer-events-none opacity-0"}`} />
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-detail-title"
          inert={!drawerVisible}
          className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto overscroll-contain bg-[var(--cream)] shadow-[-12px_0_40px_-20px_rgba(36,12,14,0.4)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md ${drawerVisible ? "translate-x-0" : "translate-x-full"}`}
        >
          {selected && <BlogDetailPanel post={selected} actions={actions} onClose={() => setDrawerOpen(false)} variant="drawer" serifClassName={serifClassName} />}
        </div>
      </div>

      <ConfirmDialog
        open={confirm?.kind === "delete"}
        tone="danger"
        icon={<Trash2 size={20} strokeWidth={1.75} />}
        title={confirm?.kind === "delete" && confirm.ids.length > 1 ? `Delete ${confirm.ids.length} articles?` : `Delete “${confirm?.kind === "delete" ? store.items.find((b) => b.id === confirm.ids[0])?.title ?? "" : ""}”?`}
        description="Removed from this preview only. The public website and image files are not changed, and it returns on reload."
        confirmLabel="Delete"
        onConfirm={run}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={(confirm?.kind === "publish" || confirm?.kind === "unpublish") && !!confirmPost}
        icon={confirm?.kind === "unpublish" ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
        title={`${confirm?.kind === "unpublish" ? "Unpublish" : "Publish"} “${confirmPost?.title ?? ""}” in this preview?`}
        description={
          confirm?.kind === "unpublish" && confirmPost && isBlogLive(confirmPost)
            ? "It will show as a draft here, but stays live on the public website until the publishing list changes."
            : "This changes its status in the admin only. The public website is not changed."
        }
        confirmLabel={confirm?.kind === "unpublish" ? "Unpublish" : "Publish"}
        onConfirm={run}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === "incomplete"}
        icon={<AlertCircle size={20} strokeWidth={1.75} />}
        title="Not ready to publish"
        description={
          <ul className="list-disc space-y-1 pl-5">
            {confirm?.kind === "incomplete" && confirm.reasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        }
        confirmLabel="Open editor"
        cancelLabel="Close"
        onConfirm={run}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
