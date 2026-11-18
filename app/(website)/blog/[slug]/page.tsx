import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import Container from "@/components/home/shared/Container";
import BlogArticle from "@/components/blog/BlogArticle";
import { blogAuthor, blogTopics, formatBlogDate, publicBlogArticles } from "@/lib/content/blog";
import { countWords, readingTimeLabel } from "@/lib/rich-text";

/**
 * /blog/<slug> — published articles only (on lib/content/blog-publishing.ts AND with a body).
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
  return pageMetadata({ title: article.title, path: `/blog/${article.slug}`, description: article.description, type: "article" });
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
  const article = publicBlogArticles.find((a) => a.slug === slug);
  if (!article || !article.content) notFound();

  const words = countWords(article.content);
  return (
    <main className="pt-32 pb-20 sm:pt-36 md:pb-28">
      <JsonLd data={breadcrumbSchema([["Blog", "/blog"], [article.title, `/blog/${article.slug}`]])} />
      <Container>
        <Link href="/blog" className="mx-auto mb-10 flex max-w-3xl items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-2 hover:text-burgundy">
          <ArrowLeft aria-hidden="true" size={14} /> All articles
        </Link>
        <BlogArticle
          article={{
            title: article.title,
            category: blogTopics.find((t) => t.id === article.topic)?.label ?? "",
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
      </Container>
    </main>
  );
}
