"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  adminFooterNav,
  adminMainNav,
  isAdminNavActive,
  type AdminNavBadges,
  type AdminNavItem,
} from "@/lib/admin/navigation";
import { editorialSerif } from "@/lib/fonts";
import { useAdminLogout } from "./useAdminLogout";

/**
 * How labels are shown:
 * - "expanded":  labels visible
 * - "collapsed": icon rail; labels screen-reader only, tooltips on hover/focus
 * - "auto":      collapsed on tablet (768–1023px), expanded from 1024px
 */
export type SidebarMode = "auto" | "expanded" | "collapsed";

const LABEL: Record<SidebarMode, string> = {
  expanded: "",
  collapsed: "sr-only",
  auto: "md:max-lg:sr-only",
};
/** Tooltips only when the label is hidden. */
const TIP: Record<SidebarMode, string> = {
  expanded: "hidden",
  collapsed: "",
  auto: "hidden md:max-lg:block",
};
const EXPANDED_ONLY: Record<SidebarMode, string> = { expanded: "", collapsed: "hidden", auto: "md:max-lg:hidden" };
const COLLAPSED_ONLY: Record<SidebarMode, string> = { expanded: "hidden", collapsed: "", auto: "hidden md:max-lg:block" };

const rowBase =
  "group relative flex h-11 w-full items-center gap-3.5 rounded-md px-3 text-[0.9375rem] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8F5F0]";

function Tooltip({ label, mode }: { label: string; mode: SidebarMode }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#140607] px-2.5 py-1.5 text-xs text-[#F8F5F0] opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${TIP[mode]}`}
    >
      {label}
    </span>
  );
}

function NavItem({
  item,
  active,
  badge,
  mode,
  onNavigate,
}: {
  item: AdminNavItem;
  active: boolean;
  badge?: number;
  mode: SidebarMode;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
        className={`${rowBase} ${
          active ? "bg-[#F8F5F0]/[0.13] text-[#F8F5F0]" : "text-[#F8F5F0]/75 hover:bg-[#F8F5F0]/[0.07] hover:text-[#F8F5F0]"
        }`}
      >
        <span className="relative shrink-0">
          <Icon aria-hidden="true" size={20} strokeWidth={1.6} />
          {badge ? (
            <span aria-hidden="true" className={`absolute -right-1 -top-1 size-2 rounded-full bg-[#e3a59d] ${COLLAPSED_ONLY[mode]}`} />
          ) : null}
        </span>
        <span className={`flex-1 truncate ${LABEL[mode]}`}>{item.label}</span>
        {badge ? (
          <span className={`rounded-full bg-[#8a3a3f] px-2 py-0.5 text-xs font-medium leading-none text-[#F8F5F0] ${EXPANDED_ONLY[mode]}`}>
            <span className="sr-only">, </span>
            {badge}
            <span className="sr-only"> new</span>
          </span>
        ) : null}
        <Tooltip label={badge ? `${item.label} (${badge} new)` : item.label} mode={mode} />
      </Link>
    </li>
  );
}

interface AdminSidebarProps {
  mode: SidebarMode;
  badges?: AdminNavBadges;
  /** Desktop only: collapse/expand control. */
  onToggleCollapse?: () => void;
  /** Whether the rail is visually collapsed right now (labels the toggle correctly in "auto"). */
  collapsed?: boolean;
  /** Mobile drawer: close after choosing a destination. */
  onNavigate?: () => void;
  /** Mobile drawer: optional extra header control (close button). */
  headerAction?: React.ReactNode;
}

/** Sidebar content shared by the desktop sidebar and the mobile drawer. */
export default function AdminSidebar({ mode, badges = {}, onToggleCollapse, collapsed = false, onNavigate, headerAction }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout, pending } = useAdminLogout();

  return (
    <div className="relative isolate flex h-full w-full flex-col bg-[#240C0E] text-[#F8F5F0]">
      {/* One subtle curve of light, as in the reference. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[radial-gradient(140%_55%_at_110%_72%,rgba(140,38,50,0.38),transparent_62%)]"
      />

      {/* Brand */}
      <div className="flex items-start justify-between gap-2 px-6 pt-8 pb-8">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F8F5F0]"
        >
          <span className={`block ${editorialSerif.className} text-[1.75rem] leading-none tracking-[-0.01em] ${EXPANDED_ONLY[mode]}`}>
            CULT.URE
          </span>
          <span
            aria-hidden="true"
            className={`block ${editorialSerif.className} text-[1.75rem] leading-none ${COLLAPSED_ONLY[mode]}`}
          >
            C.
          </span>
          <span className={`mt-3 block text-[0.6875rem] uppercase tracking-[0.2em] text-[#F8F5F0]/65 ${EXPANDED_ONLY[mode]}`}>
            Admin Portal
          </span>
          <span className="sr-only"> CULT.URE Admin Portal, go to dashboard</span>
        </Link>
        {headerAction}
      </div>

      {/* Main navigation */}
      <nav aria-label="Admin" className="min-h-0 flex-1 px-4">
        <ul className="space-y-1.5">
          {adminMainNav.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={isAdminNavActive(pathname, item.href)}
              badge={badges[item.id]}
              mode={mode}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </nav>

      {/* Footer navigation */}
      <div className="px-4 pb-6">
        <div aria-hidden="true" className="mx-2 mb-4 h-px bg-[#F8F5F0]/20" />
        <ul className="space-y-1.5">
          {adminFooterNav.map((item) => (
            <NavItem key={item.id} item={item} active={isAdminNavActive(pathname, item.href)} mode={mode} onNavigate={onNavigate} />
          ))}
          <li>
            <button
              type="button"
              onClick={logout}
              disabled={pending}
              className={`${rowBase} text-[#F8F5F0]/75 hover:bg-[#F8F5F0]/[0.07] hover:text-[#F8F5F0] disabled:opacity-60`}
            >
              <LogOut aria-hidden="true" size={20} strokeWidth={1.6} className="shrink-0" />
              <span className={`flex-1 text-left ${LABEL[mode]}`}>{pending ? "Signing out…" : "Logout"}</span>
              <Tooltip label="Logout" mode={mode} />
            </button>
          </li>
          {onToggleCollapse && (
            <li>
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                className={`${rowBase} text-[#F8F5F0]/55 hover:bg-[#F8F5F0]/[0.07] hover:text-[#F8F5F0]`}
              >
                <span className={`shrink-0 ${EXPANDED_ONLY[mode]}`}>
                  <PanelLeftClose aria-hidden="true" size={20} strokeWidth={1.6} />
                </span>
                <span className={`shrink-0 ${COLLAPSED_ONLY[mode]}`}>
                  <PanelLeftOpen aria-hidden="true" size={20} strokeWidth={1.6} />
                </span>
                <span aria-hidden="true" className={`flex-1 text-left text-sm ${LABEL[mode]}`}>
                  Collapse
                </span>
                <Tooltip label="Expand sidebar" mode={mode} />
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
