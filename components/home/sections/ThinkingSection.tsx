import { thinking } from "@/lib/content/home";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import ScrollReveal from "../shared/ScrollReveal";

/** 06 — Our thinking: scannable editorial statements in a 2×2 grid. */
export default function ThinkingSection() {
  return (
    <section
      id="thinking"
      aria-labelledby="thinking-title"
      className="section-padding scroll-mt-24 bg-white"
    >
      <Container>
        <ScrollReveal>
          <SectionHeading intro={thinking.intro} titleId="thinking-title" />
        </ScrollReveal>

        <div className="mt-14 grid border-t border-black/10 md:grid-cols-2 lg:mt-20">
          {thinking.statements.map((item, index) => (
            <ScrollReveal
              key={item.topic}
              delay={index * 0.1}
              distance={24}
              className={`border-b border-black/10 py-10 md:p-10 ${
                index % 2 === 0 ? "md:border-r md:pl-0" : "md:pr-0"
              }`}
            >
              <article>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-burgundy font-medium">
                  {item.topic}
                </p>
                <h3 className="mt-5 font-serif text-2xl leading-snug tracking-[-0.02em] text-black text-balance sm:text-3xl">
                  “{item.statement}”
                </h3>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-600 font-light">
                  {item.body}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
