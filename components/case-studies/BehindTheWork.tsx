import { behindTheWork } from "@/lib/content/case-studies";
import { Reveal, RevealGroup, RevealItem, TextMask } from "@/components/motion";
import Container from "@/components/home/shared/Container";

export default function BehindTheWork() {
  return (
    <section className="py-24 md:py-36 bg-white">
      <Container>
        {/* Eyebrow & Title */}
          <div className="max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
              [ 03 / {behindTheWork.eyebrow} ]
            </span>
            <TextMask as="h2" text={behindTheWork.title} className="mt-6 text-3xl sm:text-5xl md:text-6xl font-light tracking-heading text-black" />
            <Reveal as="p" delay={0.15} distance={16} className="mt-6 text-base sm:text-lg font-light leading-relaxed text-ink-2">
              {behindTheWork.description}
            </Reveal>
          </div>

        {/* 4 Pillars Grid */}
        <RevealGroup count={behindTheWork.pillars.length} className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {behindTheWork.pillars.map((pillar) => (
            <RevealItem
              key={pillar.name}
              className="flex flex-col justify-between border-t border-black/15 pt-8"
            >
              <div>
                <span className="font-mono text-sm tracking-eyebrow text-burgundy font-medium">
                  {pillar.index}
                </span>
                <h3 className="mt-6 text-2xl font-light tracking-title text-black">
                  {pillar.name}
                </h3>
                <p className="mt-2 font-mono text-xs uppercase tracking-wider text-ink-3">
                  {pillar.tagline}
                </p>
                <p className="mt-6 text-sm font-light leading-relaxed text-ink-2">
                  {pillar.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

