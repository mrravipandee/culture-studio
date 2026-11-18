"use client";

import { useEffect, useRef } from "react";
import { ChevronRight, MailX, RotateCcw, Trash2 } from "lucide-react";
import type { Subscriber } from "@/lib/admin/types";
import { formatSubscriberDate } from "@/lib/admin/subscriber-utils";
import ActionMenu, { type ActionMenuItem } from "../ActionMenu";
import { SourceBadge, SubscriberAvatar, SubscriberStatusBadge } from "./SubscriberBadges";

export interface SubscriberActions {
  onSelect: (id: string) => void;
  onUnsubscribe: (id: string) => void;
  onReactivate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function subscriberMenu(s: Subscriber, a: SubscriberActions): ActionMenuItem[] {
  return [
    s.status === "ACTIVE"
      ? { label: "Unsubscribe", icon: <MailX aria-hidden="true" size={15} />, onSelect: () => a.onUnsubscribe(s.id) }
      : { label: "Reactivate", icon: <RotateCcw aria-hidden="true" size={15} />, onSelect: () => a.onReactivate(s.id) },
    { label: "Delete", icon: <Trash2 aria-hidden="true" size={15} />, onSelect: () => a.onDelete(s.id), danger: true },
  ];
}

const checkbox = "size-[1.125rem] cursor-pointer accent-[#5a0c14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy";
const displayName = (s: Subscriber) => s.name || "No name given";

interface Props {
  rows: Subscriber[];
  selectedId: string | null;
  checked: Set<string>;
  actions: SubscriberActions;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], on: boolean) => void;
  serifClassName: string;
}

export function SubscriberTable({ rows, selectedId, checked, actions, onToggle, onToggleAll, serifClassName }: Props) {
  const ids = rows.map((r) => r.id);
  const count = ids.filter((id) => checked.has(id)).length;
  const all = rows.length > 0 && count === rows.length;
  const head = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (head.current) head.current.indeterminate = count > 0 && !all;
  }, [count, all]);

  return (
    <div className="@container">
      <table className="w-full table-fixed text-left text-sm">
        <caption className="sr-only">Newsletter subscribers (demo data), newest first. Select a row to see details.</caption>
        <thead>
          <tr className="text-[0.8125rem] text-ink">
            <th scope="col" className="w-10 py-3 pl-2">
              <input ref={head} type="checkbox" checked={all} onChange={() => onToggleAll(ids, !all)} aria-label={all ? "Deselect all subscribers on this page" : "Select all subscribers on this page"} className={checkbox} />
            </th>
            <th scope="col" className="py-3 pr-3 font-medium">Subscriber</th>
            <th scope="col" className="hidden w-[7.5rem] py-3 pr-3 font-medium @[36rem]:table-cell">Source</th>
            <th scope="col" className="hidden w-[7.5rem] py-3 pr-3 font-medium @[30rem]:table-cell">Subscribed On</th>
            <th scope="col" className="w-[7.5rem] py-3 font-medium">Status</th>
            <th scope="col" className="w-11 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const selected = s.id === selectedId;
            return (
              <tr key={s.id} onClick={() => actions.onSelect(s.id)} className={`admin-row-in cursor-pointer border-t border-black/[0.06] transition-colors duration-200 ${selected ? "bg-[#f7e7e6]" : "hover:bg-black/[0.02]"}`}>
                <td className="py-3 pl-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={checked.has(s.id)} onChange={() => onToggle(s.id)} aria-label={`Select ${s.email}`} className={checkbox} />
                </td>
                <td className="py-3 pr-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <SubscriberAvatar subscriber={s} serifClassName={serifClassName} />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        actions.onSelect(s.id);
                      }}
                      aria-current={selected ? "true" : undefined}
                      className="min-w-0 rounded text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
                    >
                      <span className={`block truncate font-medium ${s.name ? "text-[#1a0a0c]" : "italic text-ink-3"}`}>{displayName(s)}</span>
                      <span title={s.email} className="block truncate text-[0.8125rem] text-ink-2">
                        {s.email}
                      </span>
                    </button>
                  </div>
                </td>
                <td className="hidden py-3 pr-3 @[36rem]:table-cell">
                  <SourceBadge source={s.source} />
                </td>
                <td className="hidden whitespace-nowrap py-3 pr-3 text-[0.8125rem] text-ink @[30rem]:table-cell">
                  <time dateTime={s.subscribedAt}>{formatSubscriberDate(s.subscribedAt) ?? "—"}</time>
                </td>
                <td className="py-3">
                  <SubscriberStatusBadge status={s.status} />
                </td>
                <td className="py-3 pr-1 text-right" onClick={(e) => e.stopPropagation()}>
                  <ActionMenu label={`Actions for ${s.email}`} items={subscriberMenu(s, actions)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SubscriberMobileList({ rows, selectedId, checked, actions, onToggle, serifClassName }: Omit<Props, "onToggleAll">) {
  return (
    <ul className="divide-y divide-black/[0.06]">
      {rows.map((s) => (
        <li key={s.id} className={`admin-row-in flex items-start gap-3 py-3.5 ${s.id === selectedId ? "bg-[#f7e7e6]/60" : ""}`}>
          <input type="checkbox" checked={checked.has(s.id)} onChange={() => onToggle(s.id)} aria-label={`Select ${s.email}`} className={`${checkbox} mt-3 shrink-0`} />
          <button type="button" onClick={() => actions.onSelect(s.id)} className="flex min-w-0 flex-1 items-start gap-3 rounded text-left focus-visible:outline-2 focus-visible:outline-burgundy">
            <SubscriberAvatar subscriber={s} serifClassName={serifClassName} />
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className={`truncate font-medium ${s.name ? "text-[#1a0a0c]" : "italic text-ink-3"}`}>{displayName(s)}</span>
                <SubscriberStatusBadge status={s.status} />
              </span>
              <span className="block truncate text-[0.8125rem] text-ink-2">{s.email}</span>
              <span className="mt-1.5 flex items-center gap-2 text-xs text-ink-3">
                <SourceBadge source={s.source} /> {formatSubscriberDate(s.subscribedAt)}
              </span>
            </span>
            <ChevronRight aria-hidden="true" size={18} className="mt-2.5 shrink-0 text-ink-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}
