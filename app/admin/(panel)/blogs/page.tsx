import type { Metadata } from "next";
import { Suspense } from "react";
import { countNewEnquiries } from "@/lib/enquiries/repository";
import { requireAdmin } from "@/lib/auth/require-admin";
import { editorialSerif } from "@/lib/fonts";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import BlogListWorkspace from "@/components/admin/blogs/BlogListWorkspace";

export const metadata: Metadata = { title: "Blog" };

/** /admin/blogs — articles (state from the blogs layout store; local preview only). */
export default function AdminBlogsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
      <Blogs />
    </Suspense>
  );
}

async function Blogs() {
  const { email, name } = await requireAdmin();
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" }).format(now);
  const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <DashboardHeader
        eyebrow="Blog"
        title="Blog"
        description="Create, manage and publish articles for CULT.URE."
        name={name}
        email={email}
        today={today}
        todayIso={todayIso}
        newEnquiries={await countNewEnquiries()}
      />
      <div className="mt-8 lg:mt-10">
        <BlogListWorkspace serifClassName={editorialSerif.className} />
      </div>
    </main>
  );
}
