import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/lib/site";

/** robots.txt: blocks everything until NEXT_PUBLIC_SITE_URL is set. */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
