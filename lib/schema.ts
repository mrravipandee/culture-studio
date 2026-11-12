/**
 * JSON-LD builders (schema.org). Verified facts only: name, tagline, positioning
 * and the nine official services. Contact email and social profiles are included
 * automatically once they are set in lib/content/home.ts. No logo, address,
 * reviews or ratings are emitted because none are confirmed.
 *
 * URLs are absolute on the production domain (lib/site.ts). Builders return null
 * on non-indexable deployments (Vercel previews), which are noindex anyway.
 */
import { contact } from "@/lib/content/home";
import { allServices, categoryOf, positioning } from "@/lib/content/service-catalog";
import { isIndexable, siteName, siteTagline, siteUrl } from "@/lib/site";

type Json = Record<string, unknown>;

const orgId = () => `${siteUrl}/#organization`;
const webId = () => `${siteUrl}/#website`;

/** Organization + WebSite, emitted on every public page. */
export function siteSchema(): Json | null {
  if (!isIndexable) return null;
  const org: Json = {
    "@type": "Organization",
    "@id": orgId(),
    name: siteName,
    url: `${siteUrl}/`,
    description: positioning.oneLiner,
    slogan: siteTagline,
    knowsAbout: allServices.map((s) => s.name),
  };
  if (contact.email) {
    org.email = contact.email;
    org.contactPoint = { "@type": "ContactPoint", contactType: "sales", email: contact.email };
  }
  if (contact.socials.length) org.sameAs = contact.socials.map((s) => s.href);

  return {
    "@context": "https://schema.org",
    "@graph": [
      org,
      {
        "@type": "WebSite",
        "@id": webId(),
        name: siteName,
        url: `${siteUrl}/`,
        description: positioning.oneLiner,
        inLanguage: "en",
        publisher: { "@id": orgId() },
      },
    ],
  };
}

/** One Service node per official service, each pointing at its section on /services. */
export function servicesSchema(): Json | null {
  if (!isIndexable) return null;
  return {
    "@context": "https://schema.org",
    "@graph": allServices.map((s) => ({
      "@type": "Service",
      "@id": `${siteUrl}/services#${s.id}`,
      name: s.name,
      serviceType: s.name,
      category: categoryOf(s.id).name,
      description: s.what,
      url: `${siteUrl}/services#${s.id}`,
      provider: { "@id": orgId() },
    })),
  };
}

/** BreadcrumbList for an inner page. Items are [name, path] from the home page down. */
export function breadcrumbSchema(items: [name: string, path: string][]): Json | null {
  if (!isIndexable) return null;
  const trail: [string, string][] = [["Home", "/"], ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${siteUrl}${path === "/" ? "/" : path}`,
    })),
  };
}
