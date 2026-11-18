import { Reveal } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { Button } from "@/components/ui/site-button";
import { editorialSerif } from "@/lib/fonts";
import { servicesCta } from "@/lib/content/services";
import { H2 } from "@/components/editorial/type";

/** 07 — Start an Enquiry. Same burgundy CTA as the About page: heading left, copy and actions right. */
export default function ServicesCta() {
  const { eyebrow, headline, lead, primaryAction, secondaryAction } = servicesCta;

  return (
    <section aria-labelledby="services-cta-title" className="section surface-burgundy">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal distance={12}>
              <p className="eyebrow flex items-center gap-3 text-white/60">
                <span className="text-white">07</span>
                <span aria-hidden="true" className="h-px w-8 bg-white/30" />
                <span>{eyebrow}</span>
              </p>
            </Reveal>
            <Reveal distance={16} className="mt-6">
              <h2 id="services-cta-title" className={`${editorialSerif.className} ${H2} max-w-[18ch] !text-white`}>
                {headline}
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.1} distance={16} className="lg:col-span-5">
            <div className="max-w-[46ch] space-y-4 text-base leading-[1.75] text-white/75 sm:text-[1.0625rem]">
              {lead.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
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
