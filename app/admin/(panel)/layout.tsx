import AdminShell from "@/components/admin/AdminShell";
import { enquiries } from "@/lib/admin/data";
import { getNewEnquiries } from "@/lib/admin/enquiry-utils";

/**
 * Signed-in admin area: sidebar + content. /admin/login sits outside this group, so it
 * never shows the sidebar. Access is enforced by proxy.ts and by each page's requireAdmin().
 * The Enquiries badge counts NEW records in the (demo) dataset.
 */
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell badges={{ enquiries: getNewEnquiries(enquiries) }}>{children}</AdminShell>;
}
