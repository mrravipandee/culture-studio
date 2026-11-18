"use client";

import { useId } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { ENQUIRY_STATUSES, enquiryStatusLabels, serviceLabels, type EnquiryStatus, type ServiceId } from "@/lib/admin/types";
import { hasActiveFilters, type EnquiryFilters } from "@/lib/admin/enquiry-utils";
import { ENQUIRY_RANGES, enquiryRangeLabels } from "@/lib/validation/enquiry";

interface Props {
  filters: EnquiryFilters;
  onChange: (next: EnquiryFilters) => void;
  onClear: () => void;
}

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-8 text-[0.8125rem] text-ink sm:pl-3.5 sm:pr-9 sm:text-sm transition-colors hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy";

function Select<T extends string>({ id, label, value, options, onChange, className = "" }: { id: string; label: string; value: T; options: [T, string][]; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={`relative min-w-0 ${className}`}>
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
      <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2 sm:right-3" />
    </div>
  );
}

/**
 * Search (name/email) + service + status + date filters. All combine on the server;
 * changing any resets to page 1 (in the parent). Inline when the card is wide, stacked otherwise.
 */
export default function EnquiryToolbar({ filters, onChange, onClear }: Props) {
  const searchId = useId();
  const serviceId = useId();
  const statusId = useId();
  const rangeId = useId();
  const active = hasActiveFilters(filters);

  return (
    <div className="@container">
      <div role="search" className="flex flex-col gap-3 @[54rem]:flex-row @[54rem]:items-center">
        <div className="relative min-w-0 flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search enquiries by name or email
          </label>
          <Search aria-hidden="true" size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            id={searchId}
            type="search"
            value={filters.search}
            maxLength={100}
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

        <div className="grid grid-cols-[1fr_1fr_auto] gap-3 @[34rem]:grid-cols-[1fr_1fr_1fr_auto] @[54rem]:flex @[54rem]:shrink-0">
          <Select<ServiceId | "all">
            id={serviceId}
            label="Filter by service"
            value={filters.service}
            onChange={(service) => onChange({ ...filters, service })}
            options={[["all", "All Services"], ...(Object.keys(serviceLabels) as ServiceId[]).map((id) => [id, serviceLabels[id]] as [ServiceId, string])]}
            className="@[54rem]:w-44"
          />
          <Select<EnquiryStatus | "all">
            id={statusId}
            label="Filter by status"
            value={filters.status}
            onChange={(status) => onChange({ ...filters, status })}
            options={[["all", "All Status"], ...ENQUIRY_STATUSES.map((s) => [s, enquiryStatusLabels[s]] as [EnquiryStatus, string])]}
            className="@[54rem]:w-36"
          />
          <Select<EnquiryFilters["range"]>
            id={rangeId}
            label="Filter by date received"
            value={filters.range}
            onChange={(range) => onChange({ ...filters, range })}
            options={ENQUIRY_RANGES.map((r) => [r, enquiryRangeLabels[r]] as [EnquiryFilters["range"], string])}
            className="order-last col-span-2 @[34rem]:order-none @[34rem]:col-span-1 @[54rem]:w-36"
          />
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
    </div>
  );
}
