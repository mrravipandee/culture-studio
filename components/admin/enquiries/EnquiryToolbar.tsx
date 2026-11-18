"use client";

import { useId } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { ENQUIRY_STATUSES, enquiryStatusLabels, serviceLabels, type EnquiryStatus, type ServiceId } from "@/lib/admin/types";
import { hasActiveFilters, type EnquiryFilters } from "@/lib/admin/enquiry-utils";

interface Props {
  filters: EnquiryFilters;
  onChange: (next: EnquiryFilters) => void;
  onClear: () => void;
}

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-8 text-[0.8125rem] text-ink sm:pl-3.5 sm:pr-9 sm:text-sm transition-colors hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy";

/** Search + service + status filters. All three combine; changing any resets to page 1 (in the parent). */
export default function EnquiryToolbar({ filters, onChange, onClear }: Props) {
  const searchId = useId();
  const serviceId = useId();
  const statusId = useId();
  const active = hasActiveFilters(filters);

  return (
    <div role="search" className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative min-w-0 flex-1">
        <label htmlFor={searchId} className="sr-only">
          Search enquiries
        </label>
        <Search aria-hidden="true" size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          id={searchId}
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by name, email or company…"
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

      <div className="grid grid-cols-[1fr_1fr_auto] gap-3 md:flex md:shrink-0">
        <div className="relative md:w-44">
          <label htmlFor={serviceId} className="sr-only">
            Filter by service
          </label>
          <select
            id={serviceId}
            value={filters.service}
            onChange={(e) => onChange({ ...filters, service: e.target.value as ServiceId | "all" })}
            className={selectClass}
          >
            <option value="all">All Services</option>
            {(Object.keys(serviceLabels) as ServiceId[]).map((id) => (
              <option key={id} value={id}>
                {serviceLabels[id]}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2 sm:right-3" />
        </div>

        <div className="relative md:w-36">
          <label htmlFor={statusId} className="sr-only">
            Filter by status
          </label>
          <select
            id={statusId}
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as EnquiryStatus | "all" })}
            className={selectClass}
          >
            <option value="all">All Status</option>
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {enquiryStatusLabels[s]}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2 sm:right-3" />
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={!active}
          aria-label="Clear all filters"
          title="Clear all filters"
          className="relative grid size-11 place-items-center rounded-lg border border-black/15 bg-white text-ink transition-colors hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SlidersHorizontal aria-hidden="true" size={18} strokeWidth={1.6} />
          {active && <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#7a1f2b]" />}
        </button>
      </div>
    </div>
  );
}
