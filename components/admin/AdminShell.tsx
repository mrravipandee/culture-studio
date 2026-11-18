"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import type { AdminNavBadges } from "@/lib/admin/navigation";
import { editorialSerif } from "@/lib/fonts";
import AdminSidebar, { type SidebarMode } from "./AdminSidebar";
import { useAdminCounts } from "./AdminCountsContext";

/**
 * Admin frame: fixed sidebar from 768px (collapsible), drawer below 768px.
 * Lives in the (panel) layout, so its state survives navigation between admin pages.
 */

const WIDTH: Record<SidebarMode, string> = {
  auto: "[--sb-w:76px] lg:[--sb-w:250px]",
  expanded: "[--sb-w:250px]",
  collapsed: "[--sb-w:76px]",
};

const DESKTOP_QUERY = "(min-width: 1024px)";
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

export default function AdminShell({ children, badges: extraBadges }: { children: ReactNode; badges?: AdminNavBadges }) {
  // Enquiries badge: live NEW count from AdminCountsContext (reported by each page from MongoDB).
  const { newEnquiries } = useAdminCounts();
  const badges: AdminNavBadges = { ...extraBadges, ...(newEnquiries ? { enquiries: newEnquiries } : {}) };
  const [mode, setMode] = useState<SidebarMode>("auto");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const isDesktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP_QUERY).matches, () => true);
  const collapsed = mode === "collapsed" || (mode === "auto" && !isDesktop);

  const toggleCollapse = useCallback(() => setMode(collapsed ? "expanded" : "collapsed"), [collapsed]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButton.current?.focus();
  }, []);

  // Drawer: lock background scroll, close on Escape, move focus into the drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div className={`min-h-screen ${WIDTH[mode]}`}>
      {/* Desktop / tablet sidebar */}
      <aside
        aria-label="Admin sidebar"
        className="fixed inset-y-0 left-0 z-40 hidden w-[var(--sb-w)] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:block"
      >
        <AdminSidebar mode={mode} badges={badges} collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-black/10 bg-[var(--cream)]/95 px-4 backdrop-blur-sm md:hidden">
        <button
          ref={menuButton}
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={drawerOpen}
          aria-controls="admin-drawer"
          className="grid size-11 place-items-center rounded-md text-[#240C0E] hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-burgundy"
        >
          <Menu aria-hidden="true" size={22} strokeWidth={1.6} />
        </button>
        <span className={`${editorialSerif.className} text-xl text-[#240C0E]`}>CULT.URE</span>
        <span className="text-[0.625rem] uppercase tracking-[0.2em] text-ink-3">Admin</span>
      </header>

      {/* Mobile drawer */}
      <div className="md:hidden">
        <div
          aria-hidden="true"
          onClick={closeDrawer}
          className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        />
        <div
          id="admin-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Admin menu"
          inert={!drawerOpen}
          className={`fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar
            mode="expanded"
            badges={badges}
            onNavigate={() => setDrawerOpen(false)}
            headerAction={
              <button
                ref={closeButton}
                type="button"
                onClick={closeDrawer}
                aria-label="Close admin menu"
                className="-mr-2 -mt-1 grid size-10 place-items-center rounded-md text-[#F8F5F0]/80 hover:bg-[#F8F5F0]/10 hover:text-[#F8F5F0] focus-visible:outline-2 focus-visible:outline-[#F8F5F0]"
              >
                <X aria-hidden="true" size={20} strokeWidth={1.6} />
              </button>
            }
          />
        </div>
      </div>

      {/* Content, offset by the sidebar width */}
      <div className="transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:pl-[var(--sb-w)]">{children}</div>
    </div>
  );
}
