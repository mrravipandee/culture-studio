import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { enquiries, subscribers } from "@/lib/admin/data";
import { getNewEnquiries } from "@/lib/admin/enquiry-utils";
import { getAllSubscribers } from "@/lib/admin/subscriber-utils";
import { editorialSerif } from "@/lib/fonts";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import SubscribersWorkspace from "@/components/admin/subscribers/SubscribersWorkspace";

export const metadata: Metadata = { title: "Subscribers" };

/**
 * /admin/subscribers — newsletter subscribers (DEMO DATA from lib/admin/data.ts).
 * Changes live only in the browser tab. No backend, email delivery or mailing-list integration.
 */
export default function AdminSubscribersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
      <Subscribers />
    </Suspense>
  );
}

async function Subscribers() {
  const { email, name } = await requireAdmin();
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" }).format(now);
  const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <DashboardHeader
        eyebrow="Subscribe emails"
        title="Subscribers"
        description="Manage your newsletter subscribers and grow your audience."
        name={name}
        email={email}
        today={today}
        todayIso={todayIso}
        newEnquiries={getNewEnquiries(enquiries)}
      />
      <div className="mt-8 lg:mt-10">
        <SubscribersWorkspace initial={getAllSubscribers(subscribers)} serifClassName={editorialSerif.className} />
      </div>
      <p className="mt-6 text-center text-xs text-ink-3">
        Preview with demo data: these subscribers are fictional (reserved example domains). Changes are not saved, no emails are sent and no mailing list is connected.
      </p>
    </main>
  );
}
