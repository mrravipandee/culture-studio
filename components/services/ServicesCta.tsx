import { servicesCta } from "@/lib/content/services";
import { Button, TextLink } from "@/components/ui/site-button";
import { Reveal, TextMask } from "@/components/motion";

/** Closing enquiry block: the contact form (with discipline selection) or a direct call. */
export default function ServicesCta() {
  const { eyebrow, headline, lead, primaryAction, secondaryAction } = servicesCta;

  return (
    <section aria-labelledby="services-cta-heading" className="section-lg surface-ink">
      <div className="container-narrow text-center">
        <p className="eyebrow text-paper-3">{eyebrow}</p>
        <TextMask as="h2" id="services-cta-heading" text={headline} className="heading-1 mt-6 text-paper" />
        <Reveal delay={0.15} distance={16} className="mx-auto mt-6 grid max-w-measure gap-4">
          {lead.map((paragraph) => (
            <p key={paragraph} className="body-lead text-paper-2">
              {paragraph}
            </p>
          ))}
        </Reveal>
        <div className="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Button href={primaryAction.href} variant="inverse" size="lg" icon="badge">
            {primaryAction.label}
          </Button>
          <TextLink href={secondaryAction.href} arrow className="title-3 text-paper">
            {secondaryAction.label}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
