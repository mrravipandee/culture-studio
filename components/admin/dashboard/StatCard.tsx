import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { editorialSerif } from "@/lib/fonts";
import { formatNumber } from "@/lib/admin/dashboard-utils";

export interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  /** Real comparison from the dataset (shown only when both periods exist). */
  change?: { percent: number; caption: string } | null;
  /** Plain secondary line when there is no comparison. */
  note?: string;
  delay?: number;
}

export default function StatCard({ icon: Icon, value, label, change, note, delay = 0 }: StatCardProps) {
  const Trend = !change ? null : change.percent > 0 ? ArrowUpRight : change.percent < 0 ? ArrowDownRight : Minus;
  const trendColor = !change ? "" : change.percent > 0 ? "text-[#2f7d4f]" : change.percent < 0 ? "text-[#b3261e]" : "text-ink-2";

  return (
    <article
      className="admin-fade-up flex h-full flex-col rounded-xl border border-black/[0.08] bg-white/80 p-4 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-black/15 hover:shadow-[0_10px_30px_-18px_rgba(36,12,14,0.35)] sm:p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon aria-hidden="true" size={26} strokeWidth={1.5} className="text-[#4a121a]" />
      <p className={`${editorialSerif.className} mt-4 text-[2.125rem] sm:mt-5 sm:text-[2.5rem] font-medium leading-none tracking-[-0.01em] text-[#1a0a0c]`}>
        {formatNumber(value)}
      </p>
      <h2 className="mt-2 text-sm text-ink sm:text-[0.9375rem]">{label}</h2>
      <div className="mt-auto pt-4 text-xs text-ink-3">
        {change && Trend ? (
          <p className="flex items-center gap-1.5">
            <span className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
              <Trend aria-hidden="true" size={15} strokeWidth={2} />
              {change.percent > 0 ? "+" : ""}
              {change.percent}%
            </span>
            <span>{change.caption}</span>
          </p>
        ) : (
          note && <p>{note}</p>
        )}
      </div>
    </article>
  );
}
