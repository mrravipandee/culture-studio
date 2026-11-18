/**
 * Admin sidebar navigation: the single source for labels, routes, icons and matching.
 * Some destinations are planned routes that do not have pages yet.
 */

import { FileText, Inbox, Layers, LayoutDashboard, Settings, Users, type LucideIcon } from "lucide-react";

export type AdminNavId = "dashboard" | "enquiries" | "case-studies" | "blogs" | "subscribers" | "settings";

export interface AdminNavItem {
  id: AdminNavId;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminMainNav: AdminNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { id: "enquiries", label: "Enquiries", href: "/admin/enquiries", icon: Inbox },
  { id: "case-studies", label: "Case Studies", href: "/admin/case-studies", icon: Layers },
  { id: "blogs", label: "Blog", href: "/admin/blogs", icon: FileText },
  { id: "subscribers", label: "Subscribe Emails", href: "/admin/subscribers", icon: Users },
];

export const adminFooterNav: AdminNavItem[] = [{ id: "settings", label: "Settings", href: "/admin/settings", icon: Settings }];

/** Optional counts shown as badges (e.g. new enquiries). Omitted until real data exists. */
export type AdminNavBadges = Partial<Record<AdminNavId, number>>;

/** Exact route or any nested route: /admin/blogs/new and /admin/blogs/123/edit keep Blog active. */
export const isAdminNavActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);
