"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Filter bar + project grid. Cards are rendered on the server and passed in as nodes,
 * so no project data module is bundled for the client; this component only decides
 * which cards are visible.
 */

export interface ExplorerFilter {
  id: string;
  label: string;
}

export interface ExplorerItem {
  key: string;
  filters: string[];
  /** "growth" items are preceded by the Growth & Performance Marketing separator. */
  group: string;
  card: ReactNode;
}

interface Props {
  filters: ExplorerFilter[];
  items: ExplorerItem[];
  /** Separator shown before the first item of `separatorGroup`. */
  separatorGroup: string;
  separatorTitle: string;
}

const ALL = "all";
const pad = (n: number) => String(n).padStart(2, "0");

export default function CaseStudiesExplorer({ filters, items, separatorGroup, separatorTitle }: Props) {
  const [active, setActive] = useState(ALL);
  const reduce = useReducedMotion();
  const labelId = useId();

  const visible = active === ALL ? items : items.filter((item) => item.filters.includes(active));
  const countFor = (id: string) => (id === ALL ? items.length : items.filter((i) => i.filters.includes(id)).length);
  const firstSeparated = visible.findIndex((item) => item.group === separatorGroup);
  const activeLabel = active === ALL ? "All projects" : filters.find((f) => f.id === active)?.label;

  const transition = reduce ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col gap-5 pt-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <span id={labelId} className="text-sm font-medium text-black">
            Filter by
          </span>
          <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
            {[{ id: ALL, label: "All" }, ...filters].map((filter) => {
              const isActive = active === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActive(filter.id)}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[0.8125rem] sm:px-4 sm:text-sm transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${
                    isActive
                      ? "border-burgundy bg-burgundy text-white"
                      : "border-black/12 bg-white text-ink-2 hover:border-black/30 hover:text-black"
                  }`}
                >
                  {filter.label}
                  <span className={`font-mono text-xs ${isActive ? "text-white/70" : "text-ink-3"}`}>({countFor(filter.id)})</span>
                </button>
              );
            })}
          </div>
        </div>

        <p aria-live="polite" className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
          {pad(visible.length)} {visible.length === 1 ? "project" : "projects"}
          <span className="sr-only"> shown: {activeLabel}</span>
        </p>
      </div>

      {/* Grid */}
      <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-7">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.flatMap((item, index) => {
            const nodes: ReactNode[] = [];
            if (index === firstSeparated) {
              nodes.push(
                <motion.li
                  key={`separator-${separatorGroup}`}
                  layout={!reduce}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transition}
                  className="col-span-full pt-6 lg:pt-10"
                >
                  <div className="flex items-center gap-5">
                    <h3 className="shrink-0 font-mono text-xs uppercase tracking-eyebrow text-burgundy">{separatorTitle}</h3>
                    <span aria-hidden="true" className="h-px flex-1 bg-black/10" />
                  </div>
                </motion.li>,
              );
            }
            nodes.push(
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
              </motion.li>,
            );
            return nodes;
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
