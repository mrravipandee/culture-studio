import { manifesto } from "@/lib/content/home";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/** 01 — Manifesto. Burgundy band: the page's one colour moment. */
export default function ManifestoSection() {
  return (
    <section id="manifesto" aria-labelledby="manifesto-title" className="section surface-burgundy">
      <Container>
        <SectionHeading intro={manifesto.intro} titleId="manifesto-title" tone="dark" />

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          <Reveal as="p" className="body-lead max-w-measure text-paper-2 lg:col-span-6">
            {manifesto.lead}
          </Reveal>

          <RevealGroup as="ol" count={manifesto.beliefs.length} delay={0.1} className="grid gap-8 lg:col-span-5 lg:col-start-8">
            {manifesto.beliefs.map((belief, index) => (
              <RevealItem as="li" key={belief.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line pt-6">
                <span className="eyebrow pt-1 text-paper-3">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="title-2 text-paper">{belief.title}</h3>
                  <p className="body-6 mt-2 text-paper-2">{belief.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <aside className="mt-16 grid gap-6 border-t border-line pt-10 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          <h3 className="heading-5 text-paper lg:col-span-4">{manifesto.value.title}</h3>
          <p className="body-3 max-w-measure text-paper-2 lg:col-span-7 lg:col-start-6">{manifesto.value.body}</p>
        </aside>
      </Container>
    </section>
  );
}
