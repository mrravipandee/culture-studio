import Container from "@/components/home/shared/Container";
import { Reveal, RevealGroup, RevealItem, TextMask } from "@/components/motion";
import { aboutPhilosophy } from "@/lib/content/about";

export default function AboutPhilosophy() {
  const { eyebrow, title, intro, statements } = aboutPhilosophy;

  return (
    <section className="py-24 sm:py-32 bg-ink text-white relative overflow-hidden">
      {/* Subtle background ambient light */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-burgundy opacity-35 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <Container>
        {/* Section Header */}
        <div className="border-b border-white/15 pb-8">
          <p className="font-mono text-xs uppercase tracking-eyebrow text-paper-3">
            [ {eyebrow} ]
          </p>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <TextMask as="h2" text={title} className="lg:col-span-8 text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1]" />
            <Reveal as="p" delay={0.15} distance={16} className="lg:col-span-4 text-sm sm:text-base font-light text-white/70 leading-relaxed">
              {intro}
            </Reveal>
          </div>
        </div>

        {/* Philosophy Statements Grid */}
        <RevealGroup count={statements.length} className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {statements.map((item, index) => (
            <RevealItem
              as="article"
              key={item.domain}
              className="relative flex flex-col justify-between border-t border-white/20 pt-8 pb-4 group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono tracking-eyebrow text-paper-3 mb-6">
                  <span>{item.domain}</span>
                  <span>0{index + 1}</span>
                </div>

                <blockquote className="text-xl sm:text-2xl lg:text-3xl font-light leading-snug tracking-tight text-white group-hover:text-white transition-colors">
                  &ldquo;{item.statement}&rdquo;
                </blockquote>
              </div>

              <p className="mt-8 text-sm sm:text-base font-light leading-relaxed text-white/60">
                {item.elaboration}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

