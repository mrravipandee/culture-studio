import Container from "@/components/home/shared/Container";
import { contactHero } from "@/lib/content/contact";

/**
 * /contact hero. Same editorial pattern as the Case Studies hero (eyebrow, display
 * headline, lead). Rendered without an entrance animation so the headline is the
 * immediate largest paint.
 */
export default function ContactHero() {
  const { eyebrow, headline, lead } = contactHero;

  return (
    <section className="relative pt-36 pb-16 md:pt-48 md:pb-24 bg-white border-b border-black/10">
      <Container>
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-burgundy" aria-hidden="true" />
          <p className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">{eyebrow}</p>
        </div>

        <h1 className="mt-8 max-w-5xl font-light text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-heading leading-[1.05] text-black">
          {headline}
        </h1>

        <div className="mt-8 md:mt-10 grid max-w-2xl gap-5">
          {lead.map((paragraph, i) => (
            <p
              key={i}
              className={`${i === 0 ? "text-base sm:text-lg md:text-xl" : "text-base sm:text-lg"} font-light leading-relaxed text-ink-2`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </Container>
    </section>
  );
}
