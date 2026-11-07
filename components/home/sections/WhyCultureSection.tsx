import { whyCulture } from "@/lib/content/home";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/** 06 — Why CULT.URE: approach pillars + plain language commitments. */
export default function WhyCultureSection() {
  return (
    <section id="why-culture" aria-labelledby="why-culture-title" className="section surface-paper">
      <Container>
        <SectionHeading intro={whyCulture.intro} titleId="why-culture-title" />

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          <RevealGroup as="div" count={whyCulture.pillars.length} className="lg:col-span-8">
            <dl className="grid gap-10 sm:grid-cols-3 sm:gap-8">
              {whyCulture.pillars.map((pillar) => (
                <RevealItem key={pillar.title}>
                  <span aria-hidden="true" className="block h-0.5 w-8 bg-burgundy" />
                  <dt className="title-1 mt-6 text-ink">{pillar.title}</dt>
                  <dd className="body-6 mt-3 text-ink-2">{pillar.body}</dd>
                </RevealItem>
              ))}
            </dl>
          </RevealGroup>

          <Reveal delay={0.15} className="surface-ink rounded-lg p-8 lg:col-span-4">
            <h3 className="eyebrow text-paper-3">What to expect</h3>
            <ul className="mt-6 grid gap-4">
              {whyCulture.commitments.map((item) => (
                <li key={item} className="body-6 flex gap-3 border-b border-line pb-4 text-paper-2 last:border-0 last:pb-0">
                  <span aria-hidden="true" className="text-paper-4">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
