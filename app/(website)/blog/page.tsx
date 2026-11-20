import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import Container from "@/components/home/shared/Container";
import { Reveal } from "@/components/motion";
import BlogHero from "@/components/blog/BlogHero";
import FeaturedArticle from "@/components/blog/FeaturedArticle";
import BlogCard from "@/components/blog/BlogCard";
import BlogExplorer from "@/components/blog/BlogExplorer";
import NewsletterCta from "@/components/blog/NewsletterCta";
import { editorialSerif } from "@/lib/fonts";
import { BLOG_COPY_IN_REVIEW, blogNewsletter, topicCounts } from "@/lib/content/blog";
import { BLOG_PUBLIC_PAGE_SIZE } from "@/lib/blog/constants";
import { getPublishedArticles } from "@/lib/blog/public";

/**
 * Blog listing: PUBLISHED articles from MongoDB (lib/blog/public.ts, cached and invalidated on
 * every publishing change). The newest is featured; the rest fill the topic grid.
 * noindex while the launch copy is in review (BLOG_COPY_IN_REVIEW).
 */
export const metadata: Metadata = pageMetadata({
  title: "Blog",
  path: "/blog",
  description: "Ideas, insights and stories at the intersection of brand, marketing, content and culture.",
  noindex: BLOG_COPY_IN_REVIEW,
});

export default async function BlogPage() {
  const [featured, ...rest] = await getPublishedArticles();
  const items = rest.map((article, i) => ({
    key: article.slug,
    topic: article.topic,
    card: <BlogCard article={article} priority={i < 3} />,
  }));

  return (
    <div className="relative min-h-screen bg-[var(--cream)] selection:bg-burgundy selection:text-white">
      <Navbar />

      <main className="relative z-0">
        <BlogHero />
        {featured && <FeaturedArticle article={featured} />}

        <Container className="pb-16 md:pb-20">
          <Reveal distance={16}>
            <BlogExplorer topics={topicCounts(rest)} items={items} pageSize={BLOG_PUBLIC_PAGE_SIZE} headingClassName={editorialSerif.className} />
          </Reveal>
        </Container>

        <section aria-label="Newsletter" className="pb-20 md:pb-24">
          <Container>
            <Reveal distance={20}>
              <NewsletterCta {...blogNewsletter} headingClassName={editorialSerif.className} />
            </Reveal>
          </Container>
        </section>
      </main>
    </div>
  );
}
