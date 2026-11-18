/**
 * Enquiry helpers. Pure and client-safe (they receive the list as an argument and import
 * only types), so the same functions serve the dashboard, the enquiries page, tests and,
 * later, data loaded from MongoDB.
 */

import { serviceLabels, type Enquiry, type EnquiryStatus, type ServiceId } from "./types";

const time = (iso: string) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
};

/** Valid records only, newest first. */
export const getAllEnquiries = (list: Enquiry[]) =>
  list.filter((e) => time(e.createdAt) !== null).sort((a, b) => (time(b.createdAt) ?? 0) - (time(a.createdAt) ?? 0));

export const getEnquiriesByStatus = (list: Enquiry[], status: EnquiryStatus) => list.filter((e) => e.status === status);
export const getTotalEnquiries = (list: Enquiry[]) => list.length;
export const getNewEnquiries = (list: Enquiry[]) => getEnquiriesByStatus(list, "NEW").length;
export const getReadEnquiries = (list: Enquiry[]) => getEnquiriesByStatus(list, "READ").length;
export const getRepliedEnquiries = (list: Enquiry[]) => getEnquiriesByStatus(list, "REPLIED").length;
export const getClosedEnquiries = (list: Enquiry[]) => getEnquiriesByStatus(list, "CLOSED").length;
export const getRecentEnquiries = (list: Enquiry[], limit = 5) => getAllEnquiries(list).slice(0, limit);

/* Search and filters ------------------------------------------------- */

export interface EnquiryFilters {
  search: string;
  service: ServiceId | "all";
  status: EnquiryStatus | "all";
}

export const emptyFilters: EnquiryFilters = { search: "", service: "all", status: "all" };
export const hasActiveFilters = (f: EnquiryFilters) => f.search.trim() !== "" || f.service !== "all" || f.status !== "all";

/** Case-insensitive match on name, email, company and message. */
export function matchesSearch(e: Enquiry, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [e.name, e.email, e.company ?? "", e.message].some((field) => field.toLowerCase().includes(q));
}

export const filterEnquiries = (list: Enquiry[], f: EnquiryFilters) =>
  list.filter((e) => (f.service === "all" || e.service === f.service) && (f.status === "all" || e.status === f.status) && matchesSearch(e, f.search));

/* Pagination ------------------------------------------------------------ */

export const PAGE_SIZE = 6;
export const pageCount = (total: number, size = PAGE_SIZE) => Math.max(1, Math.ceil(total / size));
export const paginate = <T,>(list: T[], page: number, size = PAGE_SIZE) => list.slice((page - 1) * size, page * size);

/** e.g. 1 2 3 … 8, keeping the current page visible. */
export function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "gap", total];
  if (current >= total - 2) return [1, "gap", total - 2, total - 1, total];
  return [1, "gap", current, "gap", total];
}

/* Status actions -------------------------------------------------------- */

/** Status changes that make sense from each state (invalid ones are not offered). */
export const nextStatuses: Record<EnquiryStatus, EnquiryStatus[]> = {
  NEW: ["READ", "REPLIED", "CLOSED"],
  READ: ["REPLIED", "CLOSED"],
  REPLIED: ["CLOSED"],
  CLOSED: [],
};

/* Display ----------------------------------------------------------------- */

export const serviceLabel = (id: ServiceId) => serviceLabels[id] ?? "Other";

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

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
