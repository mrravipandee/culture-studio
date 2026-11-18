"use client";

import { useId } from "react";
import { ChevronDown, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { caseStudyStatusLabels, type CaseStudyStatus } from "@/lib/admin/types";
import { hasCaseStudyFilters, type CaseStudyFilters } from "@/lib/admin/case-study-utils";

export type CaseStudyView = "grid" | "list";

interface Props {
  filters: CaseStudyFilters;
  categories: string[];
  view: CaseStudyView;
  onChange: (next: CaseStudyFilters) => void;
  onClear: () => void;
  onView: (view: CaseStudyView) => void;
}

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-8 text-[0.8125rem] text-ink transition-colors hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy sm:pl-3.5 sm:pr-9 sm:text-sm";
const iconButton = (active: boolean) =>
  `grid size-11 place-items-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${
    active ? "border-[#5a0c14] bg-[#5a0c14] text-white" : "border-black/15 bg-white text-ink hover:border-black/30"
  }`;

export default function CaseStudyToolbar({ filters, categories, view, onChange, onClear, onView }: Props) {
  const searchId = useId();
  const statusId = useId();
  const categoryId = useId();
  const active = hasCaseStudyFilters(filters);

  return (
    <div className="flex flex-col gap-3 @[40rem]:flex-row @[40rem]:items-center">
      <div role="search" className="relative min-w-0 flex-1 @[40rem]:min-w-[9rem]">
        <label htmlFor={searchId} className="sr-only">
          Search case studies
        </label>
        <Search aria-hidden="true" size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          id={searchId}
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search case studies…"
          autoComplete="off"
          maxLength={120}
          className="h-11 w-full rounded-lg border border-black/15 bg-white pl-10 pr-10 text-sm text-ink placeholder:text-ink-3 transition-colors hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy [&::-webkit-search-cancel-button]:hidden"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, search: "" })}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-ink-3 hover:bg-black/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-burgundy"
          >
            <X aria-hidden="true" size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 @[40rem]:flex @[40rem]:shrink-0">
        <div className="relative @[40rem]:w-[8.5rem]">
          <label htmlFor={statusId} className="sr-only">
            Filter by status
          </label>
          <select id={statusId} value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value as CaseStudyStatus | "all" })} className={selectClass}>
            <option value="all">Status: All</option>
            {(Object.keys(caseStudyStatusLabels) as CaseStudyStatus[]).map((s) => (
              <option key={s} value={s}>
                {caseStudyStatusLabels[s]}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2" />
        </div>
        <div className="relative @[40rem]:w-40">
          <label htmlFor={categoryId} className="sr-only">
            Filter by category
          </label>
          <select id={categoryId} value={filters.category} onChange={(e) => onChange({ ...filters, category: e.target.value })} className={selectClass}>
            <option value="all">Category: All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={onClear} disabled={!active} aria-label="Clear search and filters" title="Clear search and filters" className={`${iconButton(false)} relative disabled:cursor-not-allowed disabled:opacity-40`}>
          <SlidersHorizontal aria-hidden="true" size={18} strokeWidth={1.6} />
          {active && <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#7a1f2b]" />}
        </button>
        <div role="group" aria-label="View" className="ml-auto flex gap-2 @[40rem]:ml-0">
          <button type="button" onClick={() => onView("grid")} aria-pressed={view === "grid"} aria-label="Grid view" className={iconButton(view === "grid")}>
            <LayoutGrid aria-hidden="true" size={18} strokeWidth={1.6} />
          </button>
          <button type="button" onClick={() => onView("list")} aria-pressed={view === "list"} aria-label="List view" className={iconButton(view === "list")}>
            <List aria-hidden="true" size={18} strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </div>
  );
}
