import { CheckCircle2, Mail, Reply, Sparkles, type LucideIcon } from "lucide-react";
import { editorialSerif } from "@/lib/fonts";
import type { EnquiryStatus } from "@/lib/admin/types";

/** Four summary cards from the server's counts (all non-deleted enquiries, not just the current filter). */
export default function EnquiryStats({ total, counts }: { total: number; counts: Record<EnquiryStatus, number> }) {
  const cards: { icon: LucideIcon; value: number; label: string; highlight?: boolean }[] = [
    { icon: Mail, value: total, label: "Total Enquiries" },
    { icon: Sparkles, value: counts.NEW, label: "New Enquiries", highlight: true },
    { icon: Reply, value: counts.REPLIED, label: "Replied" },
    { icon: CheckCircle2, value: counts.CLOSED, label: "Closed" },
  ];

  return (
    <section aria-label="Enquiry summary">
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
                <p className={`${editorialSerif.className} text-[2rem] font-medium leading-none text-[#1a0a0c] sm:text-[2.5rem]`}>
                  {new Intl.NumberFormat("en-IN").format(value)}
                </p>
                <h2 className="mt-1.5 text-sm text-ink sm:text-[0.9375rem]">{label}</h2>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
