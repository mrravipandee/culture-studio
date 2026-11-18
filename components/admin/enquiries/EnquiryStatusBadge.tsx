import { enquiryStatusLabels, type EnquiryStatus } from "@/lib/admin/types";

/** Status pills: always text-labelled (never colour alone), muted brand tones. */
const STYLE: Record<EnquiryStatus, string> = {
  NEW: "bg-[#f7e4e4] text-[#7a1f2b] ring-[#7a1f2b]/15",
  READ: "bg-black/[0.05] text-ink-2 ring-black/10",
  REPLIED: "bg-[#e5f1e8] text-[#2f6b47] ring-[#2f6b47]/15",
  CLOSED: "bg-[#ecebea] text-[#5f5a58] ring-black/10",
};

export default function EnquiryStatusBadge({ status, className = "" }: { status: EnquiryStatus; className?: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors duration-300 ${STYLE[status]} ${className}`}
    >
      {enquiryStatusLabels[status]}
    </span>
  );
}
