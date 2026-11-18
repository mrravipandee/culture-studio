import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { blogs, caseStudies, subscribers } from "@/lib/admin/data";
import { getEnquiryDashboard } from "@/lib/enquiries/repository";
import {
  formatDate,
  getActiveSubscriberCount,
  getDraftBlogs,
  getEnquiryPeriodChange,
  getEnquirySeries,
  getPublishedBlogs,
  getPublishedCaseStudies,
  getRecentBlogs,
  getSubscriberRecordCount,
  toServiceShares,
} from "@/lib/admin/dashboard-utils";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import EnquiriesChart from "@/components/admin/dashboard/EnquiriesChart";
import ServiceBreakdown from "@/components/admin/dashboard/ServiceBreakdown";
import RecentEnquiries from "@/components/admin/dashboard/RecentEnquiries";
import RecentBlogs from "@/components/admin/dashboard/RecentBlogs";

export const metadata: Metadata = { title: "Admin Dashboard" };

/**
 * Admin Dashboard home. Enquiry figures come from MongoDB (one aggregation in
 * lib/enquiries/repository.ts: totals, NEW count, per-service selections, 90 India-time
 * days, 5 most recent; soft-deleted records excluded). Blog, case-study and subscriber
 * figures still come from lib/admin/data.ts until those modules get their backends.
 * The session is verified here, in addition to proxy.ts.
 */
export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const { email, name } = await requireAdmin();

  const now = new Date();
  const today = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" }).format(now);
  const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);

  const enquiries = await getEnquiryDashboard(now.getTime(), 90);
  const shares = toServiceShares(enquiries.serviceCounts);
  const selections = shares.reduce((n, s) => n + s.count, 0);

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <DashboardHeader name={name} email={email} today={today} todayIso={todayIso} newEnquiries={enquiries.newCount} />

      <div className="mt-8 space-y-5 lg:mt-10 lg:space-y-6">
        <DashboardStats
          data={{
            totalEnquiries: enquiries.total,
            totalChange: getEnquiryPeriodChange(enquiries.daily, 30),
            newEnquiries: enquiries.newCount,
            publishedCaseStudies: getPublishedCaseStudies(caseStudies),
            totalCaseStudies: caseStudies.length,
            publishedBlogs: getPublishedBlogs(blogs),
            draftBlogs: getDraftBlogs(blogs),
            subscribers: getSubscriberRecordCount(subscribers),
            activeSubscribers: getActiveSubscriberCount(subscribers),
          }}
        />

        <div className="grid grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <EnquiriesChart series={getEnquirySeries(enquiries.daily, 90)} dataEndLabel={formatDate(`${todayIso}T12:00:00+05:30`)} />
          <ServiceBreakdown shares={shares} total={selections} enquiries={enquiries.total} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <RecentEnquiries items={enquiries.recent} />
          <RecentBlogs items={getRecentBlogs(blogs, 3)} />
        </div>

        <p className="pt-2 text-center text-xs text-ink-3">
          Enquiry figures are live from the database. Subscriber figures are still preview data until the Subscribers backend is connected.
        </p>
      </div>
    </main>
  );
}
