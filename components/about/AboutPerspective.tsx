import Link from "next/link";
import Container from "@/components/home/shared/Container";
import { aboutPerspective } from "@/lib/content/about";
import { RevealGroup, RevealItem, TextMask } from "@/components/motion";
import { Button } from "@/components/ui/site-button";

/** What CULT.URE Does: the four disciplines, each linking to its section on /services. */
export default function AboutPerspective() {
  const { eyebrow, title, pillars, cta } = aboutPerspective;

  return (
    <section className="py-24 sm:py-32 bg-white text-black border-b border-black/10">
      <Container>
        {/* Section Header */}
        <div className="border-b border-black/10 pb-8">
          <p className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
            [ {eyebrow} ]
          </p>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <TextMask as="h2" text={title} className="lg:col-span-8 text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1]" />
          </div>
        </div>

        {/* Four disciplines */}
        <RevealGroup count={pillars.length} className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          {pillars.map((pillar) => (
            <RevealItem
              as="article"
              key={pillar.number}
              className="group relative border border-black/10 bg-subtle p-8 sm:p-10 rounded-sm hover:border-black/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono tracking-eyebrow text-ink-3 pb-6 border-b border-black/10">
                  <span className="text-black font-semibold">DISCIPLINE {pillar.number}</span>
                  <span aria-hidden="true" className="btn-arrow text-burgundy">↗</span>
                </div>
                <h3 className="mt-6 text-2xl sm:text-3xl font-light text-black tracking-tight">
                  {/* The whole card is the link (stretched over the article). */}
                  <Link href={pillar.href} className="after:absolute after:inset-0 after:content-['']">
                    {pillar.title}
                  </Link>
                </h3>
                <p className="mt-6 text-sm sm:text-base font-light text-black/75 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-12 flex justify-start md:justify-end">
          <Button href={cta.href} variant="secondary" icon="arrow">
            {cta.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
