/**
 * Enquiry display helpers. Pure and client-safe.
 *
 * Filtering, search, pagination and counts now happen in MongoDB
 * (lib/enquiries/repository.ts via /api/admin/enquiries). What stays here is shared UI
 * logic: page lists, labels and date formatting (India time).
 */

import { serviceLabels, type EnquiryStatus, type ServiceId } from "./types";
import { ENQUIRY_PAGE_SIZE, nextStatuses } from "@/lib/validation/enquiry";

export { nextStatuses };

/* UI filter state (mirrors the API query) ------------------------------------------- */

export interface EnquiryFilters {
  search: string;
  service: ServiceId | "all";
  status: EnquiryStatus | "all";
  range: "all" | "today" | "7d" | "30d" | "month";
}

export const emptyFilters: EnquiryFilters = { search: "", service: "all", status: "all", range: "all" };
export const hasActiveFilters = (f: EnquiryFilters) => f.search.trim() !== "" || f.service !== "all" || f.status !== "all" || f.range !== "all";

/** Query string for GET /api/admin/enquiries (only non-default values). */
export function enquiryQueryString(f: EnquiryFilters, page: number, pageSize = ENQUIRY_PAGE_SIZE) {
  const q = new URLSearchParams();
  if (page > 1) q.set("page", String(page));
  if (pageSize !== ENQUIRY_PAGE_SIZE) q.set("pageSize", String(pageSize));
  if (f.search.trim()) q.set("search", f.search.trim().slice(0, 100));
  if (f.status !== "all") q.set("status", f.status);
  if (f.service !== "all") q.set("service", f.service);
  if (f.range !== "all") q.set("range", f.range);
  return q.toString();
}

/* Pagination ------------------------------------------------------------ */

export const PAGE_SIZE = ENQUIRY_PAGE_SIZE;
export const pageCount = (total: number, size = PAGE_SIZE) => Math.max(1, Math.ceil(total / size));
export const paginate = <T,>(list: T[], page: number, size = PAGE_SIZE) => list.slice((page - 1) * size, page * size);

/** e.g. 1 2 3 … 8, keeping the current page visible. */
export function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "gap", total];
  if (current >= total - 2) return [1, "gap", total - 2, total - 1, total];
  return [1, "gap", current, "gap", total];
}

/* Display ----------------------------------------------------------------- */

export const serviceLabel = (id: ServiceId) => serviceLabels[id] ?? id;

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

const time = (iso: string) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
};

const IST = "Asia/Kolkata";
export const formatEnquiryDate = (iso: string) => {
  const t = time(iso);
  return t === null ? "—" : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: IST }).format(new Date(t));
};
export const formatEnquiryDateTime = (iso: string) => {
  const t = time(iso);
  if (t === null) return "—";
  const d = new Date(t);
  const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: IST }).format(d);
  const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: IST }).format(d);
  return `${date} at ${clock}`;
};
