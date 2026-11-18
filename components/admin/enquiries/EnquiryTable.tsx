"use client";

import { useEffect, useRef } from "react";
import { MoreHorizontal } from "lucide-react";
import type { Enquiry } from "@/lib/admin/types";
import { formatEnquiryDate, serviceLabel } from "@/lib/admin/enquiry-utils";
import EnquiryStatusBadge from "./EnquiryStatusBadge";

interface Props {
  rows: Enquiry[];
  selectedId: string | null;
  checked: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], select: boolean) => void;
}

export function ServicePill({ service }: { service: Enquiry["service"] }) {
  return (
    <span className="inline-block max-w-full truncate whitespace-nowrap rounded-full bg-[#f7e4e4] px-2.5 py-1 align-middle text-xs font-medium text-[#7a1f2b]">
      {serviceLabel(service)}
    </span>
  );
}

const checkboxClass = "size-[1.125rem] cursor-pointer rounded border-black/30 accent-[#5a0c14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy";

/** Desktop/tablet table (semantic). The Message column appears when the table has room. */
export default function EnquiryTable({ rows, selectedId, checked, onSelect, onToggle, onToggleAll }: Props) {
  const ids = rows.map((r) => r.id);
  const checkedHere = ids.filter((id) => checked.has(id)).length;
  const all = rows.length > 0 && checkedHere === rows.length;
  const some = checkedHere > 0 && !all;
  const headerBox = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (headerBox.current) headerBox.current.indeterminate = some;
  }, [some]);

  return (
    <div className="@container">
      <table className="w-full table-fixed text-left text-sm">
        <caption className="sr-only">Enquiries (demo data), newest first. Select a row to see full details.</caption>
        <thead>
          <tr className="text-[0.8125rem] text-ink">
            <th scope="col" className="w-10 py-3 pl-2">
              <input
                ref={headerBox}
                type="checkbox"
                checked={all}
                onChange={() => onToggleAll(ids, !all)}
                aria-label={all ? "Deselect all enquiries on this page" : "Select all enquiries on this page"}
                className={checkboxClass}
              />
            </th>
            <th scope="col" className="py-3 pr-3 font-medium">Name</th>
            <th scope="col" className="hidden w-[8.5rem] py-3 pr-3 font-medium @[30rem]:table-cell">Service</th>
            <th scope="col" className="hidden py-3 pr-4 font-medium @[42rem]:table-cell">Message</th>
            <th scope="col" className="w-[6.75rem] py-3 pr-2 font-medium">Date</th>
            <th scope="col" className="w-[5.5rem] py-3 font-medium">Status</th>
            <th scope="col" className="w-11 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => {
            const selected = e.id === selectedId;
            return (
              <tr
                key={e.id}
                onClick={() => onSelect(e.id)}
                className={`admin-row-in cursor-pointer border-t border-black/[0.06] transition-colors duration-200 ${
                  selected ? "bg-[#f7e7e6]" : "hover:bg-black/[0.02]"
                }`}
              >
                <td className="py-4 pl-2 align-middle" onClick={(ev) => ev.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={checked.has(e.id)}
                    onChange={() => onToggle(e.id)}
                    aria-label={`Select enquiry from ${e.name}`}
                    className={checkboxClass}
                  />
                </td>
                <td className="py-4 pr-3">
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onSelect(e.id);
                    }}
                    aria-current={selected ? "true" : undefined}
                    className="block w-full min-w-0 rounded text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
                  >
                    <span className={`block truncate ${e.status === "NEW" ? "font-semibold text-[#1a0a0c]" : "font-medium text-ink"}`}>{e.name}</span>
                    {e.company && <span className="block truncate text-[0.8125rem] text-ink-2">{e.company}</span>}
                  </button>
                </td>
                <td className="hidden py-4 pr-3 @[30rem]:table-cell">
                  <ServicePill service={e.service} />
                </td>
                <td className="hidden py-4 pr-4 text-[0.8125rem] leading-snug text-ink @[42rem]:table-cell">
                  <span className="line-clamp-2" title={e.message}>
                    {e.message}
                  </span>
                </td>
                <td className="whitespace-nowrap py-4 pr-2 text-[0.8125rem] text-ink">
                  <time dateTime={e.createdAt}>{formatEnquiryDate(e.createdAt)}</time>
                </td>
                <td className="py-4">
                  <EnquiryStatusBadge status={e.status} />
                </td>
                <td className="py-4 pr-2 text-right">
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onSelect(e.id);
                    }}
                    aria-label={`View details for ${e.name}`}
                    className="grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-burgundy"
                  >
                    <MoreHorizontal aria-hidden="true" size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
