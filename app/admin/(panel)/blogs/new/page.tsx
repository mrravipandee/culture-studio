import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { blogImageLibrary } from "@/lib/admin/data";
import { isCloudinaryConfigured } from "@/lib/media/cloudinary";
import { PRODUCTION_URL } from "@/lib/site";
import { editorialSerif } from "@/lib/fonts";
import BlogEditorWorkspace from "@/components/admin/blogs/BlogEditorWorkspace";

export const metadata: Metadata = { title: "New Article" };

export default function NewBlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
      <NewBlog />
    </Suspense>
  );
}

async function NewBlog() {
  await requireAdmin();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  return <BlogEditorWorkspace mode="create" siteUrl={PRODUCTION_URL} today={today} library={blogImageLibrary} uploadsEnabled={isCloudinaryConfigured()} serifClassName={editorialSerif.className} />;
}
