import { MailX, TrendingUp, UserPlus, Users, type LucideIcon } from "lucide-react";
import { editorialSerif } from "@/lib/fonts";

export interface SubscriberStatsData {
  active: number;
  newThisMonth: number;
  unsubscribed: number;
  /** null when the data can't support a comparison. */
  growth: { percent: number; current: number; previous: number } | null;
}

/** KPI cards. Values arrive pre-computed from lib/admin/subscriber-utils.ts. */
export default function SubscriberStats({ data }: { data: SubscriberStatsData }) {
  const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);
  const cards: { icon: LucideIcon; value: string; label: string; note?: string; highlight?: boolean }[] = [
    { icon: Users, value: fmt(data.active), label: "Total Subscribers", note: "Currently active" },
    { icon: UserPlus, value: `${data.newThisMonth > 0 ? "+" : ""}${fmt(data.newThisMonth)}`, label: "New This Month", highlight: true },
    { icon: MailX, value: fmt(data.unsubscribed), label: "Unsubscribed" },
    data.growth
      ? {
          icon: TrendingUp,
          value: `${data.growth.percent > 0 ? "+" : ""}${data.growth.percent}%`,
          label: "Growth",
          note: `${data.growth.current} vs ${data.growth.previous} new, last 30 days vs prior 30`,
        }
      : { icon: TrendingUp, value: "—", label: "Growth", note: "Not enough history to compare" },
  ];

  return (
    <section aria-label="Subscriber summary">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map(({ icon: Icon, value, label, note, highlight }, i) => (
          <li key={label}>
            <article
              className={`admin-fade-up flex h-full items-center gap-4 rounded-xl border p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-18px_rgba(36,12,14,0.35)] sm:gap-5 sm:p-6 ${
                highlight ? "border-[#7a1f2b]/10 bg-[#f7e7e6]" : "border-black/[0.08] bg-white/80"
              }`}
              style={{ animationDelay: `${80 + i * 60}ms` }}
            >
              <Icon aria-hidden="true" size={30} strokeWidth={1.5} className="hidden shrink-0 text-[#7a1f2b] min-[400px]:block" />
              <div className="min-w-0">
                <p className={`${editorialSerif.className} text-[2rem] font-medium leading-none text-[#1a0a0c] sm:text-[2.5rem]`}>{value}</p>
                <h2 className="mt-1.5 text-sm text-ink sm:text-[0.9375rem]">{label}</h2>
                {note && <p className="mt-0.5 text-[0.6875rem] leading-snug text-ink-3">{note}</p>}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
