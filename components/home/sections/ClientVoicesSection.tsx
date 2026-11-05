import { clientVoices } from "@/lib/content/home";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/**
 * 09 — Client voices. Structure only: entries flagged `placeholder`
 * render as clearly marked empty slots, never as real quotes.
 */
export default function ClientVoicesSection() {
  return (
    <section
      id="client-voices"
      aria-labelledby="client-voices-title"
      className="section-padding scroll-mt-24 bg-neutral-50"
    >
      <Container>
        <SectionHeading
          intro={clientVoices.intro}
          titleId="client-voices-title"
        />

        <ul className="mt-14 grid gap-6 md:grid-cols-3 lg:mt-20">
          {clientVoices.testimonials.map((voice) => (
            <li key={voice.id}>
              <figure
                className={`flex h-full flex-col justify-between gap-10 p-8 ${
                  voice.placeholder
                    ? "border border-dashed border-black/20 bg-white/60"
                    : "border border-black/10 bg-white"
                }`}
              >
                <div>
                  <span
                    aria-hidden="true"
                    className="block font-serif text-5xl leading-none text-brand-burgundy"
                  >
                    “
                  </span>
                  <blockquote
                    className={`mt-4 font-serif text-xl leading-snug ${
                      voice.placeholder ? "text-neutral-400 italic" : "text-black"
                    }`}
                  >
                    <p>{voice.quote}</p>
                  </blockquote>
                </div>

                <figcaption className="border-t border-black/10 pt-5">
                  {voice.placeholder && (
                    <span className="mb-3 inline-block border border-black/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                      Placeholder
                    </span>
                  )}
                  <p className="text-sm text-black">{voice.name}</p>
                  <p className="text-xs text-neutral-500">{voice.role}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
