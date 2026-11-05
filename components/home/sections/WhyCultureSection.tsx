import { whyCulture } from "@/lib/content/home";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/** 08 — Why CULT.URE: approach pillars + plain-language commitments. */
export default function WhyCultureSection() {
  return (
    <section
      id="why-culture"
      aria-labelledby="why-culture-title"
      className="section-padding scroll-mt-24 bg-white"
    >
      <Container>
        <SectionHeading intro={whyCulture.intro} titleId="why-culture-title" />

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <dl className="grid gap-10 sm:grid-cols-3 sm:gap-8 lg:col-span-8">
            {whyCulture.pillars.map((pillar) => (
              <div key={pillar.title} className="border-t-2 border-brand-burgundy pt-6">
                <dt className="text-xl font-normal text-black">{pillar.title}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {pillar.body}
                </dd>
              </div>
            ))}
          </dl>

          <div className="bg-black p-8 text-white lg:col-span-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/60">
              What to expect
            </h3>
            <ul className="mt-6 grid gap-4">
              {whyCulture.commitments.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 border-b border-white/10 pb-4 text-sm leading-relaxed last:border-0 last:pb-0"
                >
                  <span aria-hidden="true" className="text-white/40">
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
