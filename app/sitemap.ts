import type { MetadataRoute } from "next";
import { getPublishedCaseStudies } from "@/lib/case-studies/public";
import { BLOG_COPY_IN_REVIEW, publicBlogArticles } from "@/lib/content/blog";
import { caseStudiesEnabled } from "@/lib/content/case-studies-publishing";
import { isIndexable, siteUrl } from "@/lib/site";

/** sitemap.xml: public pages on studioculture.in; empty on Vercel previews. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexable) return [];
  // PUBLISHED case studies only (MongoDB, cached; drafts, archived and deleted never listed).
  const publishedCaseStudies = caseStudiesEnabled ? await getPublishedCaseStudies() : [];
  // /case-studies is listed only while at least one case study is published.
  const paths = ["", "/services", "/about", ...(publishedCaseStudies.length ? ["/case-studies"] : []), "/contact"];
  const pages = paths.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const studies = publishedCaseStudies.map((p) => ({
    url: `${siteUrl}/case-studies/${p.slug}`,
    lastModified: p.updatedAt,
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
