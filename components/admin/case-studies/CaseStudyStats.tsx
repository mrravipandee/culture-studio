import { Archive, CheckCircle2, Layers, PenLine, type LucideIcon } from "lucide-react";
import { editorialSerif } from "@/lib/fonts";
import type { CaseStudyCounts } from "@/lib/admin/types";

/** KPI cards from the database counts (active records; soft-deleted ones are excluded). No view analytics exist, so none are shown. */
export default function CaseStudyStats({ counts }: { counts: CaseStudyCounts | null }) {
  const show = (n: number | undefined) => (counts ? String(n) : "—");
  const cards: { icon: LucideIcon; value: string; label: string; highlight?: boolean }[] = [
    { icon: Layers, value: show(counts?.all), label: "Total Case Studies" },
    { icon: CheckCircle2, value: show(counts?.PUBLISHED), label: "Published", highlight: true },
    { icon: PenLine, value: show(counts?.DRAFT), label: "Drafts" },
    { icon: Archive, value: show(counts?.ARCHIVED), label: "Archived" },
  ];

  return (
    <section aria-label="Case study summary" aria-busy={counts === null}>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map(({ icon: Icon, value, label, highlight }, i) => (
          <li key={label}>
            <article
              className={`admin-fade-up flex h-full items-center gap-4 rounded-xl border p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-18px_rgba(36,12,14,0.35)] sm:gap-5 sm:p-6 ${
                highlight ? "border-[#7a1f2b]/10 bg-[#f7e7e6]" : "border-black/[0.08] bg-white/80"
              }`}
              style={{ animationDelay: `${80 + i * 60}ms` }}
            >
              <Icon aria-hidden="true" size={28} strokeWidth={1.5} className="hidden shrink-0 text-[#7a1f2b] min-[400px]:block" />
              <div className="min-w-0">
                <p className={`${editorialSerif.className} text-[2rem] font-medium leading-none text-[#1a0a0c] sm:text-[2.5rem]`}>{value}</p>
                <h2 className="mt-1.5 text-sm text-ink sm:text-[0.9375rem]">{label}</h2>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
