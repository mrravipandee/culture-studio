import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { caseStudiesHero, caseStudyHighlights } from "@/lib/content/case-studies";
import Container from "@/components/home/shared/Container";
import { ClipReveal, Reveal, RevealGroup, RevealItem } from "@/components/motion";
import { editorialSerif } from "@/lib/fonts";

/** Deep burgundy-black used for the editorial headline and figures. */
const HEADLINE = "text-[#240c0e]";

/** Section 02 (hero) and 03 (performance highlights) of the Case Studies page. */
export default function CaseStudiesHero() {
  return (
    <>
      <section aria-labelledby="cs-hero-title" className="relative overflow-hidden pt-28 pb-10 sm:pt-32 lg:pt-36 lg:pb-14">
        <Container>
          <div className="relative lg:min-h-[27rem] lg:w-[58%] lg:pt-4">
            <Reveal as="p" distance={12} className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.22em] text-burgundy">
              {caseStudiesHero.eyebrow}
              <span aria-hidden="true" className="h-px w-12 bg-burgundy/60" />
            </Reveal>

            <h1
              id="cs-hero-title"
              className={`${editorialSerif.className} ${HEADLINE} mt-6 text-[2.875rem] font-medium leading-[1.02] tracking-[-0.02em] sm:text-6xl md:text-7xl lg:text-[4.75rem] xl:text-[5.5rem]`}
            >
              {caseStudiesHero.headline.map((line, i) => (
                <Reveal as="span" key={line.text} delay={0.08 + i * 0.1} distance={20} className="block sm:whitespace-nowrap">
                  {line.text}
                  {line.accent && (
                    <>
                      <em className="italic text-burgundy">{line.accent.replace(/\.$/, "")}</em>
                      {line.accent.endsWith(".") && "."}
                    </>
                  )}
                </Reveal>
              ))}
            </h1>

            <Reveal as="p" delay={0.3} distance={14} className="mt-6 max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg">
              {caseStudiesHero.description}
            </Reveal>
          </div>
        </Container>

        {/* Editorial image: bleeds to the right edge on desktop with an angled left edge (decorative). */}
        <div className="mt-10 px-[var(--gutter)] lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:w-[38%] lg:px-0 lg:pt-24 lg:pb-14 xl:w-[36%]">
          <div className="cs-hero-cut relative h-full">
            <ClipReveal from="right" scale={1.06} className="h-full">
              <div className="relative aspect-[16/10] h-full w-full overflow-hidden bg-burgundy lg:aspect-auto">
                <Image
                  src={caseStudiesHero.image.src}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover"
                />
              </div>
            </ClipReveal>
          </div>
        </div>
      </section>

      {/* Performance highlights: selected figures from individual projects (not averages). */}
      <section aria-labelledby="cs-highlights-title" className="pb-8 md:pb-10">
        <Container>
          <h2 id="cs-highlights-title" className="sr-only">
            Performance highlights: {caseStudyHighlights.note.toLowerCase()}
          </h2>
          <RevealGroup
            as="ul"
            count={caseStudyHighlights.items.length}
            className="grid grid-cols-2 gap-y-8 border-b border-black/10 pb-8 md:pb-10 lg:grid-cols-4 lg:gap-y-0"
          >
            {caseStudyHighlights.items.map((item, i) => (
              <RevealItem
                as="li"
                key={item.label}
                title={item.source ? `${item.label}: ${item.source}` : undefined}
                className={`min-w-0 px-2 sm:px-6 lg:px-8 ${i % 2 === 1 ? "border-l border-black/10" : ""} ${
                  i > 0 ? "lg:border-l lg:border-black/10" : ""
                }`}
              >
                <span
                  className={`${editorialSerif.className} ${HEADLINE} flex items-start gap-2 text-[2.5rem] font-medium leading-none tracking-[-0.01em] md:text-5xl`}
                >
                  {item.value}
                  {item.source && i < 3 && (
                    <ArrowUpRight aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-6 text-burgundy md:size-7" />
                  )}
                </span>
                <span className="mt-3 block text-sm leading-snug text-ink-2">{item.label}</span>
                {item.source && <span className="sr-only"> ({item.source})</span>}
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>
    </>
  );
}
