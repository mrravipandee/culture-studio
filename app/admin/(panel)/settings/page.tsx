import type { Metadata } from "next";
import { Suspense } from "react";
import { countNewEnquiries } from "@/lib/enquiries/repository";
import { requireAdmin, getAuthenticatedAdmin } from "@/lib/auth/require-admin";
import { toProfileData } from "@/lib/auth/admin-store";
import { editorialSerif } from "@/lib/fonts";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import SettingsWorkspace from "@/components/admin/settings/SettingsWorkspace";

export const metadata: Metadata = { title: "Settings" };

/**
 * /admin/settings — the signed-in admin's profile, password and login activity.
 * Real data: the profile is read from MongoDB here; changes go through
 * /api/admin/settings/* (session-checked, validated server-side).
 */
export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const { email, name } = await requireAdmin();
  const auth = await getAuthenticatedAdmin(); // cached for this request: no second query
  if (!auth) return null; // unreachable: requireAdmin redirects first
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" }).format(now);
  const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <DashboardHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your account and security preferences."
        name={name}
        email={email}
        today={today}
        todayIso={todayIso}
        newEnquiries={await countNewEnquiries()}
        showDemoBadge={false}
      />
      <div className="mt-8 lg:mt-10">
        <SettingsWorkspace initialProfile={toProfileData(auth.admin)} serifClassName={editorialSerif.className} />
      </div>
    </main>
  );
}
