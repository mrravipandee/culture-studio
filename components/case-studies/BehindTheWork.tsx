import { behindTheWork } from "@/lib/content/case-studies";
import ScrollReveal from "@/components/home/shared/ScrollReveal";
import Container from "@/components/home/shared/Container";

export default function BehindTheWork() {
  return (
    <section className="py-24 md:py-36 bg-white">
      <Container>
        <ScrollReveal>
          {/* Eyebrow & Title */}
          <div className="max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
              [ 03 / {behindTheWork.eyebrow} ]
            </span>
            <h2 className="mt-6 text-3xl sm:text-5xl md:text-6xl font-light tracking-heading text-black">
              {behindTheWork.title}
            </h2>
            <p className="mt-6 text-base sm:text-lg font-light leading-relaxed text-ink-2">
              {behindTheWork.description}
            </p>
          </div>
        </ScrollReveal>

        {/* 4 Pillars Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {behindTheWork.pillars.map((pillar, index) => (
            <ScrollReveal
              key={pillar.name}
              delay={index * 0.1}
              distance={24}
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
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

