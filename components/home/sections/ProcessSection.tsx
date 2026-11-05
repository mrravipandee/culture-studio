import { processSteps } from "@/lib/content/home";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import ScrollReveal from "../shared/ScrollReveal";

/** 07 — Process: four ordered steps, horizontal on desktop. */
export default function ProcessSection() {
  return (
    <section
      id="process"
      aria-labelledby="process-title"
      className="section-padding scroll-mt-24 bg-neutral-50"
    >
      <Container>
        <ScrollReveal>
          <SectionHeading intro={processSteps.intro} titleId="process-title" />
        </ScrollReveal>

        <ol className="mt-14 grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {processSteps.steps.map((step, index) => (
            <ScrollReveal
              key={step.title}
              delay={index * 0.12}
              distance={24}
              className="flex flex-col bg-white p-6 lg:p-8"
            >
              <li>
                <span className="font-mono text-[11px] tracking-[0.2em] text-brand-burgundy font-medium">
                  Step {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-10 text-3xl font-light tracking-[-0.02em] text-black lg:mt-16">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 font-light">
                  {step.body}
                </p>
              </li>
            </ScrollReveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
