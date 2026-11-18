import { blogs } from "@/lib/admin/data";
import BlogStoreProvider from "@/components/admin/blogs/BlogStore";

/**
 * Shared state for /admin/blogs, /admin/blogs/new and /admin/blogs/[id]/edit.
 * Seeded from lib/admin/data.ts (the Blog page articles); changes stay in this tab only.
 * Each page verifies the admin session itself (requireAdmin) in addition to proxy.ts.
 */
export default function AdminBlogsLayout({ children }: { children: React.ReactNode }) {
  return <BlogStoreProvider initial={blogs}>{children}</BlogStoreProvider>;
}
