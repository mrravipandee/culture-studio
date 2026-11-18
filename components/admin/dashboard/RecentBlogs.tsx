import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { editorialSerif } from "@/lib/fonts";
import type { AdminBlog } from "@/lib/admin/data";
import { formatDate } from "@/lib/admin/dashboard-utils";

export default function RecentBlogs({ items }: { items: AdminBlog[] }) {
  return (
    <section
      aria-labelledby="recent-blogs-title"
      className="admin-fade-up flex h-full flex-col rounded-xl border border-black/[0.08] bg-white/80 p-5 sm:p-6 [animation-delay:620ms]"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="recent-blogs-title" className={`${editorialSerif.className} text-2xl text-[#1a0a0c]`}>
          Recent Blogs
        </h2>
        <Link href="/admin/blogs" className="group inline-flex items-center gap-1.5 text-sm font-medium text-burgundy hover:underline focus-visible:outline-2 focus-visible:outline-burgundy">
          View All
          <ArrowRight aria-hidden="true" size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-black/15 py-10 text-center text-sm text-ink-2">No blog posts yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-black/[0.06]">
          {items.map((blog) => {
            const published = blog.status === "PUBLISHED" && blog.publishedAt;
            return (
              <li key={blog.id}>
                <Link
                  href="/admin/blogs"
                  className="group flex items-center gap-4 rounded-lg py-3.5 transition-colors hover:bg-black/[0.02] focus-visible:outline-2 focus-visible:outline-burgundy"
                >
                  <span className="relative block aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-md bg-subtle sm:w-32">
                    {blog.coverImage && <Image src={blog.coverImage} alt="" fill sizes="128px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-[#1a0a0c]">{blog.title}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-2">
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden="true" className={`size-1.5 rounded-full ${published ? "bg-[#2f9e5b]" : "bg-[#c08a2d]"}`} />
                        {published ? "Published" : "Draft"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {published ? "" : "Updated "}
                        <time dateTime={published ? blog.publishedAt ?? undefined : blog.updatedAt}>
                          {formatDate(published ? (blog.publishedAt as string) : blog.updatedAt)}
                        </time>
                      </span>
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    size={20}
                    strokeWidth={1.5}
                    className="shrink-0 text-ink transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
