/**
 * Dashboard calculations. Pure functions over data passed in (enquiry figures come from
 * the MongoDB aggregation in lib/enquiries/repository.ts; blog, case-study and subscriber
 * figures still from lib/admin/data.ts). Invalid dates are skipped, empty inputs give zeroes.
 */

import type { AdminBlog, Subscriber } from "./data";
import { serviceLabels, type AdminCaseStudy, type ServiceId } from "./types";
import { getActiveSubscribers } from "./subscriber-utils";

/** One India-time day of enquiries (from the MongoDB aggregation in lib/enquiries/repository.ts). */
export interface DailyEnquiries {
  /** YYYY-MM-DD (India time). */
  date: string;
  count: number;
}

const time = (iso: string | null | undefined) => {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? null : t;
};

/* KPIs ---------------------------------------------------------- */

export const getPublishedCaseStudies = (list: AdminCaseStudy[]) => list.filter((c) => c.status === "PUBLISHED").length;
export const getPublishedBlogs = (list: AdminBlog[]) => list.filter((b) => b.status === "PUBLISHED" && time(b.publishedAt) !== null).length;
export const getDraftBlogs = (list: AdminBlog[]) => list.filter((b) => b.status === "DRAFT").length;
/** Dashboard card: all subscriber records, with the active count as the note. */
export const getSubscriberRecordCount = (list: Subscriber[]) => list.length;
export const getActiveSubscriberCount = (list: Subscriber[]) => getActiveSubscribers(list).length;

/**
 * Enquiries in the last `days` days vs the `days` before that, both ending at `end`.
 * Returns null unless the dataset covers both periods (no fake comparisons).
 */
export function getEnquiryPeriodChange(series: DailyEnquiries[], days: number) {
  if (series.length < days * 2) return null;
  const current = series.slice(-days).reduce((n, d) => n + d.count, 0);
  const previous = series.slice(-days * 2, -days).reduce((n, d) => n + d.count, 0);
  if (previous === 0) return null;
  return { current, previous, percent: Math.round(((current - previous) / previous) * 100) };
}

/* Charts ----------------------------------------------------------- */

export interface SeriesPoint {
  date: string;
  count: number;
}

/** The last `days` days of the series (never invents dates outside the dataset). */
export const getEnquirySeries = (series: DailyEnquiries[], days: number): SeriesPoint[] =>
  series.slice(-days).map(({ date, count }) => ({ date, count }));

export interface ServiceShare {
  id: ServiceId;
  label: string;
  count: number;
  /** Rounded so the shares add up to 100 (largest-remainder method). */
  percent: number;
}

/**
 * Shares of service selections (an enquiry can select several services, so shares are of
 * selections, not of enquiries). Rounded to add up to 100 (largest-remainder method).
 * "Not sure yet" is always listed last.
 */
export function toServiceShares(counts: Record<ServiceId, number>): ServiceShare[] {
  const ids = Object.keys(serviceLabels) as ServiceId[];
  const rows = ids.map((id) => ({ id, label: serviceLabels[id], count: counts[id] ?? 0 }));
  const total = rows.reduce((n, r) => n + r.count, 0);
  if (total === 0) return rows.map((r) => ({ ...r, percent: 0 }));

  const raw = rows.map((r) => (r.count / total) * 100);
  const floors = raw.map(Math.floor);
  let remainder = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (remainder <= 0) break;
    if (rows[i].count > 0) {
      floors[i] += 1;
      remainder -= 1;
    }
  }
  return rows.map((r, i) => ({ ...r, percent: floors[i] })).sort((a, b) => (a.id === "not-sure" ? 1 : b.id === "not-sure" ? -1 : b.count - a.count));
}

/* Recent ----------------------------------------------------------- */

/** Published posts by publish date, drafts by last update; newest first. */
export const blogActivityDate = (b: AdminBlog) => (b.status === "PUBLISHED" ? b.publishedAt : b.updatedAt) ?? b.updatedAt;

export const getRecentBlogs = (list: AdminBlog[], limit = 3) =>
  list
    .filter((b) => time(blogActivityDate(b)) !== null)
    .sort((a, b) => (time(blogActivityDate(b)) ?? 0) - (time(blogActivityDate(a)) ?? 0))
    .slice(0, limit);

/* Formatting --------------------------------------------------------- */

const IST = "Asia/Kolkata";

export const formatDate = (iso: string) => {
  const t = time(iso);
  return t === null
    ? "—"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: IST }).format(new Date(t));
};

export const formatNumber = (n: number) => new Intl.NumberFormat("en-IN").format(n);
