import { whyCulture } from "@/lib/content/home";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/**
 * 05 — Why CULT.URE. Left: the four approach pillars as a ruled 2 × 2 grid with small
 * indices. Right: "What to expect" as a quiet, numbered commitments panel.
 */
export default function WhyCultureSection() {
  return (
    <section id="why-culture" aria-labelledby="why-culture-title" className="section bg-white">
      <Container>
        <SectionHeading intro={whyCulture.intro} titleId="why-culture-title" />

        <div className="mt-16 grid grid-cols-1 gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-10 xl:gap-16">
          <RevealGroup as="div" count={whyCulture.pillars.length} className="lg:col-span-7">
            <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {whyCulture.pillars.map((pillar, i) => (
                <RevealItem key={pillar.title} className="border-t border-black/10 pt-7 pb-10 sm:pb-12">
                  <p aria-hidden="true" className="font-mono text-xs font-medium tracking-[0.2em] text-burgundy">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <dt className="title-1 mt-4 text-ink">{pillar.title}</dt>
                  <dd className="body-6 mt-3 max-w-[40ch] text-ink-2">{pillar.body}</dd>
                </RevealItem>
              ))}
            </dl>
          </RevealGroup>

          <Reveal delay={0.15} className="lg:col-span-5 lg:col-start-8">
            <div className="rounded-lg bg-[var(--cream)] p-8 ring-1 ring-black/[0.06] sm:p-10">
              <h3 className="eyebrow flex items-center gap-3 text-burgundy">
                <span aria-hidden="true" className="h-px w-6 bg-current opacity-60" />
                What to expect
              </h3>
              <ol className="mt-8">
                {whyCulture.commitments.map((item, i) => (
                  <li key={item} className="flex gap-5 border-t border-black/10 py-5 first:border-t-0 first:pt-0 last:pb-0">
                    <span aria-hidden="true" className="w-6 shrink-0 pt-0.5 font-mono text-xs text-ink-3">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base leading-relaxed text-ink">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
