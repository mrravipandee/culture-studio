import Link from "next/link";
import { disciplineHref, disciplines, serviceCount } from "@/lib/content/disciplines";
import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { editorialSerif } from "@/lib/fonts";
import { INDEX, META, SMALL } from "@/components/editorial/type";

/**
 * Table of contents: four disciplines in an editorial row (thin vertical rules on desktop,
 * two columns on tablet, stacked on mobile), each listing its services as links.
 */
export default function ServiceIndex() {
  return (
    <nav aria-labelledby="service-index-title" className="section bg-white">
      <Container>
        <h2 id="service-index-title" className={`${META} flex items-center gap-3`}>
          <span className="text-burgundy">Four disciplines</span>
          <span aria-hidden="true" className="h-px w-8 bg-black/20" />
          <span>{serviceCount} services</span>
        </h2>

        <RevealGroup as="ol" count={4} className="mt-10 grid grid-cols-1 border-t border-black/10 md:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {disciplines.map((discipline, i) => (
            <RevealItem
              as="li"
              key={discipline.id}
              className={[
                "border-b border-black/10 py-8 md:py-10 lg:border-b-0 lg:px-8 lg:py-12",
                i % 2 === 1 ? "md:border-l md:pl-8" : "md:pr-8",
                i > 0 ? "lg:border-l" : "lg:pl-0",
                i === 3 ? "lg:pr-0" : "",
              ].join(" ")}
            >
              <p className={INDEX}>{String(i + 1).padStart(2, "0")}</p>
              <Link href={disciplineHref(discipline.id)} className="group mt-5 block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy">
                <span className={`${editorialSerif.className} block text-[1.5rem] leading-[1.2] tracking-[-0.01em] text-black transition-colors duration-300 group-hover:text-burgundy`}>
                  {discipline.name}
                </span>
              </Link>
              <p className={`${SMALL} mt-3`}>{discipline.indexLine}</p>
              <ul className="mt-6 border-t border-black/10 pt-4">
                {discipline.services.map((service) => (
                  <li key={service.id}>
                    <Link
                      href={disciplineHref(service.id)}
                      className="flex min-h-9 items-center py-1 text-[0.875rem] leading-snug text-ink-2 transition-colors duration-200 hover:text-burgundy focus-visible:outline-2 focus-visible:outline-burgundy"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </nav>
  );
}
