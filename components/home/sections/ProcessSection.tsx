import { processSteps } from "@/lib/content/home";
import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/** 04 — Process: four ordered steps, a row on desktop. */
export default function ProcessSection() {
  return (
    <section id="process" aria-labelledby="process-title" className="section surface-subtle">
      <Container>
        <SectionHeading intro={processSteps.intro} titleId="process-title" />

        <RevealGroup
          as="ol"
          count={processSteps.steps.length}
          className="mt-16 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:mt-24 lg:grid-cols-4"
        >
          {processSteps.steps.map((step, index) => (
            <RevealItem as="li" key={step.title} className="flex flex-col bg-paper p-6 lg:p-8">
              <span className="eyebrow text-burgundy">Step {String(index + 1).padStart(2, "0")}</span>
              <h3 className="heading-4 mt-12 text-ink lg:mt-16">{step.title}</h3>
              <p className="body-6 mt-4 text-ink-2">{step.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
