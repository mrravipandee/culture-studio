import Image from "next/image";
import { ClipReveal, Reveal, RevealGroup, RevealItem } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { editorialSerif } from "@/lib/fonts";
import { aboutStory } from "@/lib/content/about";
import { BODY, H2, H3, INDEX, LEAD, META, SMALL } from "@/components/editorial/type";

/**
 * 04 — Why CULT.URE (warm ivory band).
 * Top: photograph left (5/12), heading + description + Purpose/Vision right (7/12).
 * Below, full width: "How It Connects" as a four-step row, so nothing is squeezed.
 */
export default function AboutStory() {
  const { eyebrow, title, lead, purpose, vision, milestones, image } = aboutStory;

  return (
    <section aria-labelledby="about-why-title" className="section bg-[var(--cream)]">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
          <div className="lg:col-span-5">
            <ClipReveal className="w-full">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--subtle)] sm:aspect-[16/10] lg:aspect-[4/5]">
                <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
              </div>
            </ClipReveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal distance={12}>
              <p className={`${META} flex items-center gap-3`}>
                <span className="text-burgundy">04</span>
                <span aria-hidden="true" className="h-px w-8 bg-black/20" />
                <span>{eyebrow}</span>
              </p>
            </Reveal>
            <Reveal distance={16} className="mt-6">
              <h2 id="about-why-title" className={`${editorialSerif.className} ${H2} max-w-[20ch]`}>
                {title}
              </h2>
            </Reveal>
            <Reveal delay={0.08} distance={16} className="mt-8 max-w-[60ch] space-y-5">
              <p className={LEAD}>{lead[0]}</p>
              <p className={BODY}>{lead[1]}</p>
            </Reveal>

            <RevealGroup count={2} className="mt-12 grid grid-cols-1 gap-8 border-t border-black/10 pt-8 sm:grid-cols-2 sm:gap-10 lg:mt-14">
              <RevealItem>
                <h3 className="eyebrow text-burgundy">Our Purpose</h3>
                <p className={`${SMALL} mt-4 text-black/80`}>{purpose}</p>
              </RevealItem>
              <RevealItem className="sm:border-l sm:border-black/10 sm:pl-10">
                <h3 className="eyebrow text-burgundy">Our Vision</h3>
                <p className={`${SMALL} mt-4 text-black/80`}>{vision}</p>
              </RevealItem>
            </RevealGroup>
          </div>
        </div>

        {/* How It Connects */}
        <div className="mt-[var(--section-space-sm)] border-t border-black/10 pt-10 lg:pt-12">
          <Reveal distance={12}>
            <h3 className={META}>How It Connects</h3>
          </Reveal>
          <RevealGroup as="ol" count={4} className="mt-8 grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:mt-10 lg:grid-cols-4">
            {milestones.map((step, i) => (
              <RevealItem as="li" key={step.phase} className="border-t border-black/10 py-8 first:border-t-0 md:[&:nth-child(2)]:border-t-0 lg:border-t-0 lg:py-0">
                <p className={`${INDEX} flex items-center gap-3`}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span aria-hidden="true" className="h-px flex-1 bg-burgundy/25" />
                </p>
                <p className="eyebrow mt-6 text-ink-3">{step.phase}</p>
                <h4 className={`${H3} mt-2`}>{step.label}</h4>
                <p className={`${SMALL} mt-3`}>{step.description}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
