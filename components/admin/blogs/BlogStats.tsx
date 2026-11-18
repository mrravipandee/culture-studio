import { CheckCircle2, FileText, PenLine, Type, type LucideIcon } from "lucide-react";
import { editorialSerif } from "@/lib/fonts";
import type { BlogPost } from "@/lib/admin/types";
import { getBlogsWithBody, getDraftBlogCount, getPublishedBlogCount, getTotalBlogs } from "@/lib/admin/blog-utils";

/**
 * KPI cards from the current records. There is no analytics source, so the reference's
 * "Total Views" is replaced by "With Body" (articles that have content written).
 */
export default function BlogStats({ items }: { items: BlogPost[] }) {
  const total = getTotalBlogs(items);
  const cards: { icon: LucideIcon; value: string; label: string; highlight?: boolean }[] = [
    { icon: FileText, value: String(total), label: "Total Blogs" },
    { icon: CheckCircle2, value: String(getPublishedBlogCount(items)), label: "Published", highlight: true },
    { icon: PenLine, value: String(getDraftBlogCount(items)), label: "Drafts" },
    { icon: Type, value: `${getBlogsWithBody(items)}/${total}`, label: "Articles Written" },
  ];
  return (
    <section aria-label="Blog summary">
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
