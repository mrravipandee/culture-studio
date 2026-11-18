import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { enquiries } from "@/lib/admin/data";
import { getAllEnquiries, getNewEnquiries } from "@/lib/admin/enquiry-utils";
import { editorialSerif } from "@/lib/fonts";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import EnquiriesWorkspace from "@/components/admin/enquiries/EnquiriesWorkspace";

export const metadata: Metadata = { title: "Enquiries" };

/**
 * /admin/enquiries — manage enquiries (DEMO DATA from lib/admin/data.ts).
 * Changes made on this page live only in the browser tab and reset on reload.
 */
export default function AdminEnquiriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
      <Enquiries />
    </Suspense>
  );
}

async function Enquiries() {
  const { email, name } = await requireAdmin();
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" }).format(now);
  const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
  const all = getAllEnquiries(enquiries);

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <DashboardHeader
        eyebrow="Enquiries"
        title="Enquiries"
        description="Manage and respond to project enquiries."
        name={name}
        email={email}
        today={today}
        todayIso={todayIso}
        newEnquiries={getNewEnquiries(all)}
      />
      <div className="mt-8 lg:mt-10">
        <EnquiriesWorkspace initial={all} serifClassName={editorialSerif.className} />
      </div>
      <p className="mt-6 text-center text-xs text-ink-3">
        Preview with demo data: these enquiries are fictional. Status changes and deletions are not saved and no emails are sent.
      </p>
    </main>
  );
}
