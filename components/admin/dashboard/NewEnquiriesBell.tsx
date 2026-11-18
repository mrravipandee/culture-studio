"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useAdminCounts } from "../AdminCountsContext";

/** Header bell: dot when there are NEW enquiries (live count from AdminCountsContext). */
export default function NewEnquiriesBell({ initial }: { initial: number }) {
  const { newEnquiries } = useAdminCounts();
  const count = newEnquiries ?? initial;
  return (
    <Link
      href="/admin/enquiries"
      aria-label={count > 0 ? `${count} new enquiries` : "Enquiries"}
      className="relative grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-burgundy"
    >
      <Bell aria-hidden="true" size={20} strokeWidth={1.6} />
      {count > 0 && <span aria-hidden="true" className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#b3261e] ring-2 ring-[var(--cream)]" />}
    </Link>
  );
}
