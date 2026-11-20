"use client";

import { ArrowLeft, CalendarDays, ExternalLink, Globe, History, Info, Layers, Link2, Pencil, Send, X } from "lucide-react";
import type { AdminCaseStudy } from "@/lib/admin/types";
import { formatAdminDate } from "@/lib/admin/case-study-utils";
import { caseStudyCategoryLabel, caseStudyGroupLabels } from "@/lib/case-studies/constants";
import { figureSections } from "@/lib/case-studies/rules";
import CaseStudyCover from "./CaseStudyCover";
import CaseStudyStatusBadge from "./CaseStudyStatusBadge";
import { COMMAND_META, availableCommands, coverLabel, isLive, liveUrl, type CaseStudyItemActions } from "./CaseStudyItems";

interface Props {
  item: AdminCaseStudy | null;
  actions: CaseStudyItemActions;
  onClose: () => void;
  variant?: "panel" | "drawer";
  serifClassName: string;
}

function visibilityNote(c: AdminCaseStudy) {
  if (c.deletedAt) return "Deleted: hidden from the website and the normal lists. Restore brings it back as a draft.";
  if (c.status === "ARCHIVED") return "Archived: not on the website. Restore it as a draft to edit, or publish it again.";
  if (c.status === "DRAFT") return "Draft: not on the website until it is published.";
  if (c.coverImage.illustrative) return "The cover is a temporary illustrative image (captioned on the site), not the client's work.";
  return null;
}

export default function CaseStudyDetailPanel({ item, actions, onClose, variant = "panel", serifClassName }: Props) {
  if (!item) {
    return (
      <div className="grid min-h-[20rem] place-items-center p-8 text-center">
        <div>
          <Layers aria-hidden="true" size={28} strokeWidth={1.4} className="mx-auto text-ink-3" />
          <p className="mt-3 text-sm text-ink-2">Select a case study to see its details.</p>
        </div>
      </div>
    );
  }

  const sections = figureSections(item);
  const note = visibilityNote(item);
  const commands = availableCommands(item);
  const live = isLive(item);

  const rows = [
    { icon: Link2, term: "Slug", value: item.slug },
    { icon: Layers, term: "Listing", value: `${caseStudyGroupLabels[item.group]} · order ${item.sortOrder}` },
    { icon: Send, term: "Published", value: formatAdminDate(item.publishedAt) ?? (item.firstPublishedAt ? `First ${formatAdminDate(item.firstPublishedAt)}` : "Never") },
    { icon: CalendarDays, term: "Created", value: formatAdminDate(item.createdAt) ?? "—" },
    { icon: Pencil, term: "Last updated", value: formatAdminDate(item.updatedAt) ?? "—" },
    ...(item.previousSlugs.length ? [{ icon: History, term: "Redirects", value: item.previousSlugs.map((s) => `/${s}`).join(", ") }] : []),
  ];

  return (
    <div key={item.id} className="admin-detail-in flex flex-col p-5 sm:p-6">
      {variant === "drawer" && (
        <button type="button" onClick={onClose} className="mb-4 inline-flex items-center gap-2 self-start rounded-md py-1 text-sm font-medium text-burgundy focus-visible:outline-2 focus-visible:outline-burgundy">
          <ArrowLeft aria-hidden="true" size={16} />
          Back to case studies
        </button>
      )}

      <div className="relative">
        <CaseStudyCover
          src={item.coverImage.kind === "IMAGE" ? (item.coverImage.url ?? null) : null}
          typographic={item.coverImage.kind === "TYPOGRAPHIC"}
          alt={item.coverImage.alt}
          label={coverLabel(item)}
          sizes="(min-width: 1280px) 24rem, 100vw"
          className="aspect-[16/9] rounded-lg"
        />
        {variant === "panel" && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-white"
          >
            <X aria-hidden="true" size={17} />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <CaseStudyStatusBadge status={item.status} deleted={item.deletedAt !== null} />
        {item.featured && <span className="rounded-full bg-[#c08a2d]/10 px-2.5 py-0.5 text-xs text-[#6b4a12]">Featured</span>}
        {item.migrated && <span className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-xs text-ink-2 ring-1 ring-inset ring-black/10">Approved content</span>}
      </div>
      <h2 id="case-study-detail-title" className={`${serifClassName} mt-2.5 text-[2rem] font-medium leading-[1.05] text-[#1a0a0c]`}>
        {item.title}
      </h2>
      <p className="mt-1 text-sm text-ink-2">{caseStudyCategoryLabel(item.category) || "No category"}</p>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink">{item.projectHighlight}</p>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-2">{item.overview}</p>

      {note && (
        <p className="mt-4 flex gap-2 rounded-lg border border-[#c08a2d]/25 bg-[#c08a2d]/[0.07] p-3 text-xs leading-relaxed text-[#6b4a12]">
          <Info aria-hidden="true" size={15} className="mt-px shrink-0" />
          {note}
        </p>
      )}

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Services</h3>
      {item.services.length ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {item.services.map((s) => (
            <li key={s.name} className="rounded-full bg-[#f7e4e4] px-2.5 py-1 text-xs text-[#7a1f2b]">
              {s.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-3">None added.</p>
      )}

      {sections.length ? (
        sections.map((section) => (
          <div key={section.label}>
            <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">{section.label}</h3>
            <ul className="mt-2 grid grid-cols-1 gap-2 min-[400px]:grid-cols-3">
              {section.items.map((f) => (
                <li key={`${f.value}-${f.label}`} className="rounded-lg border border-black/[0.08] bg-white/70 px-3 py-2.5 text-center text-xs leading-snug text-ink">
                  {f.value && <span className="block font-semibold">{f.value}</span>}
                  {f.label}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <>
          <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Scope and results</h3>
          <p className="mt-2 text-sm text-ink-3">None added (optional).</p>
        </>
      )}

      <dl className="mt-5 divide-y divide-black/[0.06] rounded-lg border border-black/[0.08] text-sm">
        {rows.map(({ icon: Icon, term, value }) => (
          <div key={term} className="flex items-center gap-3 px-3.5 py-2.5">
            <Icon aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-ink-2" />
            <dt className="w-24 shrink-0 text-ink">{term}</dt>
            <dd className="min-w-0 truncate text-ink-2" title={value}>
              {value}
            </dd>
          </div>
        ))}
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <Globe aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-ink-2" />
          <dt className="w-24 shrink-0 text-ink">Live URL</dt>
          <dd className="min-w-0 truncate text-ink-2">
            {live ? (
              <a href={liveUrl(item)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ink hover:text-burgundy hover:underline">
                {liveUrl(item)}
                <ExternalLink aria-hidden="true" size={13} />
              </a>
            ) : (
              "Not public"
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {commands.map((command, i) => {
          const meta = COMMAND_META[command];
          const primary = i === 0;
          return (
            <button
              key={command}
              type="button"
              onClick={() => actions.onCommand(item.id, command)}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${
                primary
                  ? "bg-[#5a0c14] text-white hover:bg-[#6b111b]"
                  : meta.danger
                    ? "border border-[#a3242f]/25 bg-[#a3242f]/[0.04] text-[#a3242f] hover:bg-[#a3242f]/10"
                    : "border border-black/20 bg-white text-ink hover:border-black/40"
              } ${commands.length === 1 ? "col-span-2" : ""}`}
            >
              {meta.icon} {meta.label}
            </button>
          );
        })}
        {live && (
          <a
            href={liveUrl(item)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black/20 bg-white px-3 text-sm font-medium text-ink transition-colors hover:border-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
          >
            <ExternalLink aria-hidden="true" size={16} /> View on site
          </a>
        )}
      </div>
    </div>
  );
}
