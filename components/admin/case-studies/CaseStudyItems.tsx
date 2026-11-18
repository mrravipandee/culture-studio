"use client";

import { ExternalLink, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import type { AdminCaseStudy } from "@/lib/admin/types";
import { formatAdminDate } from "@/lib/admin/case-study-utils";
import ActionMenu, { type ActionMenuItem } from "../ActionMenu";
import CaseStudyCover from "./CaseStudyCover";
import CaseStudyStatusBadge from "./CaseStudyStatusBadge";

export interface CaseStudyItemActions {
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onDelete: (id: string) => void;
}

/** "View on site" only for projects that are actually public (allowlist) and published here. */
export const isLive = (c: AdminCaseStudy) => c.publicSlug !== null && c.status === "PUBLISHED";
/** Public URL from the allowlisted slug (not the locally edited one). */
export const liveUrl = (c: AdminCaseStudy) => (c.publicSlug ? `/case-studies/${c.publicSlug}` : null);

function menuItems(c: AdminCaseStudy, a: CaseStudyItemActions): ActionMenuItem[] {
  const items: ActionMenuItem[] = [{ label: "Edit", icon: <Pencil aria-hidden="true" size={15} />, onSelect: () => a.onEdit(c.id) }];
  if (isLive(c)) items.push({ label: "View on site", icon: <ExternalLink aria-hidden="true" size={15} />, href: liveUrl(c) ?? undefined, external: true });
  items.push({
    label: c.status === "PUBLISHED" ? "Unpublish" : "Publish",
    icon: c.status === "PUBLISHED" ? <EyeOff aria-hidden="true" size={15} /> : <Eye aria-hidden="true" size={15} />,
    onSelect: () => a.onTogglePublish(c.id),
  });
  items.push({ label: "Delete", icon: <Trash2 aria-hidden="true" size={15} />, onSelect: () => a.onDelete(c.id), danger: true });
  return items;
}

const dateLine = (c: AdminCaseStudy) => {
  const updated = formatAdminDate(c.updatedAt);
  return updated ? `Updated ${updated}` : "Approved content";
};

const meta = (c: AdminCaseStudy) => [c.category, ...(c.isLocal ? ["Local"] : [])].join(" · ");

/** Grid card: cover, status, title, category, date and actions. The whole card selects. */
export function CaseStudyCard({ item, selected, actions }: { item: AdminCaseStudy; selected: boolean; actions: CaseStudyItemActions }) {
  return (
    <article
      className={`admin-row-in group relative flex h-full flex-col rounded-xl border bg-white transition-[border-color,box-shadow,background-color] duration-300 ${
        selected ? "border-[#7a1f2b]/45 shadow-[0_0_0_1px_rgba(122,31,43,0.25)]" : "border-black/[0.09] hover:border-black/20"
      }`}
    >
      <div className="relative">
        <CaseStudyCover src={item.coverImage} alt={item.coverAlt} label={item.number ?? item.title.charAt(0)} sizes="(min-width: 1280px) 16vw, (min-width: 768px) 30vw, 100vw" className="aspect-[16/7] rounded-t-xl" />
        <CaseStudyStatusBadge status={item.status} className="absolute right-3 top-3 shadow-sm" />
      </div>
      <div className="flex flex-1 flex-col px-4 pb-3 pt-3.5">
        <h3 className="text-[0.9375rem] font-semibold leading-snug text-[#1a0a0c]">
          <button
            type="button"
            onClick={() => actions.onSelect(item.id)}
            aria-current={selected ? "true" : undefined}
            className="text-left after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-burgundy"
          >
            {item.title}
          </button>
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-ink-2">{meta(item)}</p>
        <div className="relative z-10 mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-ink-2">
          <span>{dateLine(item)}</span>
          <ActionMenu label={`Actions for ${item.title}`} items={menuItems(item, actions)} />
        </div>
      </div>
    </article>
  );
}

/** List row: compact, same actions. */
export function CaseStudyRow({ item, selected, actions }: { item: AdminCaseStudy; selected: boolean; actions: CaseStudyItemActions }) {
  return (
    <li className={`admin-row-in group relative flex items-center gap-4 rounded-lg px-2 py-3 transition-colors ${selected ? "bg-[#f7e7e6]" : "hover:bg-black/[0.02]"}`}>
      <CaseStudyCover src={item.coverImage} alt="" label={item.number ?? item.title.charAt(0)} sizes="112px" className="aspect-[16/10] w-24 shrink-0 rounded-md sm:w-28" />
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => actions.onSelect(item.id)}
          aria-current={selected ? "true" : undefined}
          className="block max-w-full truncate text-left text-[0.9375rem] font-semibold text-[#1a0a0c] after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-burgundy"
        >
          {item.title}
        </button>
        <p className="mt-0.5 truncate text-xs text-ink-2">{meta(item)}</p>
        <p className="mt-1 text-xs text-ink-3">{dateLine(item)}</p>
      </div>
      <CaseStudyStatusBadge status={item.status} className="hidden sm:inline-flex" />
      <div className="relative z-10">
        <ActionMenu label={`Actions for ${item.title}`} items={menuItems(item, actions)} />
      </div>
    </li>
  );
}
