import type { Metadata } from "next";
import { Suspense } from "react";
import { countNewEnquiries } from "@/lib/enquiries/repository";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listSubscribers } from "@/lib/subscribers/repository";
import { editorialSerif } from "@/lib/fonts";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import SubscribersWorkspace from "@/components/admin/subscribers/SubscribersWorkspace";

export const metadata: Metadata = { title: "Subscribers" };

/**
 * /admin/subscribers — newsletter subscribers from MongoDB (collection: subscribers), one
 * record per email. Sign-ups come from the blog newsletter form (POST /api/subscribers).
 * No email delivery or mailing-list integration.
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
  const [{ items, truncated }, newEnquiries] = await Promise.all([listSubscribers(), countNewEnquiries()]);

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
        newEnquiries={newEnquiries}
      />
      <div className="mt-8 lg:mt-10">
        <SubscribersWorkspace initial={items} serifClassName={editorialSerif.className} />
      </div>
      <p className="mt-6 text-center text-xs text-ink-3">
        {truncated ? "Showing the 10,000 most recent subscribers. " : ""}Subscribers are saved in the database, one per email address. No emails are sent and no mailing list is connected.
      </p>
    </main>
  );
}
