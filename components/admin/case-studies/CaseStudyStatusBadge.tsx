import { caseStudyStatusLabels, type CaseStudyStatus } from "@/lib/admin/types";

const STYLE: Record<CaseStudyStatus | "DELETED", string> = {
  PUBLISHED: "bg-[#e5f1e8] text-[#2f6b47] ring-[#2f6b47]/15",
  DRAFT: "bg-[#f7e4e4] text-[#7a1f2b] ring-[#7a1f2b]/15",
  ARCHIVED: "bg-[#efece6] text-[#5c5348] ring-[#5c5348]/15",
  DELETED: "bg-black/[0.05] text-ink-2 ring-black/10",
};

/** Status pill. Soft-deleted records show "Deleted" whatever their last status was. */
export default function CaseStudyStatusBadge({ status, deleted = false, className = "" }: { status: CaseStudyStatus; deleted?: boolean; className?: string }) {
  const key = deleted ? "DELETED" : status;
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors duration-300 ${STYLE[key]} ${className}`}>
      {deleted ? "Deleted" : caseStudyStatusLabels[status]}
    </span>
  );
}
