import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getEnquiry, listEnquiries } from "@/lib/enquiries/repository";
import { enquiryListQuerySchema } from "@/lib/validation/enquiry";
import { editorialSerif } from "@/lib/fonts";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import EnquiriesWorkspace from "@/components/admin/enquiries/EnquiriesWorkspace";

export const metadata: Metadata = { title: "Enquiries" };

/**
 * /admin/enquiries — real enquiries from MongoDB. The first page (and the first record's
 * details) render on the server; filters, pagination, status changes and deletes then go
 * through /api/admin/enquiries.
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

  const initial = await listEnquiries(enquiryListQuerySchema.parse({}), now.getTime());
  const first = initial.items[0];
  const initialDetail = first ? await getEnquiry(first.id).catch(() => null) : null;

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
        newEnquiries={initial.statusCounts.NEW}
        showDemoBadge={false}
      />
      <div className="mt-8 lg:mt-10">
        <EnquiriesWorkspace initial={initial} initialDetail={initialDetail} serifClassName={editorialSerif.className} />
      </div>
    </main>
  );
}
