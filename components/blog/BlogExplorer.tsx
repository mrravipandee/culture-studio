"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * "Explore by Topic" filters + article grid + pagination. UI only: cards are rendered on
 * the server and passed in; counts and the page total are illustrative mock values
 * (lib/content/blog.ts). Pages after 1 have no sample articles yet.
 */

interface Topic {
  id: string;
  label: string;
  count: number;
}

interface Item {
  key: string;
  topic: string;
  card: ReactNode;
}

interface Props {
  topics: Topic[];
  totalPosts: number;
  totalPages: number;
  items: Item[];
  headingClassName: string;
}

const ALL = "all";

/** 1 2 3 … 8, with the current page kept visible. */
function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "gap", total];
  if (current >= total - 2) return [1, "gap", total - 2, total - 1, total];
  return [1, "gap", current, "gap", total];
}

export default function BlogExplorer({ topics, totalPosts, totalPages, items, headingClassName }: Props) {
  const [topic, setTopic] = useState(ALL);
  const [page, setPage] = useState(1);
  const reduce = useReducedMotion();
  const headingId = useId();

  const filtered = topic === ALL ? items : items.filter((item) => item.topic === topic);
  const visible = page === 1 ? filtered : [];
  const transition = reduce ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };
  const chips = [{ id: ALL, label: "All Posts", count: totalPosts }, ...topics];

  const choose = (id: string) => {
    setTopic(id);
    setPage(1);
  };

  return (
    <section aria-labelledby={headingId}>
      {/* Topic bar */}
      <div className="flex flex-col gap-5 border-y border-black/10 py-5 lg:flex-row lg:items-center lg:justify-between lg:py-4">
        <h2 id={headingId} className={`${headingClassName} text-[1.625rem] font-normal tracking-[-0.01em] text-[#240c0e]`}>
          Explore by Topic
        </h2>
        <div role="group" aria-label="Filter articles by topic" className="flex flex-wrap gap-2 lg:justify-end lg:gap-3">
          {chips.map((chip) => {
            const active = topic === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                aria-pressed={active}
                onClick={() => choose(chip.id)}
                className={`inline-flex min-h-9 items-center rounded-full border px-4 text-[0.8125rem] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy sm:px-5 ${
                  active ? "border-[#4a121a] bg-[#4a121a] text-white" : "border-black/15 bg-white/60 text-ink hover:border-black/35"
                }`}
              >
                {chip.label} ({chip.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <p aria-live="polite" className="sr-only">
        {visible.length} {visible.length === 1 ? "article" : "articles"} shown
      </p>
      <ul className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((item) => (
            <motion.li
              key={item.key}
              layout={!reduce}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={transition}
              className="h-full"
            >
              {item.card}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {visible.length === 0 && (
        <p className="rounded-xl border border-dashed border-black/15 px-6 py-14 text-center text-sm text-ink-2">
          More articles are on the way.
        </p>
      )}

      {/* Pagination (local UI state only) */}
      <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1 sm:gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:text-burgundy disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-burgundy"
        >
          <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
        {pageList(page, totalPages).map((entry, i) =>
          entry === "gap" ? (
            <span key={`gap-${i}`} aria-hidden="true" className="w-8 text-center text-sm text-ink-3">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              aria-label={`Page ${entry}`}
              aria-current={page === entry ? "page" : undefined}
              onClick={() => setPage(entry)}
              className={`grid size-10 place-items-center rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${
                page === entry ? "bg-[#4a121a] text-white" : "text-ink hover:text-burgundy"
              }`}
            >
              {entry}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:text-burgundy disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-burgundy"
        >
          <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </nav>
    </section>
  );
}
