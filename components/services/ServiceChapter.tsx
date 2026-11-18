import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { enquiryHref, legacyAnchorsFor, type Discipline } from "@/lib/content/disciplines";
import { scopeNote, serviceChapterImages } from "@/lib/content/services";
import { ClipReveal, Reveal, RevealGroup, RevealItem } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { editorialSerif } from "@/lib/fonts";
import { H2, H3, INDEX, LEAD, META, SMALL, STATEMENT } from "@/components/editorial/type";

interface ServiceChapterProps {
  discipline: Discipline;
  index: number;
}

/**
 * Invisible anchors for IDs from the previous nine-service structure, so old links
 * (Footer, case-study tags, external links) land on the section that now covers them.
 */
function LegacyAnchors({ targetId }: { targetId: string }) {
  return (
    <>
      {legacyAnchorsFor(targetId).map((id) => (
        <span key={id} id={id} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 h-px w-px scroll-mt-24" />
      ))}
    </>
  );
}

/**
 * One chapter per discipline.
 * Opener: index, serif name, headline statement, intro and one monochrome photograph.
 * Services: one aligned row each (desktop: name, description and enquiry | scope in two
 * columns), stacked on smaller screens. Every service keeps its anchor (/services#id).
 */
export default function ServiceChapter({ discipline, index }: ServiceChapterProps) {
  const n = String(index + 1).padStart(2, "0");
  const image = serviceChapterImages[discipline.id] ?? { src: discipline.image.src ?? "", alt: discipline.image.alt };

  return (
    <section id={discipline.id} aria-labelledby={`${discipline.id}-title`} className="section relative scroll-mt-24 bg-white pt-0">
      <LegacyAnchors targetId={discipline.id} />
      <Container>
        <div className="border-t border-black/10 pt-[var(--section-space)]">
          {/* Opener */}
          <header className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-10 xl:gap-16">
            <div className="lg:col-span-7">
              <Reveal distance={12}>
                <p className={`${META} flex items-center gap-3`}>
                  <span className="text-burgundy">{n}</span>
                  <span aria-hidden="true" className="h-px w-8 bg-black/20" />
                  <span>Discipline</span>
                </p>
              </Reveal>
              <Reveal distance={16} className="mt-6">
                <h2 id={`${discipline.id}-title`} className={`${editorialSerif.className} ${H2} max-w-[16ch]`}>
                  {discipline.name}
                </h2>
              </Reveal>
              <Reveal delay={0.08} distance={16} className="mt-6 max-w-[58ch]">
                <p className={`${editorialSerif.className} ${STATEMENT}`}>{discipline.headline}</p>
                <p className={`${LEAD} mt-5`}>{discipline.intro}</p>
              </Reveal>
            </div>
            {image.src && (
              <div className="lg:col-span-5">
                <ClipReveal className="w-full">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--subtle)] lg:aspect-[4/3]">
                    <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover grayscale-[0.85] contrast-[1.05]" />
                  </div>
                </ClipReveal>
              </div>
            )}
          </header>

          {/* Services */}
          <RevealGroup as="div" count={6} className="mt-14 border-t border-black/10 lg:mt-20">
            {discipline.services.map((service, k) => (
              <RevealItem
                as="article"
                key={service.id}
                id={service.id}
                aria-labelledby={`${service.id}-title`}
                className="relative grid scroll-mt-28 grid-cols-1 gap-8 border-b border-black/10 py-10 lg:grid-cols-12 lg:gap-8 lg:py-12"
              >
                <LegacyAnchors targetId={service.id} />

                <div className="lg:col-span-5">
                  <p className={INDEX}>
                    {n}.{k + 1}
                  </p>
                  <h3 id={`${service.id}-title`} className={`${H3} mt-4 max-w-[24ch]`}>
                    {service.name}
                  </h3>
                  <p className={`${SMALL} mt-3 max-w-[46ch]`}>{service.description}</p>
                  <Link
                    href={enquiryHref(discipline.id)}
                    className="link body-5 mt-4 inline-flex min-h-11 items-center gap-2 text-black"
                    aria-label={`Enquire about ${service.name}`}
                  >
                    Enquire about this service
                    <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.6} />
                  </Link>
                </div>

                <div className="lg:col-span-7 lg:col-start-6 lg:pt-1">
                  <h4 className="eyebrow text-burgundy">Scope includes</h4>
                  <ul className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    {service.scope.map((item) => (
                      <li key={item} className="flex gap-3 border-b border-black/[0.07] py-2.5 text-[0.875rem] leading-snug text-ink-2">
                        <span aria-hidden="true" className="mt-[0.55em] h-px w-3 shrink-0 bg-burgundy" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <p className="caption-5 mt-6 text-ink-3">{scopeNote}</p>
        </div>
      </Container>
    </section>
  );
}
