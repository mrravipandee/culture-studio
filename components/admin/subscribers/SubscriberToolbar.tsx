"use client";

import { useId } from "react";
import { ChevronDown, Download, Search, UserPlus, X } from "lucide-react";
import { SUBSCRIBER_SOURCES, subscriberSourceLabels, subscriberStatusLabels, type SubscriberSource, type SubscriberStatus } from "@/lib/admin/types";
import { dateRangeLabels, hasSubscriberFilters, type DateRange, type SubscriberFilters } from "@/lib/admin/subscriber-utils";

interface Props {
  filters: SubscriberFilters;
  onChange: (next: SubscriberFilters) => void;
  onClear: () => void;
  onExport: () => void;
  onAdd: () => void;
}

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-8 text-[0.8125rem] text-ink transition-colors hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy sm:text-sm";

function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div className="relative min-w-0">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={selectClass}>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2" />
    </div>
  );
}

/** Search, status / source / date filters, clear, export and add. Layout follows the card width (container queries). */
export default function SubscriberToolbar({ filters, onChange, onClear, onExport, onAdd }: Props) {
  const searchId = useId();
  const active = hasSubscriberFilters(filters);

  return (
    <div className="@container">
      <div className="flex flex-col gap-3 @[36rem]:flex-row @[36rem]:items-center">
        <div role="search" className="relative min-w-0 flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search subscribers by name or email
          </label>
          <Search aria-hidden="true" size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            id={searchId}
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by name or email…"
            autoComplete="off"
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
        <div className="grid grid-cols-2 gap-2.5 @[36rem]:flex @[36rem]:shrink-0">
          <button type="button" onClick={onExport} className="inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-black/15 bg-white px-3 text-[0.8125rem] font-medium text-ink transition-colors hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy min-[400px]:px-4 min-[400px]:text-sm">
            <Download aria-hidden="true" size={16} className="shrink-0" /> Export CSV
          </button>
          <button type="button" onClick={onAdd} className="inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#5a0c14] px-3 text-[0.8125rem] font-medium text-white transition-colors hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy min-[400px]:px-4 min-[400px]:text-sm">
            <UserPlus aria-hidden="true" size={16} className="shrink-0" /> Add Subscriber
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 @[34rem]:grid-cols-[1fr_1fr_1fr_auto]">
        <Select<SubscriberStatus | "all">
          label="Filter by status"
          value={filters.status}
          onChange={(status) => onChange({ ...filters, status })}
          options={[["all", "All Status"], ...(Object.keys(subscriberStatusLabels) as SubscriberStatus[]).map((s) => [s, subscriberStatusLabels[s]] as [SubscriberStatus, string])]}
        />
        <Select<SubscriberSource | "all">
          label="Filter by source"
          value={filters.source}
          onChange={(source) => onChange({ ...filters, source })}
          options={[["all", "All Sources"], ...SUBSCRIBER_SOURCES.map((s) => [s, subscriberSourceLabels[s]] as [SubscriberSource, string])]}
        />
        <Select<DateRange> label="Filter by subscribe date" value={filters.range} onChange={(range) => onChange({ ...filters, range })} options={Object.entries(dateRangeLabels) as [DateRange, string][]} />
        <button
          type="button"
          onClick={onClear}
          disabled={!active}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-burgundy transition-colors hover:bg-[#7a1f2b]/[0.06] focus-visible:outline-2 focus-visible:outline-burgundy disabled:cursor-not-allowed disabled:text-ink-3 disabled:hover:bg-transparent"
        >
          <X aria-hidden="true" size={15} /> Clear filters
        </button>
      </div>
    </div>
  );
}
