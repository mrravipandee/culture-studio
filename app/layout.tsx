import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { MOTION_ARM_SCRIPT } from "@/lib/motion-arm";
import { defaultDescription, isIndexable, metadataBase, ogImage, siteName } from "@/lib/site";

/*
 * One typeface across the site; Geist Mono only for indices and numeric labels.
 *
 * Self-hosted (app/fonts/, SIL Open Font License) instead of next/font/google: the Google
 * loader downloads the font CSS during every build and derives the class name from it, and
 * a differing response in one build step produced mismatched class names in production
 * (HTML .__variable_0297a5 vs CSS .__variable_369f12), so every font fell back to Times.
 * Local files make the output deterministic and builds need no network for fonts.
 * The files are the Latin variable-weight subsets Google served (same glyphs as before).
 */
const manrope = localFont({
  src: [{ path: "./fonts/manrope-latin-var.woff2", weight: "200 800", style: "normal" }],
  variable: "--font-manrope",
  display: "swap",
});

const geistMono = localFont({
  src: [{ path: "./fonts/geist-mono-latin-var.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${siteName} | B2B Marketing Agency`,
    template: `${siteName} | %s`,
  },
  description: defaultDescription,
  applicationName: siteName,
  robots: isIndexable ? { index: true, follow: true } : { index: false, follow: true },
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} | B2B Marketing Agency`,
    description: defaultDescription,
  },
  // og:image is supplied by app/opengraph-image.jpg; X/Twitter reuses the same file.
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | B2B Marketing Agency`,
    description: defaultDescription,
    images: [ogImage],
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
      // data-motion-armed / data-motion-live are set on <html> by the script below and by MotionProvider.
      suppressHydrationWarning
    >
      <head>
        {/*
          Arms entrance animations before first paint; see lib/motion-arm.ts.
          next/script with beforeInteractive is emitted inline in the server HTML <head> and
          runs before hydration, without React rendering a <script> element (which React 19
          reports as an error, since such scripts never run on client renders).
        */}
        <Script id="motion-arm" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: MOTION_ARM_SCRIPT }} />
      </head>
      {/* Inline margin reset: no layout shift even if the stylesheet arrives after first paint. */}
      <body className="min-h-full flex flex-col" style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
