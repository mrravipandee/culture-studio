import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { blogImageLibrary } from "@/lib/admin/data";
import { isCloudinaryConfigured } from "@/lib/media/cloudinary";
import { PRODUCTION_URL } from "@/lib/site";
import { editorialSerif } from "@/lib/fonts";
import BlogEditorWorkspace from "@/components/admin/blogs/BlogEditorWorkspace";

export const metadata: Metadata = { title: "Edit Article" };

/** The article is loaded by id from /api/admin/blogs/[id] in the editor (always the latest version). */
export default function EditBlogPage({ params, searchParams }: PageProps<"/admin/blogs/[id]/edit">) {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
      <EditBlog params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditBlog({ params, searchParams }: Pick<PageProps<"/admin/blogs/[id]/edit">, "params" | "searchParams">) {
  await requireAdmin();
  const { id } = await params;
  const { preview } = await searchParams;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  return (
    <BlogEditorWorkspace
      mode="edit"
      postId={decodeURIComponent(id)}
      siteUrl={PRODUCTION_URL}
      today={today}
      library={blogImageLibrary}
      uploadsEnabled={isCloudinaryConfigured()}
      serifClassName={editorialSerif.className}
      startInPreview={preview === "1"}
    />
  );
}
