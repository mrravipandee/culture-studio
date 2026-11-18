"use client";

import { ArrowLeft, CalendarDays, ExternalLink, Eye, EyeOff, Globe, Info, Layers, Link2, Pencil, Trash2, X } from "lucide-react";
import type { AdminCaseStudy } from "@/lib/admin/types";
import { formatAdminDate, publicFigures } from "@/lib/admin/case-study-utils";
import CaseStudyCover from "./CaseStudyCover";
import CaseStudyStatusBadge from "./CaseStudyStatusBadge";
import { isLive, liveUrl, type CaseStudyItemActions } from "./CaseStudyItems";

interface Props {
  item: AdminCaseStudy | null;
  actions: CaseStudyItemActions;
  onClose: () => void;
  variant?: "panel" | "drawer";
  serifClassName: string;
}

/** Visibility explanation: the admin preview never changes what the public website shows. */
function visibilityNote(c: AdminCaseStudy) {
  if (c.isLocal) return "Created in this preview only. It is not on the public website and is lost on reload.";
  if (c.publicSlug && c.slug !== c.publicSlug) return `Slug changed in this preview only. The public page stays at /case-studies/${c.publicSlug}.`;
  if (c.publicSlug && c.status === "DRAFT") return "Unpublished in this preview only. It is still live on the public website (the publishing list has not changed).";
  if (!c.publicSlug && c.status === "PUBLISHED") return "Published in this preview only. It is not on the public website.";
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

  const figures = publicFigures(item);
  const note = visibilityNote(item);
  const created = formatAdminDate(item.createdAt);
  const updated = formatAdminDate(item.updatedAt);

  return (
    <div key={item.id} className="admin-detail-in flex flex-col p-5 sm:p-6">
      {variant === "drawer" && (
        <button type="button" onClick={onClose} className="mb-4 inline-flex items-center gap-2 self-start rounded-md py-1 text-sm font-medium text-burgundy focus-visible:outline-2 focus-visible:outline-burgundy">
          <ArrowLeft aria-hidden="true" size={16} />
          Back to case studies
        </button>
      )}

      <div className="relative">
        <CaseStudyCover src={item.coverImage} alt={item.coverAlt} label={item.number ?? item.title.charAt(0)} sizes="(min-width: 1280px) 24rem, 100vw" className="aspect-[16/9] rounded-lg" />
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
      {item.coverIsTemporary && <p className="mt-1.5 text-[0.6875rem] text-ink-3">Temporary illustrative image</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <CaseStudyStatusBadge status={item.status} />
        {item.isLocal && <span className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-xs text-ink-2 ring-1 ring-inset ring-black/10">Local preview</span>}
      </div>
      <h2 id="case-study-detail-title" className={`${serifClassName} mt-2.5 text-[2rem] font-medium leading-[1.05] text-[#1a0a0c]`}>
        {item.title}
      </h2>
      <p className="mt-1 text-sm text-ink-2">{item.category}</p>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink">{item.highlight}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">{item.overview}</p>

      {note && (
        <p className="mt-4 flex gap-2 rounded-lg border border-[#c08a2d]/25 bg-[#c08a2d]/[0.07] p-3 text-xs leading-relaxed text-[#6b4a12]">
          <Info aria-hidden="true" size={15} className="mt-px shrink-0" />
          {note}
        </p>
      )}

      {/* Services */}
      <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Services</h3>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {item.services.map((s) => (
          <li key={s} className="rounded-full bg-[#f7e4e4] px-2.5 py-1 text-xs text-[#7a1f2b]">
            {s}
          </li>
        ))}
      </ul>

      {/* Scope or results */}
      <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">{item.figuresLabel}</h3>
      {figures.length ? (
        <ul className="mt-2 grid grid-cols-1 gap-2 min-[400px]:grid-cols-3">
          {figures.map((f) => (
            <li key={f} className="rounded-lg border border-black/[0.08] bg-white/70 px-3 py-2.5 text-center text-xs leading-snug text-ink">
              {f}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-3">None added.</p>
      )}

      {/* Meta */}
      <dl className="mt-5 divide-y divide-black/[0.06] rounded-lg border border-black/[0.08] text-sm">
        {[
          { icon: Link2, term: "Slug", value: item.slug },
          { icon: CalendarDays, term: "Created", value: created ?? "Not recorded" },
          { icon: Pencil, term: "Last updated", value: updated ?? "Not recorded" },
        ].map(({ icon: Icon, term, value }) => (
          <div key={term} className="flex items-center gap-3 px-3.5 py-2.5">
            <Icon aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-ink-2" />
            <dt className="w-24 shrink-0 text-ink">{term}</dt>
            <dd className="min-w-0 truncate text-ink-2">{value}</dd>
          </div>
        ))}
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <Globe aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-ink-2" />
          <dt className="w-24 shrink-0 text-ink">Live URL</dt>
          <dd className="min-w-0 truncate text-ink-2">
            {isLive(item) ? (
              <a href={liveUrl(item) ?? undefined} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ink hover:text-burgundy hover:underline">
                {liveUrl(item)}
                <ExternalLink aria-hidden="true" size={13} />
              </a>
            ) : (
              "Not public"
            )}
          </dd>
        </div>
      </dl>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => actions.onEdit(item.id)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#5a0c14] px-3 text-sm font-medium text-white transition-colors hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
        >
          <Pencil aria-hidden="true" size={16} /> Edit
        </button>
        {isLive(item) ? (
          <a
            href={liveUrl(item) ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black/20 bg-white px-3 text-sm font-medium text-ink transition-colors hover:border-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
          >
            <ExternalLink aria-hidden="true" size={16} /> View on Site
          </a>
        ) : (
          <span className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-dashed border-black/15 px-3 text-sm text-ink-3">Not on site</span>
        )}
        <button
          type="button"
          onClick={() => actions.onTogglePublish(item.id)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black/20 bg-white px-3 text-sm font-medium text-ink transition-colors hover:border-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
        >
          {item.status === "PUBLISHED" ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
          {item.status === "PUBLISHED" ? "Unpublish" : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => actions.onDelete(item.id)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#a3242f]/25 bg-[#a3242f]/[0.04] px-3 text-sm font-medium text-[#a3242f] transition-colors hover:bg-[#a3242f]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3242f]"
        >
          <Trash2 aria-hidden="true" size={16} /> Delete
        </button>
      </div>
    </div>
  );
}
