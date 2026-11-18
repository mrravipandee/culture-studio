import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { aboutApproach } from "@/lib/content/about";
import SectionHeader from "@/components/editorial/SectionHeader";
import { H3, HEADER_GAP, INDEX, SMALL } from "@/components/editorial/type";

/**
 * 02 — Our Approach. Header, then four elements in an editorial row: thin vertical rules
 * on desktop, two columns on tablet, a stacked list on mobile. No cards.
 */
export default function AboutApproach() {
  const { eyebrow, title, lead, cards } = aboutApproach;

  return (
    <section aria-labelledby="about-approach-title" className="section bg-white">
      <Container>
        <SectionHeader index="02" eyebrow={eyebrow} title={title} titleId="about-approach-title" intro={lead} />

        <RevealGroup as="ul" count={4} className={`${HEADER_GAP} grid grid-cols-1 border-t border-black/10 md:grid-cols-2 lg:grid-cols-4`}>
          {cards.map((card, i) => (
            <RevealItem
              as="li"
              key={card.label}
              className={[
                "border-b border-black/10 py-8 md:py-10 lg:border-b-0 lg:px-8 lg:py-12",
                i % 2 === 1 ? "md:border-l md:pl-8" : "md:pr-8",
                i > 0 ? "lg:border-l" : "lg:pl-0",
                i === 3 ? "lg:pr-0" : "",
              ].join(" ")}
            >
              <p className={INDEX}>{String(i + 1).padStart(2, "0")}</p>
              <h3 className={`${H3} mt-6`}>{card.label}</h3>
              <p className={`${SMALL} mt-3 max-w-[34ch]`}>{card.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
