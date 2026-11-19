import { processSteps } from "@/lib/content/home";
import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/**
 * 04 — Process. A clean four-stage timeline: one hairline runs across the top with a marker
 * per stage; each stage is a column (number, name, focus, description, typical outputs)
 * separated by vertical rules. Stacks into a single column with a left rule on mobile.
 */
export default function ProcessSection() {
  const steps = processSteps.steps;

  return (
    <section id="process" aria-labelledby="process-title" className="section bg-[var(--cream)] text-ink">
      <Container>
        <SectionHeading intro={processSteps.intro} titleId="process-title" />

        <RevealGroup
          as="ol"
          count={steps.length}
          className="relative mt-16 grid grid-cols-1 border-l border-black/10 sm:grid-cols-2 sm:border-l-0 lg:mt-24 lg:grid-cols-4 lg:border-t"
        >
          {steps.map((step, index) => {
            const n = String(index + 1).padStart(2, "0");
            return (
              <RevealItem
                as="li"
                key={step.title}
                className="group relative flex flex-col pb-12 pl-8 sm:border-t sm:border-black/10 sm:pt-10 sm:pr-8 sm:pb-12 sm:pl-0 lg:border-t-0 lg:border-l lg:px-8 lg:pt-12 lg:first:border-l-0 lg:first:pl-0"
              >
                {/* Stage marker: on the left rule (mobile) / on the top rule (desktop) */}
                <span
                  aria-hidden="true"
                  className="absolute top-1 -left-[5px] size-[9px] rounded-full border border-burgundy bg-[var(--cream)] transition-colors duration-300 group-hover:bg-burgundy sm:-top-[5px] sm:left-0 lg:left-8 lg:group-first:left-0"
                />

                <p className="font-mono text-xs font-medium tracking-[0.2em] text-burgundy">{n}</p>
                <h3 className="heading-4 mt-5 text-ink">{step.title}</h3>
                <p className="mt-2 text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-ink-3">{step.tagline}</p>
                <p className="body-6 mt-5 max-w-[34ch] text-ink-2">{step.body}</p>

                {step.deliverables.length > 0 && (
                  <div className="mt-auto pt-10">
                    <p className="eyebrow text-ink-3">Typical outputs</p>
                    <ul className="mt-3 border-t border-black/10">
                      {step.deliverables.map((item) => (
                        <li key={item} className="border-b border-black/[0.07] py-2.5 text-[0.875rem] leading-snug text-ink">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
