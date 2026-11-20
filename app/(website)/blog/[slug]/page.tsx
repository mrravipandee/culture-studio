import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import Container from "@/components/home/shared/Container";
import BlogArticle from "@/components/blog/BlogArticle";
import ReadingMode from "@/components/blog/ReadingMode";
import { BLOG_COPY_IN_REVIEW, articleReadingTime, blogTopicLabel, formatBlogDate } from "@/lib/content/blog";
import { getArticlePage, getPublishedArticles } from "@/lib/blog/public";
import { countWords, headingOutline, readingMinutes, readingTimeLabel } from "@/lib/rich-text";
import { editorialSerif } from "@/lib/fonts";

/**
 * /blog/<slug> — PUBLISHED articles from MongoDB, in reading mode.
 * The whole page is static (prerendered, or generated on first request and cached), so
 * unknown / draft / deleted slugs get a real HTTP 404 and old slugs a real 308 before any HTML
 * is sent. Data: `'use cache'` reads (lib/blog/public.ts), invalidated on publishing changes.
 */
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const all = await getPublishedArticles();
  // Cache Components needs at least one param; the reserved slug renders the 404.
  return all.length > 0 ? all.map((a) => ({ slug: a.slug })) : [{ slug: "unpublished" }];
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticlePage(slug);
  if (result.kind === "redirect") permanentRedirect(`/blog/${result.slug}`);
  if (result.kind === "missing") notFound();
  const { article } = result;
  return pageMetadata({
    title: article.seo.title,
    path: `/blog/${article.slug}`,
    description: article.seo.description,
    type: "article",
    noindex: BLOG_COPY_IN_REVIEW, // launch copy awaiting review: readable, not indexed
    image: { url: article.image.src, alt: article.image.alt || article.title },
  });
}

export default async function BlogArticlePage({ params }: Params) {
  const { slug } = await params;
  const result = await getArticlePage(slug);
  if (result.kind === "redirect") permanentRedirect(`/blog/${result.slug}`);
  if (result.kind === "missing") notFound();

  const { article, next } = result;
  const content = article.content;
  if (!content) notFound();
  const words = countWords(content);
  const headings = headingOutline(content);

  return (
    <div className="relative min-h-screen bg-[var(--cream)]">
      <Navbar />
      <main className="pt-32 pb-28 sm:pt-36 md:pb-32">
        <JsonLd data={breadcrumbSchema([["Blog", "/blog"], [article.title, `/blog/${article.slug}`]])} />
        <Container>
          <Link
            href="/blog"
            className="mx-auto mb-10 flex max-w-3xl items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-2 transition-colors hover:text-burgundy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
          >
            <ArrowLeft aria-hidden="true" size={14} /> All articles
          </Link>

          <ReadingMode headings={headings} minutes={readingMinutes(words)} title={article.title}>
            <BlogArticle
              article={{
                title: article.title,
                category: blogTopicLabel(article.topic),
                excerpt: article.description,
                author: article.author,
                dateLabel: formatBlogDate(article.date),
                dateIso: article.date,
                readingTime: readingTimeLabel(words),
                coverImage: article.image.src,
                coverImageAlt: article.image.alt,
                coverCaption: article.caption,
                content,
              }}
            />

            <footer className="mx-auto mt-14 max-w-3xl border-t border-black/10 pt-8">
              <p className="text-sm text-ink-2">
                Thanks for reading. Have a question about your brand?{" "}
                <Link href="/contact" className="font-medium text-burgundy underline underline-offset-4 hover:decoration-2">
                  Start a conversation
                </Link>
                .
              </p>
            </footer>
          </ReadingMode>

          {next && (
            <section aria-labelledby="up-next-title" className="mx-auto mt-16 max-w-3xl">
              <h2 id="up-next-title" className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-burgundy">
                Up next
              </h2>
              <article className="group relative mt-4 grid grid-cols-1 overflow-hidden rounded-xl border border-black/10 bg-white/70 transition-shadow duration-300 hover:shadow-[0_18px_40px_-28px_rgba(36,12,14,0.45)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-burgundy sm:grid-cols-[14rem_minmax(0,1fr)]">
                <div className="relative aspect-[16/9] bg-subtle sm:aspect-auto">
                  <Image
                    src={next.image.src}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 14rem, 100vw"
                    style={next.image.position ? { objectPosition: next.image.position } : undefined}
                    className="object-cover transition-transform duration-1100 ease-editorial group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-col p-5 sm:p-6">
                  <p className="text-xs text-burgundy">{blogTopicLabel(next.topic)}</p>
                  <h3 className={`${editorialSerif.className} mt-2 text-2xl leading-tight text-[#1a0a0c]`}>
                    <Link href={`/blog/${next.slug}`} className="outline-none after:absolute after:inset-0 after:content-['']">
                      {next.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{next.description}</p>
                  <p className="mt-4 flex items-center justify-between text-xs text-ink-3">
                    <span>{articleReadingTime(next)}</span>
                    <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} className="text-ink transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </p>
                </div>
              </article>
            </section>
          )}
        </Container>
      </main>
    </div>
  );
}
