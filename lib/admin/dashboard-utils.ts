/**
 * Dashboard calculations. Pure functions: every one takes its collection as an argument
 * (testable, and ready for MongoDB data later). Invalid dates are skipped, empty arrays
 * return zeroes.
 */

import type { AdminBlog, DailyEnquiries, Subscriber } from "./data";
import { serviceLabels, type AdminCaseStudy, type Enquiry, type ServiceId } from "./types";
export { getTotalEnquiries, getNewEnquiries, getRecentEnquiries } from "./enquiry-utils";
import { getActiveSubscribers } from "./subscriber-utils";

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

export function getEnquiriesByService(list: Enquiry[]): ServiceShare[] {
  const ids = Object.keys(serviceLabels) as ServiceId[];
  const counts = ids.map((id) => ({ id, label: serviceLabels[id], count: list.filter((e) => e.service === id).length }));
  const total = list.length;
  if (total === 0) return counts.map((c) => ({ ...c, percent: 0 }));

  const raw = counts.map((c) => (c.count / total) * 100);
  const floors = raw.map(Math.floor);
  let remainder = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (remainder <= 0) break;
    if (counts[i].count > 0) {
      floors[i] += 1;
      remainder -= 1;
    }
  }
  return counts.map((c, i) => ({ ...c, percent: floors[i] })).sort((a, b) => (a.id === "other" ? 1 : b.id === "other" ? -1 : b.count - a.count));
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
