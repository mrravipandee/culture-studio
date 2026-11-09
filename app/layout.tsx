import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { defaultDescription, isIndexable, metadataBase, siteName } from "@/lib/site";

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
    default: `${siteName} | Digital Growth, Marketing & Creative Agency`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  robots: isIndexable ? { index: true, follow: true } : { index: false, follow: true },
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} | Digital Growth, Marketing & Creative Agency`,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Digital Growth, Marketing & Creative Agency`,
    description: defaultDescription,
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Inline margin reset: no layout shift even if the stylesheet arrives after first paint. */}
      <body className="min-h-full flex flex-col" style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
