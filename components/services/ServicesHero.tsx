import { Reveal, RevealGroup, RevealItem } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { editorialSerif } from "@/lib/fonts";
import { servicesHero } from "@/lib/content/services";
import { disciplines, serviceCount } from "@/lib/content/disciplines";
import { BODY, H1, LEAD, META } from "@/components/editorial/type";

/**
 * Services hero (same system as About): warm ivory, bracketed meta bar, serif H1 with the
 * burgundy first line, supporting copy on the left and the engagement facts on the right.
 */
export default function ServicesHero() {
  const { eyebrow, headline, supportingCopy, sideLabel, meta } = servicesHero;
  const [first, second] = headline.split("\n");

  return (
    <section aria-labelledby="services-title" className="bg-[var(--cream)] pt-32 pb-[var(--section-space)] sm:pt-40 lg:pt-44">
      <Container>
        <Reveal distance={10} className="flex flex-col gap-3 border-b border-black/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow text-black">
            [ {eyebrow} ]{" "}
            <span className="mt-1 block text-ink-3 sm:mt-0 sm:inline">
              <span className="hidden sm:inline">· </span>
              {disciplines.length} disciplines · {serviceCount} services
            </span>
          </p>
          <p className={META}>{sideLabel}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:mt-16 lg:grid-cols-12 lg:items-end lg:gap-10 xl:gap-16">
          <div className="lg:col-span-7">
            <Reveal distance={20}>
              <h1 id="services-title" className={`${editorialSerif.className} ${H1} max-w-[18ch] text-black`}>
                <span className="text-burgundy">{first}</span> {second}
              </h1>
            </Reveal>
            <Reveal delay={0.12} distance={16} className="mt-8 max-w-[58ch] space-y-5 lg:mt-10">
              <p className={LEAD}>{supportingCopy[0]}</p>
              <p className={BODY}>{supportingCopy[1]}</p>
            </Reveal>
          </div>

          <RevealGroup delay={0.2} count={3} className="lg:col-span-5">
            <dl className="border-t border-black/10">
            {meta.map((m) => (
              <RevealItem key={m.label} className="grid grid-cols-1 gap-1 border-b border-black/10 py-5 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
                <dt className={META}>{m.label}</dt>
                <dd className="text-[0.9375rem] font-medium leading-snug text-black">{m.value}</dd>
              </RevealItem>
            ))}
            </dl>
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
