"use client";

import { ArrowLeft, CalendarDays, CheckCircle2, Eye, Globe, Mail, MessageSquareText, Phone, Reply, Trash2, User, X } from "lucide-react";
import type { Enquiry, EnquiryStatus } from "@/lib/admin/types";
import { formatEnquiryDateTime, initials, nextStatuses } from "@/lib/admin/enquiry-utils";
import EnquiryStatusBadge from "./EnquiryStatusBadge";
import { ServicePill } from "./EnquiryTable";

interface Props {
  enquiry: Enquiry | null;
  onStatus: (id: string, status: EnquiryStatus) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  /** Drawer variant shows a "Back to enquiries" control instead of the corner close. */
  variant?: "panel" | "drawer";
  serifClassName: string;
}

const ACTIONS: Record<Exclude<EnquiryStatus, "NEW">, { label: string; icon: typeof Reply }> = {
  READ: { label: "Mark as Read", icon: Eye },
  REPLIED: { label: "Mark as Replied", icon: Reply },
  CLOSED: { label: "Mark as Closed", icon: CheckCircle2 },
};

const row = "flex items-start gap-4 text-sm";

/** Selected enquiry. Shows only the contact details the record actually has. */
export default function EnquiryDetailPanel({ enquiry, onStatus, onDelete, onClose, variant = "panel", serifClassName }: Props) {
  if (!enquiry) {
    return (
      <div className="grid h-full min-h-[18rem] place-items-center p-8 text-center">
        <div>
          <MessageSquareText aria-hidden="true" size={28} strokeWidth={1.4} className="mx-auto text-ink-3" />
          <p className="mt-3 text-sm text-ink-2">Select an enquiry to see its details.</p>
        </div>
      </div>
    );
  }

  const actions = nextStatuses[enquiry.status].filter((s): s is Exclude<EnquiryStatus, "NEW"> => s !== "NEW");
  const website = enquiry.website?.replace(/^https?:\/\//, "");

  return (
    <div key={enquiry.id} className="admin-detail-in flex h-full flex-col p-5 sm:p-6">
      {variant === "drawer" && (
        <button
          type="button"
          onClick={onClose}
          className="mb-4 inline-flex items-center gap-2 self-start rounded-md py-1 text-sm font-medium text-burgundy focus-visible:outline-2 focus-visible:outline-burgundy"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to enquiries
        </button>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 border-b border-black/[0.08] pb-5">
        <span aria-hidden="true" className={`${serifClassName} grid size-14 shrink-0 place-items-center rounded-full bg-[#f7e4e4] text-xl text-[#7a1f2b]`}>
          {initials(enquiry.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="enquiry-detail-title" className="truncate text-lg font-semibold text-[#1a0a0c]">
            {enquiry.name}
          </h2>
          {enquiry.company && <p className="truncate text-sm text-ink-2">{enquiry.company}</p>}
          <EnquiryStatusBadge status={enquiry.status} className="mt-2" />
        </div>
        {variant === "panel" && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="-mr-2 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-black/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-burgundy"
          >
            <X aria-hidden="true" size={18} />
          </button>
        )}
      </div>

      {/* Contact */}
      <ul aria-label="Contact details" className="space-y-3.5 border-b border-black/[0.08] py-5">
        <li className={row}>
          <Mail aria-hidden="true" size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-2" />
          <a href={`mailto:${enquiry.email}`} className="break-all text-ink hover:text-burgundy hover:underline">
            {enquiry.email}
          </a>
        </li>
        {enquiry.phone && (
          <li className={row}>
            <Phone aria-hidden="true" size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-2" />
            <a href={`tel:${enquiry.phone.replace(/\s/g, "")}`} className="text-ink hover:text-burgundy hover:underline">
              {enquiry.phone}
            </a>
          </li>
        )}
        {enquiry.website && (
          <li className={row}>
            <Globe aria-hidden="true" size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-2" />
            <a href={enquiry.website} target="_blank" rel="noopener noreferrer" className="break-all text-ink hover:text-burgundy hover:underline">
              {website}
            </a>
          </li>
        )}
      </ul>

      {/* Enquiry */}
      <div className="space-y-5 border-b border-black/[0.08] py-5">
        <div className={`${row} items-center`}>
          <User aria-hidden="true" size={18} strokeWidth={1.6} className="shrink-0 text-ink-2" />
          <span className="w-20 shrink-0 font-medium text-ink">Service</span>
          <ServicePill service={enquiry.service} />
        </div>
        <div>
          <p className={`${row} font-medium text-ink`}>
            <MessageSquareText aria-hidden="true" size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-2" />
            Message
          </p>
          <p className="mt-3 whitespace-pre-line rounded-lg border border-black/[0.08] bg-black/[0.015] p-4 text-sm leading-relaxed text-ink sm:ml-[2.125rem]">
            {enquiry.message}
          </p>
        </div>
      </div>

      <p className={`${row} items-center py-5`}>
        <CalendarDays aria-hidden="true" size={18} strokeWidth={1.6} className="shrink-0 text-ink-2" />
        <span className="w-20 shrink-0 font-medium text-ink">Received</span>
        <time dateTime={enquiry.createdAt} className="text-ink">
          {formatEnquiryDateTime(enquiry.createdAt)}
        </time>
      </p>

      {/* Actions: only valid transitions for the current status */}
      <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-2">
        {actions.map((status, i) => {
          const { label, icon: Icon } = ACTIONS[status];
          return (
            <button
              key={status}
              type="button"
              onClick={() => onStatus(enquiry.id, status)}
              className={`inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${
                i === 0 ? "bg-[#5a0c14] text-white hover:bg-[#6b111b]" : "border border-black/20 bg-white text-ink hover:border-black/40"
              }`}
            >
              <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
              {label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onDelete(enquiry.id)}
          aria-label={`Delete enquiry from ${enquiry.name}`}
          title="Delete enquiry"
          className="ml-auto grid size-11 place-items-center rounded-md border border-black/15 text-[#a3242f] transition-colors hover:border-[#a3242f]/40 hover:bg-[#a3242f]/5 focus-visible:outline-2 focus-visible:outline-burgundy"
        >
          <Trash2 aria-hidden="true" size={17} strokeWidth={1.75} />
        </button>
      </div>
      {actions.length === 0 && <p className="mt-3 text-xs text-ink-3">This enquiry is closed.</p>}
    </div>
  );
}
