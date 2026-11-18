import Image from "next/image";
import { ClipReveal, Reveal, RevealGroup, RevealItem } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { editorialSerif } from "@/lib/fonts";
import { aboutHero } from "@/lib/content/about";
import { H1, LEAD, BODY, META } from "@/components/editorial/type";

/**
 * 01 — About hero. Warm ivory, two editorial columns: copy on the left (eyebrow, H1, lead,
 * the four disciplines), one composed photograph on the right. Stacks on tablet/mobile
 * with the image after the copy.
 */
export default function AboutHero() {
  const { eyebrow, strapline, motto, headline, lead, disciplines, image } = aboutHero;

  return (
    <section aria-labelledby="about-title" className="bg-[var(--cream)] pt-32 pb-[var(--section-space)] sm:pt-40 lg:pt-44">
      <Container>
        {/* Meta bar: same bracketed-label convention as the Services page */}
        <Reveal distance={10} className="flex flex-col gap-3 border-b border-black/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow text-black">[ {eyebrow} ]</p>
          <p className={`${META} flex flex-col gap-1 min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center min-[480px]:gap-x-3`}>
            <span>{strapline}</span>
            <span aria-hidden="true" className="hidden text-black/25 min-[480px]:inline">
              /
            </span>
            <span className="text-burgundy">{motto}</span>
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-10 xl:gap-16">
          {/* Copy */}
          <div className="lg:col-span-7">
            <Reveal distance={20}>
              <h1 id="about-title" className={`${editorialSerif.className} ${H1} max-w-[17ch] text-black`}>
                {headline[0]} <span className="text-burgundy">{headline[1]}</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12} distance={16} className="mt-8 max-w-[58ch] space-y-5 lg:mt-10">
              <p className={LEAD}>{lead[0]}</p>
              <p className={BODY}>{lead[1]}</p>
            </Reveal>

            <RevealGroup as="ul" delay={0.2} count={4} aria-label="Disciplines" className="mt-10 grid max-w-[40rem] grid-cols-1 border-t border-black/10 sm:grid-cols-2 lg:mt-12">
              {disciplines.map((name, i) => (
                <RevealItem
                  as="li"
                  key={name}
                  className={`flex items-baseline gap-4 border-b border-black/10 py-4 sm:py-5 ${i % 2 === 0 ? "sm:pr-6" : "sm:border-l sm:pl-6"}`}
                >
                  <span className="eyebrow shrink-0 text-burgundy">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[0.9375rem] font-medium leading-snug text-black">{name}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          {/* Photograph */}
          <div className="lg:col-span-5">
            <ClipReveal className="w-full">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--subtle)] sm:aspect-[16/10] lg:aspect-[4/5]">
                <Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </div>
            </ClipReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
