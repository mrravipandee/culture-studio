import Container from "@/components/home/shared/Container";
import { Reveal, RevealGroup, RevealItem, TextMask } from "@/components/motion";
import { aboutApproach } from "@/lib/content/about";

export default function AboutApproach() {
  const { eyebrow, title, lead, cards } = aboutApproach;

  return (
    <section className="py-24 sm:py-32 bg-ink text-white relative">
      <Container>
        {/* Header */}
        <div className="border-b border-white/15 pb-8">
          <p className="font-mono text-xs uppercase tracking-eyebrow text-paper-3">
            [ {eyebrow} ]
          </p>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <TextMask as="h2" text={title} className="lg:col-span-8 text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1]" />
            <Reveal delay={0.15} distance={16} className="lg:col-span-4 grid gap-4">
              {lead.map((paragraph, i) => (
                <p key={i} className="text-base font-light text-white/70 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </Reveal>
          </div>
        </div>

        {/* Practice · Focus · Engagement · Principle */}
        <RevealGroup count={cards.length} className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, i) => (
            <RevealItem
              as="div"
              key={card.label}
              className="border-t border-white/20 pt-8 group hover:border-white transition-colors"
            >
              <span aria-hidden="true" className="font-mono text-xs text-paper-3 tracking-eyebrow uppercase block mb-4">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-white">{card.label}</h3>
              <p className="mt-6 text-sm font-light text-white/75 leading-relaxed">{card.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

