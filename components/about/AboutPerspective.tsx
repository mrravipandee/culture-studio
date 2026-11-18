import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { editorialSerif } from "@/lib/fonts";
import { aboutPerspective } from "@/lib/content/about";
import SectionHeader from "@/components/editorial/SectionHeader";
import { HEADER_GAP, INDEX, SMALL } from "@/components/editorial/type";

/**
 * 06 — What CULT.URE Does. Four equal editorial rows; each whole row links to that
 * discipline on the Services page (/services#<discipline>). Columns align with the
 * section header grid.
 */
export default function AboutPerspective() {
  const { eyebrow, title, pillars, cta } = aboutPerspective;

  return (
    <section aria-labelledby="about-does-title" className="section bg-white pt-0">
      <Container>
        <div className="border-t border-black/10 pt-[var(--section-space)]">
          <SectionHeader index="06" eyebrow={eyebrow} title={title} titleId="about-does-title" />

          <RevealGroup as="ul" count={4} className={`${HEADER_GAP} border-t border-black/10`}>
            {pillars.map((p) => (
              <RevealItem as="li" key={p.number} className="border-b border-black/10">
                <Link
                  href={p.href}
                  className="group grid grid-cols-[2.75rem_1fr_auto] items-start gap-x-4 gap-y-2 py-7 transition-colors duration-300 hover:bg-[var(--cream)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-burgundy sm:py-8 lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-9"
                >
                  <span className={`${INDEX} pt-1.5 lg:col-span-1 lg:pl-2 lg:pt-0`}>{p.number}</span>
                  <span className="col-start-2 lg:col-span-4 lg:col-start-2">
                    <span className={`${editorialSerif.className} block text-[clamp(1.375rem,1.2rem+0.6vw,1.75rem)] leading-[1.2] tracking-[-0.01em] text-black transition-colors duration-300 group-hover:text-burgundy`}>
                      {p.title}
                    </span>
                  </span>
                  <span className={`${SMALL} col-start-2 lg:col-span-6 lg:col-start-6`}>{p.description}</span>
                  <span
                    aria-hidden="true"
                    className="col-start-3 row-start-1 grid size-10 place-items-center rounded-full border border-black/15 text-black transition-[background-color,border-color,color,transform] duration-300 group-hover:border-burgundy group-hover:bg-burgundy group-hover:text-white lg:col-span-1 lg:col-start-12 lg:justify-self-end lg:mr-2"
                  >
                    <ArrowUpRight size={16} strokeWidth={1.6} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>

          <div className="mt-10 flex lg:justify-end">
            <Link href={cta.href} className="link body-5 inline-flex min-h-11 items-center gap-2 text-black">
              {cta.label}
              <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
