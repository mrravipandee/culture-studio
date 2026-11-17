import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { editorialSerif } from "@/lib/fonts";
import LogoutButton from "@/components/admin/LogoutButton";

export const metadata: Metadata = { title: "Admin Dashboard" };

/**
 * Placeholder landing page after sign-in (dashboard features are out of scope).
 * The session is verified on the server here, in addition to proxy.ts.
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

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-burgundy">Admin</p>
      <h1 className={`${editorialSerif.className} mt-4 text-5xl font-medium text-[#1a0a0c]`}>Dashboard</h1>
      <p className="mt-4 text-ink-2">
        Signed in as <span className="text-ink">{email}</span>.
      </p>
      <div className="mt-10">
        <LogoutButton />
      </div>
    </main>
  );
}
