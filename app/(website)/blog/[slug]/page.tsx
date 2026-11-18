import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import Container from "@/components/home/shared/Container";
import BlogArticle from "@/components/blog/BlogArticle";
import ReadingMode from "@/components/blog/ReadingMode";
import { BLOG_COPY_IN_REVIEW, articleReadingTime, blogAuthor, blogTopics, formatBlogDate, publicBlogArticles } from "@/lib/content/blog";
import { countWords, headingOutline, readingMinutes, readingTimeLabel } from "@/lib/rich-text";
import { editorialSerif } from "@/lib/fonts";

/**
 * /blog/<slug> — published articles only (on lib/content/blog-publishing.ts AND with a body),
 * shown in reading mode (components/blog/ReadingMode.tsx).
 * Drafts and unknown slugs get a real HTTP 404 from proxy.ts before this page renders; the
 * checks below are a second line of defence.
 */
export async function generateStaticParams() {
  // cacheComponents needs at least one param; a non-article slug renders the 404.
  return publicBlogArticles.length > 0 ? publicBlogArticles.map((a) => ({ slug: a.slug })) : [{ slug: "unpublished" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = publicBlogArticles.find((a) => a.slug === slug);
  if (!article) notFound();
  return pageMetadata({
    title: article.title,
    path: `/blog/${article.slug}`,
    description: article.description,
    type: "article",
    noindex: BLOG_COPY_IN_REVIEW, // copy awaiting review: readable, not indexed
  });
}

export default function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="relative min-h-screen bg-[var(--cream)]">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
        <ArticleBody params={params} />
      </Suspense>
    </div>
  );
}

async function ArticleBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = publicBlogArticles.findIndex((a) => a.slug === slug);
  const article = publicBlogArticles[index];
  if (!article || !article.content) notFound();

  const words = countWords(article.content);
  const headings = headingOutline(article.content);
  // Up next: the following published article (wraps around), never the same one.
  const next = publicBlogArticles.length > 1 ? publicBlogArticles[(index + 1) % publicBlogArticles.length] : null;
  const topicLabel = (id: string) => blogTopics.find((t) => t.id === id)?.label ?? "";

  return (
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
              category: topicLabel(article.topic),
              excerpt: article.description,
              author: blogAuthor.name,
              dateLabel: formatBlogDate(article.date),
              dateIso: article.date,
              readingTime: readingTimeLabel(words),
              coverImage: article.image.src,
              coverImageAlt: article.image.alt,
              coverCaption: "",
              content: article.content,
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
                <p className="text-xs text-burgundy">{topicLabel(next.topic)}</p>
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
  );
}
