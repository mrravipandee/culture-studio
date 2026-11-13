import { contact } from "@/lib/content/home";
import { TextLink } from "@/components/ui/site-button";
import { Reveal } from "@/components/motion";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import InquiryForm from "./InquiryForm";

/**
 * Contact: enquiry form with the four service disciplines, plus verified direct details.
 * See InquiryForm for how submission works (real endpoint or email only; never simulated).
 */
export default function ContactSection() {
  const { email, phone, socials } = contact;

  return (
    <section id="contact" aria-labelledby="contact-title" className="section surface-ink">
      <Container>
        <SectionHeading intro={contact.intro} titleId="contact-title" tone="dark" />

        <Reveal className="mt-16 grid gap-12 border-t border-line pt-10 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <InquiryForm email={email} />
          </div>

          {/* Direct details: only verified information is shown (no "To be added" rows). */}
          <dl className="grid content-start gap-8 lg:col-span-4 lg:col-start-9">
            <div>
              <dt className="eyebrow text-paper-3">Phone</dt>
              <dd className="title-1 mt-3 text-paper">
                <TextLink href={phone.href}>{phone.display}</TextLink>
              </dd>
            </div>
            {email && (
              <div>
                <dt className="eyebrow text-paper-3">Email</dt>
                <dd className="title-1 mt-3 text-paper">
                  <TextLink href={`mailto:${email}`}>{email}</TextLink>
                </dd>
              </div>
            )}
            {socials.length > 0 && (
              <div>
                <dt className="eyebrow text-paper-3">Connect</dt>
                <dd className="mt-3">
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
                </dd>
              </div>
            )}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
