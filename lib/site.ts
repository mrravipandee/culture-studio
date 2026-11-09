import type { Metadata } from "next";
import { positioning } from "@/lib/content/service-catalog";

/**
 * Site-wide SEO configuration.
 *
 * Set NEXT_PUBLIC_SITE_URL to the production origin (e.g. https://www.example.com).
 * Until it is set the site is deliberately NOT indexable: robots are noindex,
 * no canonical URLs are emitted and the sitemap is empty, so nothing points
 * search engines at a wrong or temporary domain.
 */
const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteUrl: string | null = raw ? raw.replace(/\/+$/, "") : null;
export const isIndexable = siteUrl !== null;

export const siteName = "CULT.URE";
export const siteTagline = "Beyond the noise. Into the culture.";
export const defaultDescription = positioning.oneLiner;

/** Absolute base for metadata URLs (localhost only while the domain is unset). */
export const metadataBase = new URL(siteUrl ?? "http://localhost:3000");

/** Default social card (app/opengraph-image.tsx). Pages that set openGraph must list it explicitly. */
export const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${siteName} — ${siteTagline}`,
};

interface PageMetaInput {
  /** Page title; the "| CULT.URE" suffix is added by the layout template. */
  title: string;
  description: string;
  /** Route path, e.g. "/services". Used for canonical and og:url. */
  path: string;
  /** Use the title as-is (home page). */
  absoluteTitle?: boolean;
  /** Exclude this page from search (internal/test pages). */
  noindex?: boolean;
  type?: "website" | "article";
}

/** Consistent per-page metadata: title, description, canonical, Open Graph, Twitter, robots. */
export function pageMetadata({ title, description, path, absoluteTitle, noindex, type = "website" }: PageMetaInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${siteName}`;
  const index = isIndexable && !noindex;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    // Canonical only on indexable pages: a canonical on a noindex page sends mixed signals.
    alternates: index ? { canonical: path } : undefined,
    // noindex pages stay followable so links on them are still discovered.
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type,
      siteName,
      title: fullTitle,
      description,
      url: isIndexable ? path : undefined,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
  };
}
