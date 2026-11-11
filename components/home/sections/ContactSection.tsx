import { contact } from "@/lib/content/home";
import { TextLink } from "@/components/ui/site-button";
import { Reveal } from "@/components/motion";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import InquiryForm from "./InquiryForm";

/**
 * Contact: inquiry form with service selection, plus direct details.
 * See InquiryForm for how submission works (real endpoint or email only; never simulated).
 */
export default function ContactSection() {
  const { email, socials } = contact;

  return (
    <section id="contact" aria-labelledby="contact-title" className="section surface-ink">
      <Container>
        <SectionHeading intro={contact.intro} titleId="contact-title" tone="dark" />

        <Reveal className="mt-16 grid gap-12 border-t border-line pt-10 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <InquiryForm email={email} />
          </div>

          <dl className="grid content-start gap-8 lg:col-span-4 lg:col-start-9">
            <div>
              <dt className="eyebrow text-paper-3">Email</dt>
              <dd className="title-1 mt-3 text-paper">
                {email ? (
                  <TextLink href={`mailto:${email}`}>{email}</TextLink>
                ) : (
                  <span className="text-paper-3">To be added</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-paper-3">Social</dt>
              <dd className="mt-3">
                {socials.length > 0 ? (
                  <ul className="grid gap-2">
                    {socials.map((social) => (
                      <li key={social.href} className="title-1 text-paper">
                        <TextLink href={social.href} arrow>
                          {social.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </TextLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="title-1 text-paper-3">To be added</span>
                )}
              </dd>
            </div>
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
