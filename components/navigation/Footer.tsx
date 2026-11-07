import { contact } from "@/lib/content/home";
import { brand, contactCta, primaryNav } from "@/lib/navigation";
import { TextLink } from "@/components/ui/site-button";
import BackToTop from "./BackToTop";
import CurrentYear from "./CurrentYear";
import Wordmark from "./Wordmark";

/** Site footer: brand, navigation, contact, back to top. Shared by every (website) page. */
export default function Footer() {
  return (
    <footer className="surface-ink">
      <div className="container-content">
        <span className="rule" aria-hidden="true" />
        <div className="grid-site gap-y-12 py-16 lg:py-24">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <Wordmark tone="paper" />
            <p className="body-6 mt-6 max-w-xs text-paper-3">{brand.tagline}</p>
          </div>

          <nav aria-label="Footer" className="col-span-2 md:col-span-4 lg:col-span-3 lg:col-start-7">
            <p className="eyebrow mb-6 text-paper-3">Explore</p>
            <ul className="grid gap-3">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <TextLink href={link.href} className="body-5 text-paper-2 hover:text-paper">
                    {link.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-4 lg:col-span-3">
            <p className="eyebrow mb-6 text-paper-3">Connect</p>
            <ul className="grid gap-3">
              {contact.email ? (
                <li>
                  <TextLink href={`mailto:${contact.email}`} className="body-5 text-paper-2 hover:text-paper">
                    {contact.email}
                  </TextLink>
                </li>
              ) : (
                <li>
                  <TextLink href={contactCta.href} arrow className="body-5 text-paper-2 hover:text-paper">
                    {contactCta.label}
                  </TextLink>
                </li>
              )}
              {contact.socials.map((s) => (
                <li key={s.href}>
                  <TextLink href={s.href} arrow className="body-5 text-paper-2 hover:text-paper">
                    {s.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="caption-5 text-paper-3">
            © <CurrentYear /> {brand.name}. All rights reserved.
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
