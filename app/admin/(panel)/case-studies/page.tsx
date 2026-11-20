import type { Metadata } from "next";
import { Suspense } from "react";
import { countNewEnquiries } from "@/lib/enquiries/repository";
import { requireAdmin } from "@/lib/auth/require-admin";
import { editorialSerif } from "@/lib/fonts";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import CaseStudiesWorkspace from "@/components/admin/case-studies/CaseStudiesWorkspace";
import { isCloudinaryConfigured } from "@/lib/media/cloudinary";

export const metadata: Metadata = { title: "Case Studies" };

/**
 * /admin/case-studies — the Case Studies CMS. Records live in MongoDB and are loaded by the
 * workspace from /api/admin/case-studies (create, edit, publish, unpublish, archive, delete,
 * restore). Published records are what the public website shows.
 */
export default function AdminCaseStudiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
      <CaseStudies />
    </Suspense>
  );
}

async function CaseStudies() {
  const { email, name } = await requireAdmin();
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" }).format(now);
  const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <DashboardHeader
        eyebrow="Case studies"
        title="Case Studies"
        description="Manage your projects, case studies and success stories."
        name={name}
        email={email}
        today={today}
        todayIso={todayIso}
        newEnquiries={await countNewEnquiries()}
        showDemoBadge={false}
      />
      <div className="mt-8 lg:mt-10">
        <CaseStudiesWorkspace serifClassName={editorialSerif.className} uploadsEnabled={isCloudinaryConfigured()} />
      </div>
    </main>
  );
}
