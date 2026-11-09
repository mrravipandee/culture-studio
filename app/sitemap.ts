import type { MetadataRoute } from "next";
import { caseStudiesList, featuredProject } from "@/lib/content/case-studies";
import { isIndexable, siteUrl } from "@/lib/site";

/** sitemap.xml: public pages only; empty until NEXT_PUBLIC_SITE_URL is set. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexable) return [];
  const pages = ["", "/services", "/about", "/case-studies"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  // Sample entries are noindex until real project details are confirmed, so they stay out.
  const studies = [featuredProject, ...caseStudiesList].filter((p) => !p.placeholder).map((p) => ({
    url: `${siteUrl}/case-studies/${p.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));
  return [...pages, ...studies];
}
