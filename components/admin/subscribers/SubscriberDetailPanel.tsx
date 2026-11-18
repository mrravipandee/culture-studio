"use client";

import { ArrowLeft, CalendarDays, Clock3, Link2, Mail, MailX, RotateCcw, ShieldCheck, Trash2, User, Users, X } from "lucide-react";
import { subscriberSourceLabels, type Subscriber } from "@/lib/admin/types";
import { formatSubscriberDate, subscriberEvents } from "@/lib/admin/subscriber-utils";
import { EmailText, SubscriberAvatar, SubscriberStatusBadge } from "./SubscriberBadges";
import type { SubscriberActions } from "./SubscriberTable";

const DOT: Record<string, string> = {
  subscribed: "bg-[#2f9e5b]",
  added: "bg-[#2f9e5b]",
  verified: "bg-black/25",
  unsubscribed: "bg-[#a3242f]",
  reactivated: "bg-[#2f9e5b]",
};

export default function SubscriberDetailPanel({
  subscriber: s,
  actions,
  onClose,
  variant = "panel",
  serifClassName,
}: {
  subscriber: Subscriber | null;
  actions: SubscriberActions;
  onClose: () => void;
  variant?: "panel" | "drawer";
  serifClassName: string;
}) {
  if (!s) {
    return (
      <div className="grid min-h-[18rem] place-items-center p-8 text-center">
        <div>
          <Users aria-hidden="true" size={28} strokeWidth={1.4} className="mx-auto text-ink-3" />
          <p className="mt-3 text-sm text-ink-2">Select a subscriber to see their details.</p>
        </div>
      </div>
    );
  }

  const info = [
    { icon: CalendarDays, term: "Subscribed on", value: formatSubscriberDate(s.subscribedAt, true) ?? "—" },
    { icon: Link2, term: "Source", value: subscriberSourceLabels[s.source] },
    { icon: Mail, term: "Email", value: <EmailText email={s.email} /> },
    { icon: User, term: "Name", value: s.name || "Not provided" },
    { icon: ShieldCheck, term: "Verified", value: formatSubscriberDate(s.verifiedAt, true) ?? "Not verified" },
    ...(s.unsubscribedAt ? [{ icon: MailX, term: "Unsubscribed", value: formatSubscriberDate(s.unsubscribedAt, true) ?? "—" }] : []),
  ];
  const events = subscriberEvents(s);

  return (
    <div key={s.id} className="admin-detail-in flex flex-col gap-4 p-4 sm:p-5">
      {variant === "drawer" && (
        <button type="button" onClick={onClose} className="inline-flex items-center gap-2 self-start rounded-md py-1 text-sm font-medium text-burgundy focus-visible:outline-2 focus-visible:outline-burgundy">
          <ArrowLeft aria-hidden="true" size={16} /> Back to subscribers
        </button>
      )}

      <div className="rounded-xl border border-black/[0.08] bg-white">
        <div className="flex items-start gap-4 border-b border-black/[0.06] p-4 sm:p-5">
          <SubscriberAvatar subscriber={s} size="lg" serifClassName={serifClassName} />
          <div className="min-w-0 flex-1">
            <h2 id="subscriber-detail-title" className={`truncate text-lg font-semibold ${s.name ? "text-[#1a0a0c]" : "italic text-ink-2"}`}>
              {s.name || "No name given"}
            </h2>
            <p className="text-sm text-ink-2 [overflow-wrap:anywhere]">
              <EmailText email={s.email} />
            </p>
            <SubscriberStatusBadge status={s.status} className="mt-2" />
          </div>
          {variant === "panel" && (
            <button type="button" onClick={onClose} aria-label="Close details" className="-mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-black/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-burgundy">
              <X aria-hidden="true" size={18} />
            </button>
          )}
        </div>
        <dl className="divide-y divide-black/[0.05] px-4 text-sm sm:px-5">
          {info.map(({ icon: Icon, term, value }) => (
            <div key={term} className="flex items-start gap-3 py-2.5">
              <Icon aria-hidden="true" size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-2" />
              <dt className="w-[6.5rem] shrink-0 text-ink">{term}</dt>
              <dd className="min-w-0 text-ink-2 [overflow-wrap:anywhere]">{value}</dd>
            </div>
          ))}
        </dl>
        {s.isLocal && <p className="border-t border-black/[0.06] px-4 py-2.5 text-xs text-ink-3 sm:px-5">Added manually in this preview. Consent and verification are not recorded.</p>}
      </div>

      <section aria-labelledby="subscriber-activity-title" className="rounded-xl border border-black/[0.08] bg-white p-4 sm:p-5">
        <h3 id="subscriber-activity-title" className="flex items-center gap-2 text-base font-semibold text-[#1a0a0c]">
          <Clock3 aria-hidden="true" size={17} /> Subscription Activity
        </h3>
        <ol className="mt-3 space-y-3">
          {events.map((ev) => (
            <li key={`${ev.kind}-${ev.at}`} className="flex items-start gap-3 text-sm">
              <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full ${DOT[ev.kind]}`} />
              <span className="min-w-0 flex-1">
                <span className="block text-ink">{ev.label}</span>
                <time dateTime={ev.at} className="block text-xs text-ink-3">
                  {formatSubscriberDate(ev.at, true)}
                </time>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled
          title="Email sending isn't connected yet"
          aria-describedby="send-email-note"
          className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-1.5 rounded-md border border-black/15 bg-white px-2 text-sm font-medium text-ink-3"
        >
          <Mail aria-hidden="true" size={16} /> <span className="truncate">Send Email</span>
        </button>
        {s.status === "ACTIVE" ? (
          <button type="button" onClick={() => actions.onUnsubscribe(s.id)} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-[#a3242f]/25 bg-[#a3242f]/[0.04] px-2 text-sm font-medium text-[#a3242f] hover:bg-[#a3242f]/10 focus-visible:outline-2 focus-visible:outline-[#a3242f]">
            <MailX aria-hidden="true" size={16} /> <span className="truncate">Unsubscribe</span>
          </button>
        ) : (
          <button type="button" onClick={() => actions.onReactivate(s.id)} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-[#2f6b47]/25 bg-[#2f6b47]/[0.05] px-2 text-sm font-medium text-[#245a3a] hover:bg-[#2f6b47]/10 focus-visible:outline-2 focus-visible:outline-[#2f6b47]">
            <RotateCcw aria-hidden="true" size={16} /> <span className="truncate">Reactivate</span>
          </button>
        )}
        <button type="button" onClick={() => actions.onDelete(s.id)} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-[#a3242f]/25 bg-[#a3242f]/[0.04] px-2 text-sm font-medium text-[#a3242f] hover:bg-[#a3242f]/10 focus-visible:outline-2 focus-visible:outline-[#a3242f]">
          <Trash2 aria-hidden="true" size={16} /> <span className="truncate">Delete</span>
        </button>
      </div>
      <p id="send-email-note" className="-mt-2 text-xs text-ink-3">
        Sending email isn&rsquo;t connected yet.
      </p>
    </div>
  );
}
