import Image from "next/image";
import { ClipReveal, Reveal } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { editorialSerif } from "@/lib/fonts";
import { aboutStory } from "@/lib/content/about";
import { BODY, H2, META } from "@/components/editorial/type";

/**
 * 05 — In Practice. A quiet, image-led section: one large photograph, the heading, a short
 * paragraph and the brand signature. No other decoration.
 */
export default function AboutInPractice() {
  const { inPractice, tagline } = aboutStory;

  return (
    <section aria-labelledby="about-practice-title" className="section bg-white">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
          <div className="lg:col-span-7">
            <ClipReveal className="w-full">
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-[var(--subtle)]">
                <Image src={inPractice.image.src} alt={inPractice.image.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              </div>
            </ClipReveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal distance={12}>
              <p className={`${META} flex items-center gap-3`}>
                <span className="text-burgundy">05</span>
                <span aria-hidden="true" className="h-px w-8 bg-black/20" />
                <span>{inPractice.label}</span>
              </p>
            </Reveal>
            <Reveal distance={16} className="mt-6">
              <h2 id="about-practice-title" className={`${editorialSerif.className} ${H2} max-w-[16ch]`}>
                {inPractice.title}
              </h2>
            </Reveal>
            <Reveal delay={0.08} distance={16}>
              <p className={`${BODY} mt-8 max-w-[46ch]`}>{inPractice.body}</p>
              <p className="eyebrow mt-10 flex items-center gap-3 text-ink-3">
                <span aria-hidden="true" className="h-px w-10 bg-burgundy" />
                <span>
                  <span className="text-black">CULT.URE</span> &mdash; {tagline}
                </span>
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
