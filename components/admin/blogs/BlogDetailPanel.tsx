"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, ExternalLink, Eye, FileText, Globe, Info, Link2, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import type { BlogSummary } from "@/lib/admin/types";
import { formatBlogAdminDate } from "@/lib/admin/blog-utils";
import { readingTimeLabel } from "@/lib/rich-text";
import CaseStudyCover from "../case-studies/CaseStudyCover";
import CaseStudyStatusBadge from "../case-studies/CaseStudyStatusBadge";
import { blogPublicUrl, isBlogLive, type BlogRowActions } from "./BlogTable";

function visibilityNote(b: BlogSummary) {
  if (b.status === "DRAFT") return b.firstPublishedAt ? "Unpublished: not on the website. Publish it again when it's ready." : "Draft: not on the website until it is published.";
  if (b.previousSlugs.length) return `Old addresses redirect here: ${b.previousSlugs.map((s) => `/blog/${s}`).join(", ")}.`;
  return null;
}

export default function BlogDetailPanel({ post, actions, onClose, variant = "panel", serifClassName }: { post: BlogSummary | null; actions: BlogRowActions; onClose: () => void; variant?: "panel" | "drawer"; serifClassName: string }) {
  if (!post) {
    return (
      <div className="grid min-h-[20rem] place-items-center p-8 text-center">
        <div>
          <FileText aria-hidden="true" size={28} strokeWidth={1.4} className="mx-auto text-ink-3" />
          <p className="mt-3 text-sm text-ink-2">Select an article to see its details.</p>
        </div>
      </div>
    );
  }
  const words = post.wordCount;
  const readingTime = words ? readingTimeLabel(words) : "—";
  const note = visibilityNote(post);
  const live = isBlogLive(post);
  const rows = [
    { icon: CalendarDays, term: "Published", value: post.status === "PUBLISHED" ? formatBlogAdminDate(post.publishedAt, true) ?? "—" : "Not published" },
    { icon: RefreshCw, term: "Last updated", value: formatBlogAdminDate(post.updatedAt, true) ?? "—" },
    { icon: Link2, term: "Slug", value: post.slug },
  ];

  return (
    <div key={post.id} className="admin-detail-in flex flex-col p-5 sm:p-6">
      {variant === "drawer" && (
        <button type="button" onClick={onClose} className="mb-4 inline-flex items-center gap-2 self-start rounded-md py-1 text-sm font-medium text-burgundy focus-visible:outline-2 focus-visible:outline-burgundy">
          <ArrowLeft aria-hidden="true" size={16} /> Back to articles
        </button>
      )}
      <div className="relative">
        <CaseStudyCover src={post.coverImage} alt={post.coverImageAlt} label={post.title.charAt(0)} sizes="(min-width: 1280px) 24rem, 100vw" className="aspect-[16/8] rounded-lg" />
        {variant === "panel" && (
          <button type="button" onClick={onClose} aria-label="Close details" className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-white">
            <X aria-hidden="true" size={17} />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <CaseStudyStatusBadge status={post.status} />
      </div>
      <h2 id="blog-detail-title" className={`${serifClassName} mt-2.5 text-[1.875rem] font-medium leading-[1.08] text-[#1a0a0c]`}>
        {post.title}
      </h2>
      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm text-ink-2">
        <span>{post.category || "No category"}</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock3 aria-hidden="true" size={13} />
          {words ? `${readingTime} (${words} words)` : "No body yet"}
        </span>
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink">{post.excerpt || <span className="text-ink-3">No excerpt yet.</span>}</p>

      {note && (
        <p className="mt-4 flex gap-2 rounded-lg border border-[#c08a2d]/25 bg-[#c08a2d]/[0.07] p-3 text-xs leading-relaxed text-[#6b4a12]">
          <Info aria-hidden="true" size={15} className="mt-px shrink-0" />
          {note}
        </p>
      )}

      <dl className="mt-5 divide-y divide-black/[0.06] rounded-lg border border-black/[0.08] text-sm">
        {rows.map(({ icon: Icon, term, value }) => (
          <div key={term} className="flex items-center gap-3 px-3.5 py-2.5">
            <Icon aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-ink-2" />
            <dt className="w-24 shrink-0 text-ink">{term}</dt>
            <dd className="min-w-0 truncate text-ink-2">{value}</dd>
          </div>
        ))}
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <Globe aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-ink-2" />
          <dt className="w-24 shrink-0 text-ink">Blog URL</dt>
          <dd className="min-w-0 truncate text-ink-2">
            {live ? (
              <a href={blogPublicUrl(post) ?? undefined} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ink hover:text-burgundy hover:underline">
                {blogPublicUrl(post)} <ExternalLink aria-hidden="true" size={13} />
              </a>
            ) : (
              "Not public"
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Link href={`/admin/blogs/${post.id}/edit`} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#5a0c14] px-3 text-sm font-medium text-white transition-colors hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy">
          <Pencil aria-hidden="true" size={16} /> Edit
        </Link>
        {live ? (
          <a href={blogPublicUrl(post) ?? undefined} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black/20 bg-white px-3 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy">
            <ExternalLink aria-hidden="true" size={16} /> View Blog
          </a>
        ) : (
          <Link href={`/admin/blogs/${post.id}/edit?preview=1`} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black/20 bg-white px-3 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy">
            <Eye aria-hidden="true" size={16} /> Preview
          </Link>
        )}
        <button type="button" onClick={() => actions.onTogglePublish(post.id)} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black/20 bg-white px-3 text-sm font-medium text-ink hover:border-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy">
          {post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
        </button>
        <button type="button" onClick={() => actions.onDelete(post.id)} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#a3242f]/25 bg-[#a3242f]/[0.04] px-3 text-sm font-medium text-[#a3242f] hover:bg-[#a3242f]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3242f]">
          <Trash2 aria-hidden="true" size={16} /> Delete
        </button>
      </div>
    </div>
  );
}
