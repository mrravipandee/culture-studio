"use client";

import { ChevronRight } from "lucide-react";
import type { Enquiry } from "@/lib/admin/types";
import { formatEnquiryDate } from "@/lib/admin/enquiry-utils";
import EnquiryStatusBadge from "./EnquiryStatusBadge";
import { ServicePill } from "./EnquiryTable";

interface Props {
  rows: Enquiry[];
  selectedId: string | null;
  checked: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

/** Phone layout: compact cards. Tapping a card opens the detail drawer. */
export default function EnquiryMobileList({ rows, selectedId, checked, onSelect, onToggle }: Props) {
  return (
    <ul className="divide-y divide-black/[0.06]">
      {rows.map((e) => (
        <li key={e.id} className={`admin-row-in flex items-start gap-3 py-3.5 transition-colors ${e.id === selectedId ? "bg-[#f7e7e6]/60" : ""}`}>
          <input
            type="checkbox"
            checked={checked.has(e.id)}
            onChange={() => onToggle(e.id)}
            aria-label={`Select enquiry from ${e.name}`}
            className="mt-1 size-[1.125rem] shrink-0 accent-[#5a0c14] focus-visible:outline-2 focus-visible:outline-burgundy"
          />
          <button
            type="button"
            onClick={() => onSelect(e.id)}
            className="flex min-w-0 flex-1 items-start gap-2 rounded text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className={`truncate ${e.status === "NEW" ? "font-semibold text-[#1a0a0c]" : "font-medium text-ink"}`}>{e.name}</span>
                <EnquiryStatusBadge status={e.status} />
              </span>
              {e.company && <span className="block truncate text-xs text-ink-2">{e.company}</span>}
              <span className="mt-1.5 line-clamp-2 text-sm text-ink-2">{e.message}</span>
              <span className="mt-2 flex items-center justify-between gap-2">
                <ServicePill service={e.service} />
                <time dateTime={e.createdAt} className="shrink-0 text-xs text-ink-3">
                  {formatEnquiryDate(e.createdAt)}
                </time>
              </span>
            </span>
            <ChevronRight aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-ink-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}
