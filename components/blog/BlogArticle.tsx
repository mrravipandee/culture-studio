import Image from "next/image";
import { editorialSerif } from "@/lib/fonts";
import type { RichNode } from "@/lib/rich-text";
import RichText from "./RichText";

export interface BlogArticleView {
  title: string;
  category: string;
  excerpt: string;
  author: string;
  /** Formatted publish (or, in preview, last updated) date. */
  dateLabel: string;
  dateIso: string | null;
  readingTime: string;
  coverImage: string | null;
  coverImageAlt: string;
  coverCaption: string;
  content: RichNode;
}

/**
 * Article layout shared by the public page (/blog/[slug]) and the admin preview, so the
 * preview always matches what visitors will see. Hook-free (works in server and client trees).
 */
export default function BlogArticle({ article, allowBlobImages = false }: { article: BlogArticleView; allowBlobImages?: boolean }) {
  const blobCover = article.coverImage?.startsWith("blob:") ?? false;

  return (
    <article className="mx-auto w-full max-w-3xl">
      <header>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.2em] text-burgundy">
          {article.category}
        </p>
        <h1 className={`${editorialSerif.className} mt-4 text-[2.5rem] font-medium leading-[1.06] tracking-[-0.015em] text-[#1a0a0c] sm:text-5xl lg:text-[3.5rem]`}>
          {article.title}
        </h1>
        {article.excerpt && <p className="mt-5 text-lg leading-relaxed text-ink-2 sm:text-xl">{article.excerpt}</p>}
        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
          <span aria-hidden="true" className={`${editorialSerif.className} grid size-7 place-items-center rounded-full bg-[#4a121a] text-sm text-white`}>
            {article.author.charAt(0)}
          </span>
          <span className="text-ink">{article.author}</span>
          <span aria-hidden="true" className="text-ink-4">·</span>
          {article.dateIso ? <time dateTime={article.dateIso}>{article.dateLabel}</time> : <span>{article.dateLabel}</span>}
          <span aria-hidden="true" className="text-ink-4">·</span>
          <span>{article.readingTime}</span>
        </p>
      </header>

      {article.coverImage && (
        <figure className="mt-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[#3a0f15]">
            {blobCover ? (
              // Local admin preview (not uploaded): plain <img>, the optimiser cannot read blob: URLs.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={article.coverImage} alt={article.coverImageAlt} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <Image src={article.coverImage} alt={article.coverImageAlt} fill priority sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
            )}
          </div>
          {article.coverCaption && <figcaption className="mt-2.5 text-center text-[0.8125rem] text-ink-3">{article.coverCaption}</figcaption>}
        </figure>
      )}

      <div className="mt-10 sm:mt-12">
        <RichText doc={article.content} allowBlobImages={allowBlobImages} />
      </div>
    </article>
  );
}
