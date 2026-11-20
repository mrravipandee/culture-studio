"use client";

import type { ReactNode } from "react";
import { Archive, ExternalLink, Eye, EyeOff, Pencil, RotateCcw, Star, Trash2 } from "lucide-react";
import type { AdminCaseStudy } from "@/lib/admin/types";
import { formatAdminDate } from "@/lib/admin/case-study-utils";
import { caseStudyCategoryLabel } from "@/lib/case-studies/constants";
import ActionMenu, { type ActionMenuItem } from "../ActionMenu";
import CaseStudyCover from "./CaseStudyCover";
import CaseStudyStatusBadge from "./CaseStudyStatusBadge";

export type CaseStudyCommand = "edit" | "publish" | "unpublish" | "archive" | "restore" | "delete";

export interface CaseStudyItemActions {
  onSelect: (id: string) => void;
  onCommand: (id: string, command: CaseStudyCommand) => void;
}

/** Public only when PUBLISHED and not deleted (the API enforces the same rule). */
export const isLive = (c: AdminCaseStudy) => c.status === "PUBLISHED" && c.deletedAt === null;
export const liveUrl = (c: AdminCaseStudy) => `/case-studies/${c.slug}`;

/** The actions a record allows, in display order (mirrors CASE_STUDY_TRANSITIONS). */
export function availableCommands(c: AdminCaseStudy): CaseStudyCommand[] {
  if (c.deletedAt) return ["restore"];
  const list: CaseStudyCommand[] = ["edit"];
  if (c.status === "DRAFT") list.push("publish");
  if (c.status === "PUBLISHED") list.push("unpublish", "archive");
  if (c.status === "ARCHIVED") list.push("restore", "publish");
  list.push("delete");
  return list;
}

export const COMMAND_META: Record<CaseStudyCommand, { label: string; icon: ReactNode; danger?: boolean }> = {
  edit: { label: "Edit", icon: <Pencil aria-hidden="true" size={15} /> },
  publish: { label: "Publish", icon: <Eye aria-hidden="true" size={15} /> },
  unpublish: { label: "Unpublish", icon: <EyeOff aria-hidden="true" size={15} /> },
  archive: { label: "Archive", icon: <Archive aria-hidden="true" size={15} /> },
  restore: { label: "Restore as draft", icon: <RotateCcw aria-hidden="true" size={15} /> },
  delete: { label: "Delete", icon: <Trash2 aria-hidden="true" size={15} />, danger: true },
};

function menuItems(c: AdminCaseStudy, a: CaseStudyItemActions): ActionMenuItem[] {
  const items: ActionMenuItem[] = availableCommands(c).map((command) => ({ ...COMMAND_META[command], onSelect: () => a.onCommand(c.id, command) }));
  if (isLive(c)) items.splice(1, 0, { label: "View on site", icon: <ExternalLink aria-hidden="true" size={15} />, href: liveUrl(c), external: true });
  return items;
}

const dateLine = (c: AdminCaseStudy) => {
  if (c.deletedAt) return `Deleted ${formatAdminDate(c.deletedAt) ?? ""}`.trim();
  return `Updated ${formatAdminDate(c.updatedAt) ?? "—"}`;
};

const meta = (c: AdminCaseStudy) => [caseStudyCategoryLabel(c.category) || "No category", `/${c.slug}`].join(" · ");

const coverSrc = (c: AdminCaseStudy) => (c.coverImage.kind === "IMAGE" ? (c.coverImage.url ?? null) : null);
export const coverLabel = (c: AdminCaseStudy) => (c.sortOrder ? String(c.sortOrder).padStart(2, "0") : c.title.charAt(0) || "—");

function FeaturedMark({ item }: { item: AdminCaseStudy }) {
  if (!item.featured) return null;
  return (
    <span title="Featured on the Home page" className="inline-flex items-center gap-1 rounded-full bg-[#c08a2d]/10 px-2 py-0.5 text-[0.6875rem] font-medium text-[#6b4a12]">
      <Star aria-hidden="true" size={11} /> Featured
    </span>
  );
}

/** Grid card: cover, status, title, category, date and actions. The whole card selects. */
export function CaseStudyCard({ item, selected, actions }: { item: AdminCaseStudy; selected: boolean; actions: CaseStudyItemActions }) {
  return (
    <article
      className={`admin-row-in group relative flex h-full flex-col rounded-xl border bg-white transition-[border-color,box-shadow,background-color] duration-300 ${
        selected ? "border-[#7a1f2b]/45 shadow-[0_0_0_1px_rgba(122,31,43,0.25)]" : "border-black/[0.09] hover:border-black/20"
      } ${item.deletedAt ? "opacity-75" : ""}`}
    >
      <div className="relative">
        <CaseStudyCover src={coverSrc(item)} typographic={item.coverImage.kind === "TYPOGRAPHIC"} alt={item.coverImage.alt} label={coverLabel(item)} sizes="(min-width: 1280px) 16vw, (min-width: 768px) 30vw, 100vw" className="aspect-[16/7] rounded-t-xl" />
        <CaseStudyStatusBadge status={item.status} deleted={item.deletedAt !== null} className="absolute right-3 top-3 shadow-sm" />
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
          <span className="flex items-center gap-2">
            {dateLine(item)}
            <FeaturedMark item={item} />
          </span>
          <ActionMenu label={`Actions for ${item.title}`} items={menuItems(item, actions)} />
        </div>
      </div>
    </article>
  );
}

/** List row: compact, same actions. */
export function CaseStudyRow({ item, selected, actions }: { item: AdminCaseStudy; selected: boolean; actions: CaseStudyItemActions }) {
  return (
    <li className={`admin-row-in group relative flex items-center gap-4 rounded-lg px-2 py-3 transition-colors ${selected ? "bg-[#f7e7e6]" : "hover:bg-black/[0.02]"} ${item.deletedAt ? "opacity-75" : ""}`}>
      <CaseStudyCover src={coverSrc(item)} typographic={item.coverImage.kind === "TYPOGRAPHIC"} alt="" label={coverLabel(item)} sizes="112px" className="aspect-[16/10] w-24 shrink-0 rounded-md sm:w-28" />
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
        <p className="mt-1 flex items-center gap-2 text-xs text-ink-3">
          {dateLine(item)}
          <FeaturedMark item={item} />
        </p>
      </div>
      <CaseStudyStatusBadge status={item.status} deleted={item.deletedAt !== null} className="hidden sm:inline-flex" />
      <div className="relative z-10">
        <ActionMenu label={`Actions for ${item.title}`} items={menuItems(item, actions)} />
      </div>
    </li>
  );
}
