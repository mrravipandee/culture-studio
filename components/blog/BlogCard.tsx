import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { blogTopics, type BlogArticle } from "@/lib/content/blog";
import BlogMeta from "./BlogMeta";

/**
 * Article card (sample). Not a link yet: no article pages exist. When real posts are
 * added, wrap the title in a Link stretched over the card (see CaseStudyCard).
 */
export default function BlogCard({ article, priority = false }: { article: BlogArticle; priority?: boolean }) {
  const topic = blogTopics.find((t) => t.id === article.topic)?.label;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white/70">
      <div className="relative aspect-[16/7.2] overflow-hidden bg-subtle">
        <Image
          src={article.image.src}
          alt={article.image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 100vw"
          style={article.image.position ? { objectPosition: article.image.position } : undefined}
          className="object-cover transition-transform duration-1100 ease-editorial group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        {topic && (
          <span className="self-start rounded-full border border-burgundy/25 px-2 py-0.5 text-[0.6875rem] leading-tight text-burgundy">
            {topic}
          </span>
        )}
        <h3 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.01em] text-black">{article.title}</h3>
        <p className="mt-2 mb-5 text-sm leading-relaxed text-ink-2">{article.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <BlogMeta date={article.date} readingTime={article.readingTime} />
          <ArrowUpRight
            aria-hidden="true"
            size={18}
            strokeWidth={1.5}
            className="shrink-0 text-ink transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </article>
  );
}
