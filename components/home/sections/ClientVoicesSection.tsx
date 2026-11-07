import { clientVoices, hasClientVoices } from "@/lib/content/home";
import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/**
 * 07 — Client voices. Renders ONLY approved testimonials (placeholder: false).
 * While none exist the whole section is omitted, so no stand-in quote ever ships.
 */
export default function ClientVoicesSection() {
  if (!hasClientVoices) return null;
  const voices = clientVoices.testimonials.filter((v) => !v.placeholder);

  return (
    <section id="client-voices" aria-labelledby="client-voices-title" className="section surface-subtle">
      <Container>
        <SectionHeading intro={clientVoices.intro} titleId="client-voices-title" />

        <RevealGroup as="ul" count={voices.length} className="mt-16 grid gap-6 md:grid-cols-3 lg:mt-24">
          {voices.map((voice) => (
            <RevealItem as="li" key={voice.id}>
              <figure className="flex h-full flex-col justify-between gap-10 rounded-lg border border-line bg-paper p-8">
                <blockquote className="heading-5 text-ink">
                  <p>“{voice.quote}”</p>
                </blockquote>
                <figcaption className="border-t border-line pt-5">
                  <p className="title-4 text-ink">{voice.name}</p>
                  <p className="caption-5 mt-1 text-ink-3">{voice.role}</p>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
