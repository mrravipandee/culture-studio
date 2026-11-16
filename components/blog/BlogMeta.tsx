import { blogAuthor, formatBlogDate } from "@/lib/content/blog";
import { editorialSerif } from "@/lib/fonts";

/** Author mark · date · reading time. */
export default function BlogMeta({ date, readingTime }: { date: string; readingTime: string }) {
  return (
    <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-ink-2">
      <span
        aria-hidden="true"
        className={`${editorialSerif.className} grid size-6 shrink-0 place-items-center rounded-full bg-[#4a121a] text-[0.8125rem] leading-none text-white`}
      >
        {blogAuthor.initial}
      </span>
      <span className="text-ink">{blogAuthor.name}</span>
      <span aria-hidden="true" className="text-ink-4">·</span>
      <time dateTime={date}>{formatBlogDate(date)}</time>
      <span aria-hidden="true" className="text-ink-4">·</span>
      <span>{readingTime}</span>
    </p>
  );
}
