"use client";

import { ArrowLeft, CalendarDays, CheckCircle2, Eye, Globe, History, LoaderCircle, Mail, MessageSquareText, MousePointerClick, Reply, RotateCcw, Trash2, User, X } from "lucide-react";
import { enquirySourceLabels, enquiryStatusLabels, type Enquiry, type EnquiryDetail, type EnquiryStatus } from "@/lib/admin/types";
import { formatEnquiryDateTime, initials, nextStatuses } from "@/lib/admin/enquiry-utils";
import EnquiryStatusBadge from "./EnquiryStatusBadge";
import { ServicePill } from "./EnquiryTable";

interface Props {
  /** The list row (shown immediately). */
  enquiry: Enquiry | null;
  /** Full record (complete message + history), once loaded. */
  detail: EnquiryDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** A status change or delete is in flight for this enquiry. */
  busy: boolean;
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

/** Selected enquiry. Shows only what the record actually has (the form has no phone field). */
export default function EnquiryDetailPanel({ enquiry, detail, loading, error, onRetry, busy, onStatus, onDelete, onClose, variant = "panel", serifClassName }: Props) {
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

  const record: Enquiry = detail && detail.id === enquiry.id ? detail : enquiry;
  const full = detail && detail.id === enquiry.id ? detail : null;
  const actions = nextStatuses[record.status].filter((s): s is Exclude<EnquiryStatus, "NEW"> => s !== "NEW");
  const website = record.website?.replace(/^https?:\/\//, "");

  return (
    <div key={record.id} className="admin-detail-in flex h-full flex-col p-5 sm:p-6" aria-busy={loading || busy}>
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
          {initials(record.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="enquiry-detail-title" className="truncate text-lg font-semibold text-[#1a0a0c]">
            {record.name}
          </h2>
          {record.company && <p className="truncate text-sm text-ink-2">{record.company}</p>}
          <EnquiryStatusBadge status={record.status} className="mt-2" />
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
          <a href={`mailto:${record.email}`} className="break-all text-ink hover:text-burgundy hover:underline">
            {record.email}
          </a>
        </li>
        {record.website && (
          <li className={row}>
            <Globe aria-hidden="true" size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-2" />
            <a href={record.website} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-ink hover:text-burgundy hover:underline">
              {website}
            </a>
          </li>
        )}
      </ul>

      {/* Enquiry */}
      <div className="space-y-5 border-b border-black/[0.08] py-5">
        <div className={row}>
          <User aria-hidden="true" size={18} strokeWidth={1.6} className="mt-1 shrink-0 text-ink-2" />
          <span className="mt-0.5 w-20 shrink-0 font-medium text-ink">{record.services.length > 1 ? "Services" : "Service"}</span>
          <ServicePill services={record.services} compact={false} />
        </div>
        <div>
          <p className={`${row} font-medium text-ink`}>
            <MessageSquareText aria-hidden="true" size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-2" />
            Message
          </p>
          <p className="mt-3 whitespace-pre-line break-words rounded-lg border border-black/[0.08] bg-black/[0.015] p-4 text-sm leading-relaxed text-ink sm:ml-[2.125rem]">
            {record.message}
          </p>
          {loading && !full && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-3 sm:ml-[2.125rem]" role="status">
              <LoaderCircle aria-hidden="true" size={13} className="animate-spin motion-reduce:animate-none" /> Loading the full enquiry…
            </p>
          )}
          {error && (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#a3242f] sm:ml-[2.125rem]" role="alert">
              {error}
              <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 font-medium underline underline-offset-2">
                <RotateCcw aria-hidden="true" size={12} /> Retry
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3.5 py-5">
        <p className={`${row} items-center`}>
          <CalendarDays aria-hidden="true" size={18} strokeWidth={1.6} className="shrink-0 text-ink-2" />
          <span className="w-20 shrink-0 font-medium text-ink">Received</span>
          <time dateTime={record.createdAt} className="text-ink">
            {formatEnquiryDateTime(record.createdAt)}
          </time>
        </p>
        <p className={`${row} items-center`}>
          <MousePointerClick aria-hidden="true" size={18} strokeWidth={1.6} className="shrink-0 text-ink-2" />
          <span className="w-20 shrink-0 font-medium text-ink">Source</span>
          <span className="text-ink">{enquirySourceLabels[record.source]}</span>
        </p>
        {full && full.statusHistory.length > 0 && (
          <div className={row}>
            <History aria-hidden="true" size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-2" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">Status history</p>
              <ol className="mt-2 space-y-1.5">
                {[...full.statusHistory].reverse().map((h, i) => (
                  <li key={`${h.at}-${i}`} className="flex flex-wrap items-baseline justify-between gap-x-3 text-[0.8125rem]">
                    <span className="text-ink">{h.from ? `${enquiryStatusLabels[h.from]} → ${enquiryStatusLabels[h.to]}` : `Received (${enquiryStatusLabels[h.to]})`}</span>
                    <time dateTime={h.at} className="text-xs text-ink-3">
                      {formatEnquiryDateTime(h.at)}
                    </time>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Actions: only valid transitions for the current status */}
      <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-2">
        {actions.map((status, i) => {
          const { label, icon: Icon } = ACTIONS[status];
          return (
            <button
              key={status}
              type="button"
              disabled={busy}
              onClick={() => onStatus(record.id, status)}
              className={`inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:cursor-not-allowed disabled:opacity-60 ${
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
          disabled={busy}
          onClick={() => onDelete(record.id)}
          aria-label={`Delete enquiry from ${record.name}`}
          title="Delete enquiry"
          className="ml-auto grid size-11 place-items-center rounded-md border border-black/15 text-[#a3242f] transition-colors hover:border-[#a3242f]/40 hover:bg-[#a3242f]/5 focus-visible:outline-2 focus-visible:outline-burgundy disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <LoaderCircle aria-hidden="true" size={17} className="animate-spin motion-reduce:animate-none" /> : <Trash2 aria-hidden="true" size={17} strokeWidth={1.75} />}
        </button>
      </div>
      {actions.length === 0 && <p className="mt-3 text-xs text-ink-3">This enquiry is closed.</p>}
    </div>
  );
}
