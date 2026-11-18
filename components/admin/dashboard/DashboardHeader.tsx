import { CalendarDays } from "lucide-react";
import { editorialSerif } from "@/lib/fonts";
import { SyncNewEnquiries } from "../AdminCountsContext";
import NewEnquiriesBell from "./NewEnquiriesBell";
import ProfileMenu from "./ProfileMenu";

interface Props {
  /** Defaults are the Dashboard home copy; other admin pages pass their own. */
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Signed-in admin's name and email (from MongoDB, via requireAdmin). */
  name: string;
  email: string;
  /** Today's date, formatted on the server at request time. */
  today: string;
  todayIso: string;
  newEnquiries: number;
  /** Pages showing real content (not demo data) hide the badge. */
  showDemoBadge?: boolean;
}

export default function DashboardHeader({
  eyebrow = "Dashboard",
  title = "Welcome Back",
  description = "Here\u2019s what\u2019s happening at CULT.URE.",
  name,
  email,
  today,
  todayIso,
  newEnquiries,
  showDemoBadge = true,
}: Props) {
  return (
    <header className="admin-fade-up flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="flex flex-wrap items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-burgundy">
          {eyebrow}
          {showDemoBadge && <span className="rounded-full border border-burgundy/25 px-2 py-0.5 text-[0.625rem] tracking-[0.12em]">Demo data</span>}
        </p>
        <h1 className={`${editorialSerif.className} mt-2 text-[2.5rem] font-medium leading-[1.05] tracking-[-0.015em] text-[#1a0a0c] sm:text-[2.75rem]`}>
          {title}
        </h1>
        <p className="mt-2 text-[0.9375rem] text-ink-2">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <p className="flex h-11 items-center gap-2.5 rounded-lg border border-black/10 bg-white/70 px-4 text-sm text-ink">
          <CalendarDays aria-hidden="true" size={17} strokeWidth={1.6} />
          <time dateTime={todayIso}>{today}</time>
        </p>
        <SyncNewEnquiries count={newEnquiries} />
        <NewEnquiriesBell initial={newEnquiries} />
        <span aria-hidden="true" className="hidden h-10 w-px bg-black/10 sm:block" />
        <ProfileMenu name={name} email={email} />
      </div>
    </header>
  );
}
