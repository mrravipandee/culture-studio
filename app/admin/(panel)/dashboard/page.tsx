import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { analytics, blogs, caseStudies, DEMO_DATA_END, enquiries, subscribers } from "@/lib/admin/data";
import {
  formatDate,
  getActiveSubscriberCount,
  getDraftBlogs,
  getEnquiriesByService,
  getEnquiryPeriodChange,
  getEnquirySeries,
  getNewEnquiries,
  getPublishedBlogs,
  getPublishedCaseStudies,
  getRecentBlogs,
  getRecentEnquiries,
  getTotalEnquiries,
  getSubscriberRecordCount,
} from "@/lib/admin/dashboard-utils";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import EnquiriesChart from "@/components/admin/dashboard/EnquiriesChart";
import ServiceBreakdown from "@/components/admin/dashboard/ServiceBreakdown";
import RecentEnquiries from "@/components/admin/dashboard/RecentEnquiries";
import RecentBlogs from "@/components/admin/dashboard/RecentBlogs";

export const metadata: Metadata = { title: "Admin Dashboard" };

/**
 * Admin Dashboard home. All figures are computed on the server from the demo dataset
 * (lib/admin/data.ts) through lib/admin/dashboard-utils.ts; nothing is hard-coded in the
 * components. The session is verified here, in addition to proxy.ts.
 */
export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const { email } = await requireAdmin();

  const now = new Date();
  const today = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" }).format(now);
  const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);

  const series = analytics.enquiriesByDay;
  const total = getTotalEnquiries(enquiries);
  const newCount = getNewEnquiries(enquiries);

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <DashboardHeader email={email} today={today} todayIso={todayIso} newEnquiries={newCount} />

      <div className="mt-8 space-y-5 lg:mt-10 lg:space-y-6">
        <DashboardStats
          data={{
            totalEnquiries: total,
            totalChange: getEnquiryPeriodChange(series, 30),
            newEnquiries: newCount,
            publishedCaseStudies: getPublishedCaseStudies(caseStudies),
            totalCaseStudies: caseStudies.length,
            publishedBlogs: getPublishedBlogs(blogs),
            draftBlogs: getDraftBlogs(blogs),
            subscribers: getSubscriberRecordCount(subscribers),
            activeSubscribers: getActiveSubscriberCount(subscribers),
          }}
        />

        <div className="grid grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <EnquiriesChart series={getEnquirySeries(series, 90)} dataEndLabel={formatDate(`${DEMO_DATA_END}T12:00:00+05:30`)} />
          <ServiceBreakdown shares={getEnquiriesByService(enquiries)} total={total} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <RecentEnquiries items={getRecentEnquiries(enquiries, 5)} />
          <RecentBlogs items={getRecentBlogs(blogs, 3)} />
        </div>

        <p className="pt-2 text-center text-xs text-ink-3">
          Preview with demo data: enquiries, subscribers and charts are fictional and are not connected to a live backend.
        </p>
      </div>
    </main>
  );
}
