import { ArrowUpRight } from "lucide-react";
import { RippleButton } from "@/registry/magicui/ripple-button";
import { contact } from "@/lib/content/home";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";

/**
 * 10 — Contact. No inquiry form: the project has no submission endpoint,
 * so the CTA uses email (mailto) once `contact.email` is configured.
 */
export default function ContactSection() {
  const { email, socials, fallbackCta } = contact;
  const cta = email
    ? { label: "Start a conversation", href: `mailto:${email}` }
    : fallbackCta;

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="section-padding scroll-mt-24 bg-black text-white"
    >
      <Container>
        <SectionHeading
          intro={contact.intro}
          titleId="contact-title"
          tone="dark"
        />

        <div className="mt-14 grid gap-12 border-t border-white/15 pt-10 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <RippleButton
              href={cta.href}
              rippleColor="rgba(36, 12, 14, 0.25)"
              className="group inline-flex min-h-14 items-center gap-4 rounded-full bg-white py-2 pr-2 pl-7 text-xs uppercase tracking-[0.18em] text-black transition-colors hover:bg-brand-burgundy hover:text-white focus-visible:outline-white"
            >
              <span>{cta.label}</span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-black text-white transition-transform group-hover:rotate-45">
                <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
              </span>
            </RippleButton>
          </div>

          <dl className="grid gap-8 sm:grid-cols-2 lg:col-span-6">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
                Email
              </dt>
              <dd className="mt-3 text-lg">
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="underline decoration-white/30 underline-offset-8 transition-colors hover:decoration-white focus-visible:outline-white"
                  >
                    {email}
                  </a>
                ) : (
                  <span className="text-white/40 italic">
                    Email address to be added
                  </span>
                )}
              </dd>
            </div>

            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
                Social
              </dt>
              <dd className="mt-3">
                {socials.length > 0 ? (
                  <ul className="grid gap-2">
                    {socials.map((social) => (
                      <li key={social.href}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-lg transition-colors hover:text-white/70 focus-visible:outline-white"
                        >
                          {social.label}
                          <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.5} />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-lg text-white/40 italic">
                    Social profiles to be added
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-20 flex flex-col gap-2 border-t border-white/15 pt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-white/40 sm:flex-row sm:justify-between">
          <span>
            CULT<span className="text-[#a44b52]">.</span>URE — Personal Branding Agency
          </span>
          <span>Beyond the noise. Into the culture.</span>
        </p>
      </Container>
    </section>
  );
}
