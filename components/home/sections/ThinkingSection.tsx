import { thinking } from "@/lib/content/home";
import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/** 05 — Thinking: scannable editorial statements, 2 × 2. */
export default function ThinkingSection() {
  return (
    <section id="thinking" aria-labelledby="thinking-title" className="section surface-paper">
      <Container>
        <SectionHeading intro={thinking.intro} titleId="thinking-title" />

        <RevealGroup as="ul" count={thinking.statements.length} className="mt-16 grid gap-x-16 gap-y-12 md:grid-cols-2 lg:mt-24">
          {thinking.statements.map((item) => (
            <RevealItem as="li" key={item.topic} className="border-t border-line pt-8">
              <article>
                <p className="eyebrow text-burgundy">{item.topic}</p>
                <h3 className="heading-4 mt-5 text-ink">“{item.statement}”</h3>
                <p className="body-6 mt-5 max-w-md text-ink-2">{item.body}</p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
