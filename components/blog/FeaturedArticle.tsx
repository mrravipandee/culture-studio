import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { articleReadingTime, isBlogArticlePublic, type BlogArticle } from "@/lib/content/blog";
import { editorialSerif } from "@/lib/fonts";
import Container from "@/components/home/shared/Container";
import { ClipReveal, Reveal } from "@/components/motion";
import BlogMeta from "./BlogMeta";

/**
 * Featured article. When published, the title links to the reading view and the link is
 * stretched over the whole block (image included).
 */
export default function FeaturedArticle({ article }: { article: BlogArticle }) {
  const href = isBlogArticlePublic(article.slug) ? `/blog/${article.slug}` : null;
  const cover = (
    <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-burgundy md:aspect-[2.2/1]">
      <Image
        src={article.image.src}
        alt={article.image.alt}
        fill
        sizes="(min-width: 768px) 46vw, 100vw"
        style={article.image.position ? { objectPosition: article.image.position } : undefined}
        className="object-cover transition-transform duration-1100 ease-editorial group-hover:scale-[1.03]"
      />
    </div>
  );
  return (
    <section aria-labelledby="blog-featured-title" className="pb-8">
      <Container>
        <article className="group relative grid grid-cols-1 items-center gap-8 border-t border-black/10 pt-8 md:grid-cols-12 md:gap-10 lg:pt-7">
          <div className="md:col-span-6">
            <ClipReveal className="rounded-xl">
              {href ? (
                // Second click target for the image (the reveal transform stops the title's
                // stretched link from reaching it). Hidden from AT and tab order: the title is the link.
                <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
                  {cover}
                </Link>
              ) : (
                cover
              )}
            </ClipReveal>
          </div>

          <Reveal className="md:col-span-6 md:pl-2" distance={16}>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-burgundy">Featured</p>
            <h2
              id="blog-featured-title"
              className={`${editorialSerif.className} mt-4 text-[1.875rem] font-normal leading-[1.1] tracking-[-0.01em] text-[#240c0e] sm:text-4xl lg:text-[2.625rem]`}
            >
              {href ? (
                <Link
                  href={href}
                  className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline focus-visible:decoration-1 focus-visible:underline-offset-4"
                >
                  {article.title}
                </Link>
              ) : (
                article.title
              )}
            </h2>
            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-2">{article.description}</p>
            <div className="mt-6 flex items-center justify-between gap-4">
              <BlogMeta date={article.date} readingTime={articleReadingTime(article)} />
              <ArrowUpRight
                aria-hidden="true"
                size={20}
                strokeWidth={1.5}
                className="shrink-0 text-ink transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          </Reveal>
        </article>
      </Container>
    </section>
  );
}
