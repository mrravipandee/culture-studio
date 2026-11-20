import BlogStoreProvider from "@/components/admin/blogs/BlogStore";

/**
 * Shared list state for /admin/blogs, /admin/blogs/new and /admin/blogs/[id]/edit, loaded from
 * MongoDB through /api/admin/blogs. Each page verifies the admin session itself (requireAdmin)
 * in addition to proxy.ts.
 */
export default function AdminBlogsLayout({ children }: { children: React.ReactNode }) {
  return <BlogStoreProvider>{children}</BlogStoreProvider>;
}
