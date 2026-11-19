import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { disciplineHref, disciplines, serviceCount } from "@/lib/content/disciplines";
import { serviceChapterImages } from "@/lib/content/services";
import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { editorialSerif } from "@/lib/fonts";
import { INDEX, META, SMALL } from "@/components/editorial/type";

/**
 * Table of contents: four discipline cards (photograph, index, name, one-line summary and
 * service links). Four across on desktop, two on tablet, stacked on mobile.
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

        <RevealGroup as="ol" count={4} className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-x-6">
          {disciplines.map((discipline, i) => {
            const image = serviceChapterImages[discipline.id];
            return (
              <RevealItem as="li" key={discipline.id} className="flex flex-col">
                <Link
                  href={disciplineHref(discipline.id)}
                  className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
                >
                  {image && (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--subtle)]">
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 24vw, (min-width: 768px) 46vw, 100vw"
                        className="object-cover grayscale-[0.85] transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] group-hover:grayscale-0 motion-reduce:transition-none"
                      />
                    </div>
                  )}
                  <div className="mt-6 flex items-center justify-between">
                    <span className={INDEX}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-xs text-ink-3">{discipline.services.length} services</span>
                  </div>
                  <span className={`${editorialSerif.className} mt-3 flex items-start justify-between gap-3 text-[1.5rem] leading-[1.2] tracking-[-0.01em] text-black transition-colors duration-300 group-hover:text-burgundy`}>
                    {discipline.name}
                    <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} className="mt-1.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
                <p className={`${SMALL} mt-3`}>{discipline.indexLine}</p>
                <ul className="mt-5 border-t border-black/10 pt-3">
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
            );
          })}
        </RevealGroup>
      </Container>
    </nav>
  );
}
