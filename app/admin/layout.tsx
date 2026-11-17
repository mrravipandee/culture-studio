import type { Metadata } from "next";

/** Private admin area: never indexed, never cached by shared caches (see proxy.ts). */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[var(--cream)] text-ink">{children}</div>;
}
