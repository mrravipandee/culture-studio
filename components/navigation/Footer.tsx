import { contact } from "@/lib/content/home";
import { disciplineHref, disciplines } from "@/lib/content/disciplines";
import { brand, footerNav } from "@/lib/navigation";
import { siteUrl } from "@/lib/site";
import { TextLink } from "@/components/ui/site-button";
import BackToTop from "./BackToTop";
import CurrentYear from "./CurrentYear";
import FooterWordmark from "./FooterWordmark";
import Wordmark from "./Wordmark";

const linkClass = "body-5 text-paper-2 transition-colors duration-300 ease-editorial hover:text-paper";

/** Production domain for display, derived from the single source in lib/site.ts. */
const websiteLabel = new URL(siteUrl).host;

/**
 * Site footer (client copy deck, 05 / Footer): brand, the four service disciplines,
 * Explore links, verified contact details, legal line and the spotlight wordmark.
 * Social profiles are listed in the copy deck without URLs, so none are shown.
 */
export default function Footer() {
  return (
    <footer className="surface-ink">
      <div className="container-content pt-16 lg:pt-24">
        <div className="grid-site gap-y-12 pb-16 lg:pb-20">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <Wordmark tone="paper" />
            <p className="body-6 mt-6 max-w-sm text-paper-3">{brand.description}</p>
            <p className="body-6 mt-3 max-w-sm text-paper-2">{brand.tagline}</p>
          </div>

          <nav aria-label="Services" className="col-span-4 md:col-span-3 lg:col-span-3 lg:col-start-5">
            <p className="eyebrow mb-6 text-paper-3">Services</p>
            <ul className="grid gap-3">
              {disciplines.map((d) => (
                <li key={d.id}>
                  <TextLink href={disciplineHref(d.id)} className={linkClass}>
                    {d.name}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer" className="col-span-4 sm:col-span-2 md:col-span-2 lg:col-span-2">
            <p className="eyebrow mb-6 text-paper-3">Explore</p>
            <ul className="grid gap-3">
              {footerNav.map((link) => (
                <li key={link.href}>
                  <TextLink href={link.href} className={linkClass}>
                    {link.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-4 sm:col-span-2 md:col-span-3 lg:col-span-3">
            <p className="eyebrow mb-6 text-paper-3">Contact</p>
            <ul className="grid gap-3">
              <li>
                <TextLink href={contact.phone.href} className={linkClass}>
                  {contact.phone.display}
                </TextLink>
              </li>
              {contact.email && (
                <li className="[overflow-wrap:anywhere]">
                  <TextLink href={`mailto:${contact.email}`} className={linkClass}>
                    {contact.email}
                  </TextLink>
                </li>
              )}
              <li>
                {/* This site's own domain: open in the same tab. */}
                <TextLink href={siteUrl} target="_self" className={linkClass}>
                  {websiteLabel}
                </TextLink>
              </li>
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
