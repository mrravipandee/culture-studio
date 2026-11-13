import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MOTION_ARM_SCRIPT } from "@/lib/motion-arm";
import { defaultDescription, isIndexable, metadataBase, ogImage, siteName } from "@/lib/site";

// One typeface across the site; Geist Mono only for indices and numeric labels.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        {/* Arms entrance animations before first paint; see lib/motion-arm.ts. */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_ARM_SCRIPT }} />
      </head>
      {/* Inline margin reset: no layout shift even if the stylesheet arrives after first paint. */}
      <body className="min-h-full flex flex-col" style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
