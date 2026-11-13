import { contactCta } from "@/lib/content/home";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/site-button";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/**
 * Home "06 — Contact" (client copy deck): a call to action, not a form.
 * Keeps id="contact" so existing /#contact links land here; the button opens /contact,
 * where the enquiry form lives. Same dark surface, heading and reveals as the other sections.
 */
export default function ContactCta() {
  const { intro, closing, action } = contactCta;

  return (
    <section id="contact" aria-labelledby="contact-title" className="section surface-ink">
      <Container>
        <SectionHeading intro={intro} titleId="contact-title" tone="dark" />

        <Reveal className="mt-16 flex flex-col items-start gap-8 border-t border-line pt-10 lg:mt-24 lg:flex-row lg:items-center lg:justify-between">
          <p className="body-lead max-w-measure text-paper">{closing}</p>
          <Button href={action.href} variant="inverse" size="lg" icon="badge">
            {action.label}
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
