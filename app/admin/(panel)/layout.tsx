import AdminShell from "@/components/admin/AdminShell";
import { AdminProfileProvider } from "@/components/admin/AdminProfileContext";
import { AdminLogoutProvider } from "@/components/admin/AdminLogout";
import { AdminCountsProvider } from "@/components/admin/AdminCountsContext";

/**
 * Signed-in admin area: sidebar + content. /admin/login sits outside this group, so it
 * never shows the sidebar. Access is enforced by proxy.ts and by each page's requireAdmin().
 * The Enquiries badge shows the MongoDB count of NEW enquiries: each page reports it into
 * AdminCountsContext (the layout itself renders outside the pages' Suspense boundaries).
 */
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProfileProvider>
      <AdminLogoutProvider>
        <AdminCountsProvider>
          <AdminShell>{children}</AdminShell>
        </AdminCountsProvider>
      </AdminLogoutProvider>
    </AdminProfileProvider>
  );
}
