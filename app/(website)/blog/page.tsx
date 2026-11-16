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
import { blogArticles, blogNewsletter, blogTopics, blogTotals, featuredArticle } from "@/lib/content/blog";

/**
 * Blog listing — UI preview with sample content (lib/content/blog.ts).
 * noindex and not in the sitemap until real articles are published.
 */
export const metadata: Metadata = pageMetadata({
  title: "Blog",
  path: "/blog",
  description: "Ideas, insights and stories at the intersection of brand, marketing, content and culture.",
  noindex: true,
});

export default function BlogPage() {
  const items = blogArticles.map((article, i) => ({
    key: article.slug,
    topic: article.topic,
    card: <BlogCard article={article} priority={i < 3} />,
  }));

  return (
    <div className="relative min-h-screen bg-[var(--cream)] selection:bg-burgundy selection:text-white">
      <Navbar />

      <main className="relative z-0">
        <BlogHero />
        <FeaturedArticle article={featuredArticle} />

        <Container className="pb-16 md:pb-20">
          <Reveal distance={16}>
            <BlogExplorer
              topics={blogTopics}
              totalPosts={blogTotals.posts}
              totalPages={blogTotals.pages}
              items={items}
              headingClassName={editorialSerif.className}
            />
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
