import { manifesto } from "@/lib/content/home";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import ScrollReveal from "../shared/ScrollReveal";

/** 03 — Brand manifesto. Burgundy band: the page's main colour accent. */
export default function ManifestoSection() {
  return (
    <section
      id="manifesto"
      aria-labelledby="manifesto-title"
      className="section-padding scroll-mt-24 bg-brand-burgundy text-white"
    >
      <Container>
        <ScrollReveal>
          <SectionHeading
            intro={manifesto.intro}
            titleId="manifesto-title"
            tone="dark"
          />
        </ScrollReveal>

        <div className="mt-12 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <ScrollReveal delay={0.1} className="lg:col-span-6">
            <p className="text-xl leading-relaxed font-light text-white/85 sm:text-2xl">
              {manifesto.lead}
            </p>
          </ScrollReveal>

          <ol className="grid gap-8 lg:col-span-5 lg:col-start-8">
            {manifesto.beliefs.map((belief, index) => (
              <ScrollReveal
                key={belief.title}
                delay={0.15 + index * 0.1}
                distance={20}
              >
                <li className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-white/15 pt-6">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-white/50">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-normal text-white">
                      {belief.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                      {belief.body}
                    </p>
                  </div>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        </div>

        <ScrollReveal delay={0.3}>
          <aside className="mt-16 grid gap-6 border-t border-white/15 pt-10 lg:mt-24 lg:grid-cols-12 lg:gap-8">
            <h3 className="font-serif text-2xl italic lg:col-span-4">
              {manifesto.value.title}
            </h3>
            <p className="max-w-2xl leading-relaxed font-light text-white/75 lg:col-span-7 lg:col-start-6">
              {manifesto.value.body}
            </p>
          </aside>
        </ScrollReveal>
      </Container>
    </section>
  );
}
