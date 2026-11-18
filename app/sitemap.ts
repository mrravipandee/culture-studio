import type { MetadataRoute } from "next";
import { publishedCaseStudies } from "@/lib/content/case-studies";
import { BLOG_COPY_IN_REVIEW, publicBlogArticles } from "@/lib/content/blog";
import { caseStudiesEnabled } from "@/lib/content/case-studies-publishing";
import { isIndexable, siteUrl } from "@/lib/site";

/** sitemap.xml: public pages on studioculture.in; empty on Vercel previews. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexable) return [];
  // /case-studies is listed only once a case study is explicitly published.
  const paths = ["", "/services", "/about", ...(caseStudiesEnabled ? ["/case-studies"] : []), "/contact"];
  const pages = paths.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  // Only explicitly published case studies (lib/content/case-studies-publishing.ts).
  const studies = publishedCaseStudies.map((p) => ({
    url: `${siteUrl}/case-studies/${p.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));
  // Only published blog articles, and none while their copy is still in review.
  const articles = (BLOG_COPY_IN_REVIEW ? [] : publicBlogArticles).map((a) => ({
    url: `${siteUrl}/blog/${a.slug}`,
    lastModified: a.date,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));
  return [...pages, ...studies, ...articles];
}
