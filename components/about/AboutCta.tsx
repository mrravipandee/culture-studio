import { Reveal } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { Button } from "@/components/ui/site-button";
import { editorialSerif } from "@/lib/fonts";
import { aboutCta } from "@/lib/content/about";
import { H2 } from "@/components/editorial/type";

/**
 * 08 — Start a Conversation. The site's burgundy surface (surface-burgundy) and buttons
 * (inverse primary + outlined secondary), heading left, lead and actions right.
 */
export default function AboutCta() {
  const { eyebrow, lead, primaryAction, secondaryAction, headline } = aboutCta;

  return (
    <section aria-labelledby="about-cta-title" className="section surface-burgundy">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal distance={12}>
              <p className="eyebrow flex items-center gap-3 text-white/60">
                <span className="text-white">08</span>
                <span aria-hidden="true" className="h-px w-8 bg-white/30" />
                <span>{eyebrow}</span>
              </p>
            </Reveal>
            <Reveal distance={16} className="mt-6">
              <h2 id="about-cta-title" className={`${editorialSerif.className} ${H2} max-w-[18ch] !text-white`}>
                {headline}
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.1} distance={16} className="lg:col-span-5">
            <p className="max-w-[46ch] text-base leading-[1.75] text-white/75 sm:text-[1.0625rem]">{lead}</p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              <Button href={primaryAction.href} variant="inverse" size="lg" icon="badge">
                {primaryAction.label}
              </Button>
              <Button href={secondaryAction.href} variant="secondary" size="lg" icon="arrow" className="border-white/35 text-white">
                {secondaryAction.label}
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
