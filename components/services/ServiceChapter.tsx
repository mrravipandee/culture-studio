import Image from "next/image";
import type { ServiceCategory } from "@/lib/content/service-catalog";
import { inquiryHref, services } from "@/lib/content/service-catalog";
import { ClipReveal, Reveal, TextMask } from "@/components/motion";
import { Button } from "@/components/ui/site-button";

interface ServiceChapterProps {
  category: ServiceCategory;
  index: number;
}

/**
 * One chapter per category: an editorial opener (number, title, intro, image)
 * followed by a long-form section for each service in it. Chapters alternate
 * surface and image side so the page reads as a sequence, not a card grid.
 */
export default function ServiceChapter({ category, index }: ServiceChapterProps) {
  const n = String(index + 1).padStart(2, "0");
  const flip = index % 2 === 1;

  return (
    <section
      id={category.id}
      aria-labelledby={`${category.id}-title`}
      className={`section scroll-mt-24 ${flip ? "surface-subtle" : "surface-paper"}`}
    >
      <div className="container-content">
        {/* Chapter opener */}
        <header className="grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
          <div className={`lg:col-span-6 ${flip ? "lg:order-2 lg:col-start-7" : ""}`}>
            <p className="eyebrow flex items-center gap-3 text-burgundy">
              <span>{n}</span>
              <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
              <span>Discipline</span>
            </p>
            <TextMask as="h2" id={`${category.id}-title`} text={category.name} className="heading-1 mt-6 text-ink" />
            <Reveal as="p" delay={0.15} distance={16} className="body-lead mt-6 max-w-measure text-ink-2">
              {category.intro}
            </Reveal>
          </div>
          <div className={`lg:col-span-5 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"}`}>
            <ClipReveal className="rounded-lg" from={flip ? "left" : "right"}>
              <div className="relative aspect-landscape overflow-hidden rounded-lg bg-ink">
                <Image
                  src={category.image.src!}
                  alt={category.image.alt}
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
          {category.services.map((id, k) => {
            const s = services[id];
            return (
              <article
                key={id}
                id={id}
                aria-labelledby={`${id}-title`}
                className="grid scroll-mt-24 gap-10 border-t border-line py-12 lg:grid-cols-12 lg:gap-8 lg:py-16"
              >
                {/* Name + summary + inquiry: sticks while the detail scrolls on desktop */}
                <div className="lg:col-span-4">
                  <div className="lg:sticky lg:top-28">
                    <span className="eyebrow text-ink-3">
                      {n}.{k + 1}
                    </span>
                    <h3 id={`${id}-title`} className="heading-3 mt-4 text-ink">
                      {s.name}
                    </h3>
                    <p className="body-3 mt-4 text-ink-2">{s.summary}</p>
                    <Button href={inquiryHref(id)} variant="primary" size="sm" icon="arrow" className="mt-8">
                      Enquire about this service
                    </Button>
                  </div>
                </div>

                <Reveal className="grid gap-10 lg:col-span-7 lg:col-start-6" distance={24}>
                  <dl className="grid gap-8 sm:grid-cols-2">
                    <div>
                      <dt className="eyebrow text-burgundy">What it is</dt>
                      <dd className="body-3 mt-3 text-ink">{s.what}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-burgundy">The problem it solves</dt>
                      <dd className="body-3 mt-3 text-ink-2">{s.problem}</dd>
                    </div>
                  </dl>

                  <div className="grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
                    <div>
                      <h4 className="title-3 text-ink">What CULT.URE provides</h4>
                      <ul className="mt-4 grid gap-3">
                        {s.provides.map((item) => (
                          <li key={item} className="body-6 flex gap-3 text-ink-2">
                            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-burgundy" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="title-3 text-ink">Possible deliverables</h4>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {s.possibleDeliverables.map((item) => (
                          <li key={item} className="caption-2 rounded-full border border-line-strong px-3 py-1 text-ink-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="caption-5 mt-4 text-ink-3">Scope is agreed per engagement.</p>
                    </div>
                  </div>
                </Reveal>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
