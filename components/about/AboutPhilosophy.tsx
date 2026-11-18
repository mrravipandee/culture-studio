import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { editorialSerif } from "@/lib/fonts";
import { aboutPhilosophy } from "@/lib/content/about";
import SectionHeader from "@/components/editorial/SectionHeader";
import { HEADER_GAP, INDEX, SMALL, STATEMENT } from "@/components/editorial/type";

/**
 * 03 — Our Philosophy. Header, then a table-like editorial list separated by thin rules:
 * number | discipline | statement + description on desktop; stacked on mobile.
 * The columns align with the section header grid (4 + 8 of 12).
 */
export default function AboutPhilosophy() {
  const { eyebrow, title, intro, statements } = aboutPhilosophy;

  return (
    <section aria-labelledby="about-philosophy-title" className="section bg-white pt-0">
      <Container>
        <div className="border-t border-black/10 pt-[var(--section-space)]">
          <SectionHeader index="03" eyebrow={eyebrow} title={title} titleId="about-philosophy-title" intro={intro} />

          <RevealGroup as="ol" count={4} className={`${HEADER_GAP} border-t border-black/10`}>
            {statements.map((item, i) => (
              <RevealItem as="li" key={item.domain} className="grid grid-cols-1 gap-4 border-b border-black/10 py-9 sm:grid-cols-[4rem_1fr] lg:grid-cols-12 lg:gap-8 lg:py-12">
                <p className={`${INDEX} lg:col-span-1`}>{String(i + 1).padStart(2, "0")}</p>
                <h3 className="eyebrow text-black sm:col-start-2 lg:col-span-3 lg:col-start-2">{item.domain}</h3>
                <div className="sm:col-start-2 lg:col-span-8 lg:col-start-5">
                  <p className={`${editorialSerif.className} ${STATEMENT}`}>&ldquo;{item.statement}&rdquo;</p>
                  <p className={`${SMALL} mt-4 max-w-[60ch]`}>{item.elaboration}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
