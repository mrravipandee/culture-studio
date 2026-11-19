import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
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
 * Opener: a two-column split (copy | large photograph), alternating sides chapter to chapter.
 * Services: a two-column grid of ruled cards (index, name, description, enquiry link). Each
 * card's scope sits in a native <details> disclosure, so the page stays scannable while all
 * scope text remains in the document (searchable, indexable, keyboard and screen-reader friendly).
 */
export default function ServiceChapter({ discipline, index }: ServiceChapterProps) {
  const n = String(index + 1).padStart(2, "0");
  const image = serviceChapterImages[discipline.id] ?? { src: discipline.image.src ?? "", alt: discipline.image.alt };
  const flip = index % 2 === 1;
  // Alternates with the index (white) above and Process (ivory) below: ivory, white, ivory, white.
  const tone = flip ? "bg-white" : "bg-[var(--cream)]";

  return (
    <section id={discipline.id} aria-labelledby={`${discipline.id}-title`} className={`section relative scroll-mt-24 ${tone}`}>
      <LegacyAnchors targetId={discipline.id} />
      <Container>
        {/* Opener */}
        <header className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-10 xl:gap-16">
          <div className={`lg:col-span-6 ${flip ? "lg:order-2" : ""}`}>
            <Reveal distance={12}>
              <p className={`${META} flex items-center gap-3`}>
                <span className="text-burgundy">{n}</span>
                <span aria-hidden="true" className="h-px w-8 bg-black/20" />
                <span>Discipline</span>
                <span aria-hidden="true" className="text-black/25">·</span>
                <span>{discipline.services.length} services</span>
              </p>
            </Reveal>
            <Reveal distance={16} className="mt-6">
              <h2 id={`${discipline.id}-title`} className={`${editorialSerif.className} ${H2} max-w-[16ch]`}>
                {discipline.name}
              </h2>
            </Reveal>
            <Reveal delay={0.08} distance={16} className="mt-6 max-w-[54ch]">
              <p className={`${editorialSerif.className} ${STATEMENT}`}>{discipline.headline}</p>
              <p className={`${LEAD} mt-5`}>{discipline.intro}</p>
            </Reveal>
          </div>
          {image.src && (
            <div className={`lg:col-span-6 ${flip ? "lg:order-1" : ""}`}>
              <ClipReveal className="w-full">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[var(--subtle)]">
                  <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover grayscale-[0.85] contrast-[1.05]" />
                </div>
              </ClipReveal>
            </div>
          )}
        </header>

        {/* Services */}
        <RevealGroup as="div" count={6} className="mt-16 grid grid-cols-1 gap-x-10 md:grid-cols-2 lg:mt-24 xl:gap-x-16">
          {discipline.services.map((service, k) => (
            <RevealItem
              as="article"
              key={service.id}
              id={service.id}
              aria-labelledby={`${service.id}-title`}
              className="relative flex scroll-mt-28 flex-col border-t border-black/10 pt-8 pb-10"
            >
              <LegacyAnchors targetId={service.id} />

              <p className={INDEX}>
                {n}.{k + 1}
              </p>
              <h3 id={`${service.id}-title`} className={`${H3} mt-4 max-w-[26ch]`}>
                {service.name}
              </h3>
              <p className={`${SMALL} mt-3 max-w-[52ch]`}>{service.description}</p>

              <details className="group/scope mt-6 border-y border-black/[0.08]">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 text-[0.8125rem] font-medium tracking-[0.04em] text-black transition-colors hover:text-burgundy focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-burgundy [&::-webkit-details-marker]:hidden">
                  <span>
                    Scope includes <span className="text-ink-3">({service.scope.length})</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full border border-black/15 transition-[transform,background-color,border-color,color] duration-300 group-open/scope:rotate-45 group-open/scope:border-burgundy group-open/scope:bg-burgundy group-open/scope:text-white motion-reduce:transition-none"
                  >
                    <Plus size={13} strokeWidth={1.6} />
                  </span>
                </summary>
                <ul className="grid grid-cols-1 gap-x-6 pb-4 sm:grid-cols-2">
                  {service.scope.map((item) => (
                    <li key={item} className="flex gap-3 py-1.5 text-[0.875rem] leading-snug text-ink-2">
                      <span aria-hidden="true" className="mt-[0.55em] h-px w-3 shrink-0 bg-burgundy" />
                      {item}
                    </li>
                  ))}
                </ul>
              </details>

              <Link
                href={enquiryHref(discipline.id)}
                className="link body-5 mt-4 inline-flex min-h-11 items-center gap-2 self-start text-black"
                aria-label={`Enquire about ${service.name}`}
              >
                Enquire about this service
                <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.6} />
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
        <p className="caption-5 mt-2 text-ink-3">{scopeNote}</p>
      </Container>
    </section>
  );
}
