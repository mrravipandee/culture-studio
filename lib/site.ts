import type { Metadata } from "next";
import { positioning } from "@/lib/content/service-catalog";

/**
 * Site-wide SEO configuration.
 *
 * Production domain: https://studioculture.in. Canonical URLs, og:url, the sitemap,
 * robots.txt, social image URLs and JSON-LD are all built from it.
 * NEXT_PUBLIC_SITE_URL can override it (e.g. for a staging domain).
 *
 * Vercel preview/development deployments stay noindex (no canonical, empty sitemap,
 * robots disallow), so only the production site is ever indexed.
 */
const PRODUCTION_URL = "https://studioculture.in";
const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || PRODUCTION_URL;

export const siteUrl: string = raw.replace(/\/+$/, "");
/** False on Vercel preview/development builds; true in production and local builds. */
export const isIndexable = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";

export const siteName = "CULT.URE";
export const siteTagline = "Beyond the noise. Into the culture.";
export const defaultDescription = positioning.oneLiner;

/** Absolute base for every metadata URL (canonical, og:url, og:image, twitter:image). */
export const metadataBase = new URL(siteUrl);

/**
 * The one social image for every platform: app/opengraph-image.jpg (1200×630).
 * Routes without their own openGraph get og:image from the file convention; pages
 * built with pageMetadata() and the X/Twitter tags reference the same file here
 * (served at /opengraph-image.jpg). No second image exists for any platform.
 */
export const ogImage = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "CULT.URE wordmark beside a woman in profile with flowing burgundy fabric",
  type: "image/jpeg",
};

interface PageMetaInput {
  /** Page title; the "CULT.URE | " prefix is added by the layout template. */
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
  const fullTitle = absoluteTitle ? title : `${siteName} | ${title}`;
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
      // A page-level openGraph replaces the inherited one (including the file-based
      // image), so the same app/opengraph-image.jpg is listed here explicitly.
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}
