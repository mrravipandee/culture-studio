import { CheckCircle2, ImageIcon, Layers, PenLine, type LucideIcon } from "lucide-react";
import { editorialSerif } from "@/lib/fonts";
import type { AdminCaseStudy } from "@/lib/admin/types";
import { getDraftCount, getPublishedCount, getTotalCaseStudies, getWithCoverCount } from "@/lib/admin/case-study-utils";

/**
 * KPI cards, recalculated from the current records. The reference's "Total Views" card is
 * replaced by "With Cover Image": there is no view analytics source, so no views are shown.
 */
export default function CaseStudyStats({ items }: { items: AdminCaseStudy[] }) {
  const total = getTotalCaseStudies(items);
  const cards: { icon: LucideIcon; value: string; label: string; highlight?: boolean }[] = [
    { icon: Layers, value: String(total), label: "Total Case Studies" },
    { icon: CheckCircle2, value: String(getPublishedCount(items)), label: "Published", highlight: true },
    { icon: PenLine, value: String(getDraftCount(items)), label: "Drafts" },
    { icon: ImageIcon, value: `${getWithCoverCount(items)}/${total}`, label: "With Cover Image" },
  ];

  return (
    <section aria-label="Case study summary">
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
