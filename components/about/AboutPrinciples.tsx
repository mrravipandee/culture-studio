import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { editorialSerif } from "@/lib/fonts";
import { aboutPrinciples } from "@/lib/content/about";
import SectionHeader from "@/components/editorial/SectionHeader";
import { H3, HEADER_GAP, SMALL } from "@/components/editorial/type";

/**
 * 07 — Our Principles. Four columns with subtle vertical rules on desktop, two on tablet,
 * stacked on mobile: Roman numeral, short heading, supporting paragraph.
 */
export default function AboutPrinciples() {
  const { eyebrow, title, items } = aboutPrinciples;

  return (
    <section aria-labelledby="about-principles-title" className="section bg-white pt-0">
      <Container>
        <div className="border-t border-black/10 pt-[var(--section-space)]">
          <SectionHeader index="07" eyebrow={eyebrow} title={title} titleId="about-principles-title" />

          <RevealGroup as="ol" count={4} className={`${HEADER_GAP} grid grid-cols-1 border-t border-black/10 md:grid-cols-2 lg:grid-cols-4`}>
            {items.map((item, i) => (
              <RevealItem
                as="li"
                key={item.number}
                className={[
                  "border-b border-black/10 py-8 md:py-10 lg:border-b-0 lg:px-8 lg:py-12",
                  i % 2 === 1 ? "md:border-l md:pl-8" : "md:pr-8",
                  i > 0 ? "lg:border-l" : "lg:pl-0",
                  i === 3 ? "lg:pr-0" : "",
                ].join(" ")}
              >
                <p aria-hidden="true" className={`${editorialSerif.className} text-[2rem] italic leading-none text-burgundy`}>
                  {item.number}
                </p>
                <h3 className={`${H3} mt-6`}>
                  <span className="sr-only">Principle {item.number}: </span>
                  {item.title}
                </h3>
                <p className={`${SMALL} mt-3 max-w-[34ch]`}>{item.detail}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
