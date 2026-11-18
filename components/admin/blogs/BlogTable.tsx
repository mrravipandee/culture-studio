"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ExternalLink, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import type { BlogPost } from "@/lib/admin/types";
import { formatBlogAdminDate } from "@/lib/admin/blog-utils";
import ActionMenu, { type ActionMenuItem } from "../ActionMenu";
import CaseStudyCover from "../case-studies/CaseStudyCover";
import CaseStudyStatusBadge from "../case-studies/CaseStudyStatusBadge";

export interface BlogRowActions {
  onSelect: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Live on the public site: on the publishing list and published here. */
export const isBlogLive = (b: BlogPost) => b.publicSlug !== null && b.status === "PUBLISHED";
export const blogPublicUrl = (b: BlogPost) => (b.publicSlug ? `/blog/${b.publicSlug}` : null);

export function blogMenu(b: BlogPost, a: BlogRowActions): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { label: "Edit", icon: <Pencil aria-hidden="true" size={15} />, href: `/admin/blogs/${b.id}/edit` },
    { label: "Preview", icon: <Eye aria-hidden="true" size={15} />, href: `/admin/blogs/${b.id}/edit?preview=1` },
  ];
  if (isBlogLive(b)) items.push({ label: "View on site", icon: <ExternalLink aria-hidden="true" size={15} />, href: blogPublicUrl(b) ?? undefined, external: true });
  items.push({
    label: b.status === "PUBLISHED" ? "Unpublish" : "Publish",
    icon: b.status === "PUBLISHED" ? <EyeOff aria-hidden="true" size={15} /> : <Eye aria-hidden="true" size={15} />,
    onSelect: () => a.onTogglePublish(b.id),
  });
  items.push({ label: "Delete", icon: <Trash2 aria-hidden="true" size={15} />, onSelect: () => a.onDelete(b.id), danger: true });
  return items;
}

const checkbox = "size-[1.125rem] cursor-pointer accent-[#5a0c14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy";

interface Props {
  rows: BlogPost[];
  selectedId: string | null;
  checked: Set<string>;
  actions: BlogRowActions;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], on: boolean) => void;
}

/** Desktop/tablet table. */
export function BlogTable({ rows, selectedId, checked, actions, onToggle, onToggleAll }: Props) {
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
        <caption className="sr-only">Blog articles, most recently updated first. Select a row to see details.</caption>
        <thead>
          <tr className="text-[0.8125rem] text-ink">
            <th scope="col" className="w-10 py-3 pl-2">
              <input ref={head} type="checkbox" checked={all} onChange={() => onToggleAll(ids, !all)} aria-label={all ? "Deselect all articles on this page" : "Select all articles on this page"} className={checkbox} />
            </th>
            <th scope="col" className="py-3 pr-3 font-medium">Title</th>
            <th scope="col" className="hidden w-[8.5rem] py-3 pr-3 font-medium @[38rem]:table-cell">Category</th>
            <th scope="col" className="w-[6.5rem] py-3 pr-2 font-medium">Status</th>
            <th scope="col" className="hidden w-[7rem] py-3 pr-2 font-medium @[32rem]:table-cell">Updated</th>
            <th scope="col" className="w-11 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => {
            const selected = b.id === selectedId;
            return (
              <tr key={b.id} onClick={() => actions.onSelect(b.id)} className={`admin-row-in cursor-pointer border-t border-black/[0.06] transition-colors ${selected ? "bg-[#f7e7e6]" : "hover:bg-black/[0.02]"}`}>
                <td className="py-3 pl-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={checked.has(b.id)} onChange={() => onToggle(b.id)} aria-label={`Select “${b.title}”`} className={checkbox} />
                </td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-3.5">
                    <CaseStudyCover src={b.coverImage} alt="" label={b.title.charAt(0)} sizes="80px" className="aspect-[16/10] w-[4.5rem] shrink-0 rounded-md @[38rem]:w-20" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        actions.onSelect(b.id);
                      }}
                      aria-current={selected ? "true" : undefined}
                      className="line-clamp-3 rounded text-left text-[0.875rem] font-medium leading-snug text-[#1a0a0c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
                    >
                      {b.title}
                      {b.isLocal && <span className="ml-1.5 align-middle text-[0.6875rem] font-normal text-ink-3">· Local</span>}
                    </button>
                  </div>
                </td>
                <td className="hidden py-3 pr-3 @[38rem]:table-cell">
                  <span className="inline-block max-w-full truncate rounded-full bg-[#f7e4e4] px-2.5 py-1 text-xs text-[#7a1f2b]">{b.category || "—"}</span>
                </td>
                <td className="py-3 pr-2">
                  <CaseStudyStatusBadge status={b.status} />
                </td>
                <td className="hidden whitespace-nowrap py-3 pr-2 text-[0.8125rem] text-ink @[32rem]:table-cell">
                  <time dateTime={b.updatedAt}>{formatBlogAdminDate(b.updatedAt) ?? "—"}</time>
                </td>
                <td className="py-3 pr-1 text-right" onClick={(e) => e.stopPropagation()}>
                  <ActionMenu label={`Actions for “${b.title}”`} items={blogMenu(b, actions)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Phone list. */
export function BlogMobileList({ rows, selectedId, checked, actions, onToggle }: Omit<Props, "onToggleAll">) {
  return (
    <ul className="divide-y divide-black/[0.06]">
      {rows.map((b) => (
        <li key={b.id} className={`admin-row-in flex items-start gap-3 py-3.5 ${b.id === selectedId ? "bg-[#f7e7e6]/60" : ""}`}>
          <input type="checkbox" checked={checked.has(b.id)} onChange={() => onToggle(b.id)} aria-label={`Select “${b.title}”`} className={`${checkbox} mt-1 shrink-0`} />
          <button type="button" onClick={() => actions.onSelect(b.id)} className="flex min-w-0 flex-1 items-start gap-3 rounded text-left focus-visible:outline-2 focus-visible:outline-burgundy">
            <CaseStudyCover src={b.coverImage} alt="" label={b.title.charAt(0)} sizes="80px" className="aspect-[16/10] w-20 shrink-0 rounded-md" />
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-sm font-medium leading-snug text-[#1a0a0c]">{b.title}</span>
              <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-2">
                <CaseStudyStatusBadge status={b.status} />
                <span>{b.category || "No category"}</span>
                <span>· {formatBlogAdminDate(b.updatedAt) ?? "—"}</span>
              </span>
            </span>
          </button>
          <Link href={`/admin/blogs/${b.id}/edit`} aria-label={`Edit “${b.title}”`} className="grid size-9 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-burgundy">
            <Pencil aria-hidden="true" size={16} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
