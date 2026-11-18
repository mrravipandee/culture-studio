/**
 * Newsletter subscriber helpers. Pure and client-safe: every function takes the list (and
 * "now" where dates matter) as arguments, so it is testable and ready for API data.
 */

import { subscriberSourceLabels, subscriberStatusLabels, SUBSCRIBER_SOURCES, type Subscriber, type SubscriberSource, type SubscriberStatus } from "./types";

const time = (iso: string | undefined | null) => {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? null : t;
};

/* Collections and counts ---------------------------------------------------------------- */

/** Valid records, newest subscription first. */
export const getAllSubscribers = (list: Subscriber[]) =>
  list.filter((s) => time(s.subscribedAt) !== null).sort((a, b) => (time(b.subscribedAt) ?? 0) - (time(a.subscribedAt) ?? 0));

export const getActiveSubscribers = (list: Subscriber[]) => list.filter((s) => s.status === "ACTIVE");
export const getUnsubscribedSubscribers = (list: Subscriber[]) => list.filter((s) => s.status === "UNSUBSCRIBED");

/** "Total Subscribers" = people currently subscribed (ACTIVE). */
export const getTotalSubscribers = (list: Subscriber[]) => getActiveSubscribers(list).length;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
/** Year and month of a timestamp in India time (the business's calendar). */
const istMonth = (t: number) => {
  const d = new Date(t + IST_OFFSET_MS);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
};

/** Subscriptions whose date falls in the current calendar month (India time). */
export const getNewSubscribersThisMonth = (list: Subscriber[], now: number) => {
  const month = istMonth(now);
  return list.filter((s) => {
    const t = time(s.subscribedAt);
    return t !== null && t <= now && istMonth(t) === month;
  }).length;
};

export const getSubscribersBySource = (list: Subscriber[]) =>
  SUBSCRIBER_SOURCES.map((source) => ({ source, label: subscriberSourceLabels[source], count: list.filter((s) => s.source === source).length }));

const DAY = 86_400_000;

/**
 * New subscriptions in the last `days` days vs the `days` before that. Returns null when the
 * data does not cover both periods or the previous period had none (no invented growth).
 */
export function getSubscriberGrowth(list: Subscriber[], now: number, days = 30) {
  const times = list.map((s) => time(s.subscribedAt)).filter((t): t is number => t !== null);
  if (times.length === 0 || Math.min(...times) > now - 2 * days * DAY) return null;
  const current = times.filter((t) => t > now - days * DAY && t <= now).length;
  const previous = times.filter((t) => t > now - 2 * days * DAY && t <= now - days * DAY).length;
  if (previous === 0) return null;
  return { current, previous, percent: Math.round(((current - previous) / previous) * 100) };
}

export const getRecentSubscribers = (list: Subscriber[], limit = 5) => getAllSubscribers(list).slice(0, limit);

/* Search and filters --------------------------------------------------------------------- */

export type DateRange = "all" | "7d" | "30d" | "month";
export const dateRangeLabels: Record<DateRange, string> = { all: "All Time", "7d": "Last 7 Days", "30d": "Last 30 Days", month: "This Month" };

export interface SubscriberFilters {
  search: string;
  status: SubscriberStatus | "all";
  source: SubscriberSource | "all";
  range: DateRange;
}

export const emptySubscriberFilters: SubscriberFilters = { search: "", status: "all", source: "all", range: "all" };
export const hasSubscriberFilters = (f: SubscriberFilters) => f.search.trim() !== "" || f.status !== "all" || f.source !== "all" || f.range !== "all";

export function inRange(iso: string, range: DateRange, now: number) {
  if (range === "all") return true;
  const t = time(iso);
  if (t === null || t > now) return false;
  if (range === "7d") return t > now - 7 * DAY;
  if (range === "30d") return t > now - 30 * DAY;
  return istMonth(t) === istMonth(now);
}

/** Case-insensitive search over name and email. */
export const matchesSubscriber = (s: Subscriber, query: string) => {
  const q = query.trim().toLowerCase();
  return !q || s.email.toLowerCase().includes(q) || (s.name ?? "").toLowerCase().includes(q);
};

/** Filters the FULL list (before pagination), newest first. */
export const filterSubscribers = (list: Subscriber[], f: SubscriberFilters, now: number) =>
  getAllSubscribers(list).filter(
    (s) => (f.status === "all" || s.status === f.status) && (f.source === "all" || s.source === f.source) && inRange(s.subscribedAt, f.range, now) && matchesSubscriber(s, f.search),
  );

export const SUBSCRIBER_PAGE_SIZE = 6;

/* Add subscriber -------------------------------------------------------------------------- */

export const normaliseEmail = (value: string) => value.trim().toLowerCase();

/** Practical email check (local@domain.tld, no spaces, sane length). */
export const EMAIL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i;

export interface NewSubscriberValues {
  name: string;
  email: string;
  source: SubscriberSource;
  status: SubscriberStatus;
}

export type NewSubscriberErrors = Partial<Record<keyof NewSubscriberValues, string>>;

export function validateNewSubscriber(v: NewSubscriberValues, existingEmails: string[]): NewSubscriberErrors {
  const e: NewSubscriberErrors = {};
  const email = normaliseEmail(v.email);
  const name = v.name.replace(/\s+/g, " ").trim();
  if (!email) e.email = "Enter an email address.";
  else if (email.length > 254 || !EMAIL_PATTERN.test(email) || email.includes("..")) e.email = "Enter a valid email address, e.g. name@example.com.";
  else if (existingEmails.map(normaliseEmail).includes(email)) e.email = "This email is already in the list.";
  if (name.length > 80) e.name = "Keep the name under 80 characters.";
  if (!(SUBSCRIBER_SOURCES as string[]).includes(v.source)) e.source = "Choose a source from the list.";
  if (v.status !== "ACTIVE" && v.status !== "UNSUBSCRIBED") e.status = "Choose a status.";
  return e;
}

/* Activity --------------------------------------------------------------------------------- */

export interface SubscriberEvent {
  kind: "subscribed" | "verified" | "unsubscribed" | "reactivated" | "added";
  label: string;
  at: string;
}

/** Timeline from recorded fields only; nothing is inferred. */
export function subscriberEvents(s: Subscriber): SubscriberEvent[] {
  const events: SubscriberEvent[] = [{ kind: s.isLocal ? "added" : "subscribed", label: s.isLocal ? "Added manually (local preview)" : "Subscribed to newsletter", at: s.subscribedAt }];
  if (s.verifiedAt) events.push({ kind: "verified", label: "Email verified", at: s.verifiedAt });
  if (s.unsubscribedAt) events.push({ kind: "unsubscribed", label: "Unsubscribed", at: s.unsubscribedAt });
  if (s.reactivatedAt) events.push({ kind: "reactivated", label: "Reactivated", at: s.reactivatedAt });
  return events.filter((ev) => time(ev.at) !== null).sort((a, b) => (time(a.at) ?? 0) - (time(b.at) ?? 0));
}

/* CSV export --------------------------------------------------------------------------------- */

/**
 * RFC 4180 field: quoted when it contains a comma, quote or line break; quotes doubled.
 * Values starting with = + - @ (or tab/CR) are prefixed with ' so spreadsheet apps don't
 * treat them as formulas (CSV injection).
 */
export function csvField(value: string | undefined | null) {
  let v = value ?? "";
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

const CSV_COLUMNS: [string, (s: Subscriber) => string | undefined][] = [
  ["Name", (s) => s.name],
  ["Email", (s) => s.email],
  ["Status", (s) => subscriberStatusLabels[s.status]],
  ["Source", (s) => subscriberSourceLabels[s.source]],
  ["Subscribed At", (s) => s.subscribedAt],
  ["Unsubscribed At", (s) => s.unsubscribedAt],
  ["Verified At", (s) => s.verifiedAt],
];

/** CSV of exactly the given records (only the listed fields; no internal ids). */
export const subscribersToCsv = (list: Subscriber[]) =>
  [CSV_COLUMNS.map(([h]) => csvField(h)).join(","), ...list.map((s) => CSV_COLUMNS.map(([, get]) => csvField(get(s))).join(","))].join("\r\n") + "\r\n";

export const csvFilename = (now: number) => `culture-subscribers-${new Date(now + IST_OFFSET_MS).toISOString().slice(0, 10)}.csv`;

/* Display -------------------------------------------------------------------------------------- */

export const subscriberInitials = (s: Pick<Subscriber, "name" | "email">) => {
  const source = s.name?.trim() || s.email.split("@")[0].replace(/[._-]+/g, " ");
  return (
    source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "?"
  );
};

const IST = "Asia/Kolkata";
export const formatSubscriberDate = (iso: string | undefined, withTime = false) => {
  const t = time(iso);
  if (t === null) return null;
  const d = new Date(t);
  const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: IST }).format(d);
  return withTime ? `${date} at ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: IST }).format(d)}` : date;
};
