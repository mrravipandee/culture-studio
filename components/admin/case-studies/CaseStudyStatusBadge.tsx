import { caseStudyStatusLabels, type CaseStudyStatus } from "@/lib/admin/types";

const STYLE: Record<CaseStudyStatus, string> = {
  PUBLISHED: "bg-[#e5f1e8] text-[#2f6b47] ring-[#2f6b47]/15",
  DRAFT: "bg-[#f7e4e4] text-[#7a1f2b] ring-[#7a1f2b]/15",
};

export default function CaseStudyStatusBadge({ status, className = "" }: { status: CaseStudyStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors duration-300 ${STYLE[status]} ${className}`}>
      {caseStudyStatusLabels[status]}
    </span>
  );
}
