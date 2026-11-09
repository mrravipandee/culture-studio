import { contact } from "@/lib/content/home";
import { brand, contactCta, primaryNav } from "@/lib/navigation";
import { serviceCategories, serviceHref } from "@/lib/content/service-catalog";
import { TextLink } from "@/components/ui/site-button";
import BackToTop from "./BackToTop";
import CurrentYear from "./CurrentYear";
import FooterWordmark from "./FooterWordmark";
import Wordmark from "./Wordmark";

const linkClass = "body-5 text-paper-2 transition-colors duration-300 ease-editorial hover:text-paper";

/** Site footer: brand, navigation, contact, legal line, and the spotlight wordmark. */
export default function Footer() {
  return (
    <footer className="surface-ink">
      <div className="container-content pt-16 lg:pt-24">
        <div className="grid-site gap-y-12 pb-16 lg:pb-20">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <Wordmark tone="paper" />
            <p className="body-6 mt-6 max-w-sm text-paper-3">{brand.tagline}</p>
          </div>

          <nav aria-label="Services" className="col-span-4 md:col-span-3 lg:col-span-3 lg:col-start-6">
            <p className="eyebrow mb-6 text-paper-3">Services</p>
            <ul className="grid gap-3">
              {serviceCategories.map((c) => (
                <li key={c.id}>
                  <TextLink href={serviceHref(c.id)} className={linkClass}>
                    {c.name}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer" className="col-span-2 md:col-span-3 lg:col-span-2">
            <p className="eyebrow mb-6 text-paper-3">Explore</p>
            <ul className="grid gap-3">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <TextLink href={link.href} className={linkClass}>
                    {link.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-2 lg:col-span-2">
            <p className="eyebrow mb-6 text-paper-3">Connect</p>
            <ul className="grid gap-3">
              <li>
                {contact.email ? (
                  <TextLink href={`mailto:${contact.email}`} className={linkClass}>
                    {contact.email}
                  </TextLink>
                ) : (
                  <TextLink href={contactCta.href} arrow className={linkClass}>
                    {contactCta.label}
                  </TextLink>
                )}
              </li>
              {contact.socials.map((s) => (
                <li key={s.href}>
                  <TextLink href={s.href} arrow className={linkClass}>
                    {s.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line py-6">
          <p className="caption-5 text-paper-3">
            © <CurrentYear /> {brand.name}. All rights reserved.
          </p>
          <BackToTop />
        </div>
      </div>

      <FooterWordmark />
    </footer>
  );
}
