import Image from "next/image";
import { blogHero } from "@/lib/content/blog";
import { editorialSerif } from "@/lib/fonts";
import Container from "@/components/home/shared/Container";
import { ClipReveal, Reveal } from "@/components/motion";

/** Blog hero: eyebrow, serif title with italic accent, description, angled image bleeding right. */
export default function BlogHero() {
  return (
    <section aria-labelledby="blog-hero-title" className="relative overflow-hidden pt-28 pb-10 sm:pt-32 lg:pt-36 lg:pb-12">
      <Container>
        <div className="relative lg:min-h-[19rem] lg:w-[52%] lg:pt-2">
          <Reveal as="p" distance={12} className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.22em] text-burgundy">
            {blogHero.eyebrow}
            <span aria-hidden="true" className="h-px w-12 bg-burgundy/60" />
          </Reveal>

          <h1
            id="blog-hero-title"
            className={`${editorialSerif.className} mt-5 text-[2.875rem] font-medium leading-[1.02] tracking-[-0.02em] text-[#240c0e] sm:text-6xl lg:text-[4.25rem] xl:text-[4.75rem]`}
          >
            <Reveal as="span" delay={0.08} distance={20} className="block">
              {blogHero.title}
            </Reveal>
            <Reveal as="span" delay={0.18} distance={20} className="block">
              <em className="italic text-burgundy">{blogHero.accent}</em>
            </Reveal>
          </h1>

          <Reveal as="p" delay={0.28} distance={14} className="mt-6 max-w-md text-base leading-relaxed text-ink-2 sm:text-[1.0625rem]">
            {blogHero.description}
          </Reveal>
        </div>
      </Container>

      {/* Editorial image (decorative): bleeds to the right edge on desktop with an angled cut. */}
      <div className="mt-10 px-[var(--gutter)] lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:w-[45%] lg:px-0 lg:pt-24 lg:pb-12">
        <div className="cs-hero-cut relative h-full">
          <ClipReveal from="right" scale={1.06} className="h-full">
            <div className="relative aspect-[2/1] h-full w-full overflow-hidden bg-burgundy sm:aspect-[16/7] lg:aspect-auto">
              <Image src={blogHero.image.src} alt={blogHero.image.alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </ClipReveal>
        </div>
      </div>
    </section>
  );
}
