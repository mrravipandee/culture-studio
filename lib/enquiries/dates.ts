/**
 * Enquiry date definitions, in India time (Asia/Kolkata, UTC+05:30, no DST).
 * Pure and client-safe; shared by the admin list filter and the dashboard so both use the
 * same days.
 *
 *  today  00:00 today (IST) → now
 *  7d     today and the 6 days before it (7 calendar days)
 *  30d    today and the 29 days before it
 *  month  the 1st of the current month (IST) → now
 *  from/to explicit calendar days, inclusive
 */

import type { EnquiryRange } from "@/lib/validation/enquiry";

export const IST_TIMEZONE = "Asia/Kolkata";
const IST_OFFSET = "+05:30";
const DAY = 86_400_000;

/** "YYYY-MM-DD" of `date` in India time. */
export const istDay = (date: Date | number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: IST_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(date));

/** The instant at 00:00 IST of a "YYYY-MM-DD" day. */
export const istDayStart = (day: string) => new Date(`${day}T00:00:00${IST_OFFSET}`);

export interface DateWindow {
  start?: Date;
  /** Exclusive. */
  end?: Date;
}

export function rangeWindow(range: EnquiryRange, now: number): DateWindow {
  if (range === "all") return {};
  const today = istDayStart(istDay(now));
  if (range === "today") return { start: today };
  if (range === "7d") return { start: new Date(today.getTime() - 6 * DAY) };
  if (range === "30d") return { start: new Date(today.getTime() - 29 * DAY) };
  return { start: istDayStart(`${istDay(now).slice(0, 8)}01`) }; // month
}

/** Intersects a preset range with optional explicit days. */
export function queryWindow(range: EnquiryRange, now: number, from?: string, to?: string): DateWindow {
  const w = rangeWindow(range, now);
  const starts = [w.start, from ? istDayStart(from) : undefined].filter((d): d is Date => d instanceof Date);
  const ends = [w.end, to ? new Date(istDayStart(to).getTime() + DAY) : undefined].filter((d): d is Date => d instanceof Date);
  return {
    start: starts.length ? new Date(Math.max(...starts.map((d) => d.getTime()))) : undefined,
    end: ends.length ? new Date(Math.min(...ends.map((d) => d.getTime()))) : undefined,
  };
}

/** The last `days` IST calendar days ending today, oldest first ("YYYY-MM-DD"). */
export function lastDays(days: number, now: number): string[] {
  const today = istDayStart(istDay(now)).getTime();
  return Array.from({ length: days }, (_, i) => istDay(today - (days - 1 - i) * DAY + 12 * 3_600_000));
}
