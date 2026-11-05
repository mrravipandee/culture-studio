import { thinking } from "@/lib/content/home";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/** 06 — Our thinking: scannable editorial statements in a 2×2 grid. */
export default function ThinkingSection() {
  return (
    <section
      id="thinking"
      aria-labelledby="thinking-title"
      className="section-padding scroll-mt-24 bg-white"
    >
      <Container>
        <SectionHeading intro={thinking.intro} titleId="thinking-title" />

        <div className="mt-14 grid border-t border-black/10 md:grid-cols-2 lg:mt-20">
          {thinking.statements.map((item, index) => (
            <article
              key={item.topic}
              className={`border-b border-black/10 py-10 md:p-10 ${
                index % 2 === 0 ? "md:border-r md:pl-0" : "md:pr-0"
              }`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-burgundy">
                {item.topic}
              </p>
              <h3 className="mt-5 font-serif text-2xl leading-snug tracking-[-0.02em] text-black text-balance sm:text-3xl">
                “{item.statement}”
              </h3>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-600">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
