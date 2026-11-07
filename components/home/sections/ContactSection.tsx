import { contact } from "@/lib/content/home";
import { Button, TextLink } from "@/components/ui/site-button";
import { Reveal } from "@/components/motion";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/**
 * Contact. No form: there is no submission endpoint, so the action is email.
 * Until `contact.email` is set, the section says so instead of linking to itself.
 */
export default function ContactSection() {
  const { email, socials } = contact;

  return (
    <section id="contact" aria-labelledby="contact-title" className="section surface-ink">
      <Container>
        <SectionHeading intro={contact.intro} titleId="contact-title" tone="dark" />

        <Reveal className="mt-16 grid gap-12 border-t border-line pt-10 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            {email ? (
              <Button href={`mailto:${email}`} variant="inverse" size="lg" icon="badge">
                Start a conversation
              </Button>
            ) : (
              <p className="body-3 max-w-sm text-paper-3">
                Our inbox is being set up. The contact address will appear here shortly.
              </p>
            )}
          </div>

          <dl className="grid gap-8 sm:grid-cols-2 lg:col-span-6">
            <div>
              <dt className="eyebrow text-paper-3">Email</dt>
              <dd className="title-1 mt-3 text-paper">
                {email ? (
                  <TextLink href={`mailto:${email}`}>{email}</TextLink>
                ) : (
                  <span className="text-paper-4">To be added</span>
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
                  <span className="title-1 text-paper-4">To be added</span>
                )}
              </dd>
            </div>
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
