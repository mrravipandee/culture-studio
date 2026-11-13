import Image from "next/image";
import { enquiryHref, legacyAnchorsFor, type Discipline } from "@/lib/content/disciplines";
import { scopeNote } from "@/lib/content/services";
import { ClipReveal, Reveal, TextMask } from "@/components/motion";
import { Button } from "@/components/ui/site-button";

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
 * One chapter per discipline: an editorial opener (number, name, headline, intro, image)
 * followed by a section for each service in it (description, enquiry, scope).
 * Chapters alternate surface and image side so the page reads as a sequence, not a card grid.
 */
export default function ServiceChapter({ discipline, index }: ServiceChapterProps) {
  const n = String(index + 1).padStart(2, "0");
  const flip = index % 2 === 1;

  return (
    <section
      id={discipline.id}
      aria-labelledby={`${discipline.id}-title`}
      className={`section relative scroll-mt-24 ${flip ? "surface-subtle" : "surface-paper"}`}
    >
      <LegacyAnchors targetId={discipline.id} />
      <div className="container-content">
        {/* Chapter opener */}
        <header className="grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
          <div className={`lg:col-span-6 ${flip ? "lg:order-2 lg:col-start-7" : ""}`}>
            <p className="eyebrow flex items-center gap-3 text-burgundy">
              <span>{n}</span>
              <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
              <span>Discipline</span>
            </p>
            <TextMask as="h2" id={`${discipline.id}-title`} text={discipline.name} className="heading-1 mt-6 text-ink" />
            <Reveal as="p" delay={0.1} distance={16} className="heading-5 mt-6 max-w-measure text-ink">
              {discipline.headline}
            </Reveal>
            <Reveal as="p" delay={0.2} distance={16} className="body-lead mt-4 max-w-measure text-ink-2">
              {discipline.intro}
            </Reveal>
          </div>
          <div className={`lg:col-span-5 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"}`}>
            <ClipReveal className="rounded-lg" from={flip ? "left" : "right"}>
              <div className="relative aspect-landscape overflow-hidden rounded-lg bg-ink">
                <Image
                  src={discipline.image.src!}
                  alt={discipline.image.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover grayscale-[0.85] contrast-[1.05]"
                />
              </div>
            </ClipReveal>
          </div>
        </header>

        {/* Services in this discipline */}
        <div className="mt-16 lg:mt-24">
          {discipline.services.map((service, k) => (
            <article
              key={service.id}
              id={service.id}
              aria-labelledby={`${service.id}-title`}
              className="relative grid scroll-mt-24 gap-10 border-t border-line py-12 lg:grid-cols-12 lg:gap-8 lg:py-16"
            >
              <LegacyAnchors targetId={service.id} />

              {/* Name + description + enquiry: sticks while the scope scrolls on desktop */}
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-28">
                  <span className="eyebrow text-ink-3">
                    {n}.{k + 1}
                  </span>
                  <h3 id={`${service.id}-title`} className="heading-3 mt-4 text-ink">
                    {service.name}
                  </h3>
                  <p className="body-3 mt-4 text-ink-2">{service.description}</p>
                  <Button href={enquiryHref(discipline.id)} variant="primary" size="sm" icon="arrow" className="mt-8">
                    Enquire about this service
                  </Button>
                </div>
              </div>

              <Reveal className="lg:col-span-6 lg:col-start-7" distance={24}>
                <h4 className="eyebrow text-burgundy">Scope includes</h4>
                <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
                  {service.scope.map((item) => (
                    <li key={item} className="body-6 flex gap-3 border-b border-line py-3 text-ink-2">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-burgundy" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="caption-5 mt-5 text-ink-3">{scopeNote}</p>
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
