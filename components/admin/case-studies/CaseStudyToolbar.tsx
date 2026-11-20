"use client";

import { useId } from "react";
import { ChevronDown, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { disciplines } from "@/lib/content/disciplines";
import { caseStudyStatusLabels, CASE_STUDY_STATUSES, type CaseStudySort } from "@/lib/case-studies/constants";
import type { CaseStudyStatusFilter } from "@/lib/case-studies/types";

export type CaseStudyView = "grid" | "list";

export interface CaseStudyFilters {
  search: string;
  status: CaseStudyStatusFilter;
  category: string;
  featured: "all" | "true" | "false";
  sort: CaseStudySort;
}

export const emptyCaseStudyFilters: CaseStudyFilters = { search: "", status: "all", category: "all", featured: "all", sort: "newest" };
export const hasCaseStudyFilters = (f: CaseStudyFilters) => f.search.trim() !== "" || f.status !== "all" || f.category !== "all" || f.featured !== "all" || f.sort !== "newest";

interface Props {
  filters: CaseStudyFilters;
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

function Select({ id, label, value, onChange, children, className = "" }: { id: string; label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {children}
      </select>
      <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2" />
    </div>
  );
}

export default function CaseStudyToolbar({ filters, view, onChange, onClear, onView }: Props) {
  const ids = { search: useId(), status: useId(), category: useId(), featured: useId(), sort: useId() };
  const active = hasCaseStudyFilters(filters);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 @[40rem]:flex-row @[40rem]:items-center">
        <div role="search" className="relative min-w-0 flex-1">
          <label htmlFor={ids.search} className="sr-only">
            Search case studies by title or slug
          </label>
          <Search aria-hidden="true" size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            id={ids.search}
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search title or slug…"
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

      <div className="grid grid-cols-2 gap-3 @[40rem]:grid-cols-4">
        <Select id={ids.status} label="Filter by status" value={filters.status} onChange={(v) => onChange({ ...filters, status: v as CaseStudyStatusFilter })}>
          <option value="all">Status: All</option>
          {CASE_STUDY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {caseStudyStatusLabels[s]}
            </option>
          ))}
          <option value="deleted">Deleted</option>
        </Select>
        <Select id={ids.category} label="Filter by category" value={filters.category} onChange={(v) => onChange({ ...filters, category: v })}>
          <option value="all">Category: All</option>
          {disciplines.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select id={ids.featured} label="Filter by featured" value={filters.featured} onChange={(v) => onChange({ ...filters, featured: v as CaseStudyFilters["featured"] })}>
          <option value="all">Featured: All</option>
          <option value="true">Featured only</option>
          <option value="false">Not featured</option>
        </Select>
        <Select id={ids.sort} label="Sort" value={filters.sort} onChange={(v) => onChange({ ...filters, sort: v as CaseStudySort })}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="updated">Recently updated</option>
          <option value="order">Site order</option>
          <option value="title">Title A–Z</option>
        </Select>
      </div>
    </div>
  );
}
