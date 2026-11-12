import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/lib/site";

/** robots.txt: open on production (studioculture.in); blocks everything on Vercel previews. */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
