import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MotionProvider from "@/components/motion/MotionProvider";
import { ClipReveal, Reveal, RevealGroup, RevealItem, TextMask } from "@/components/motion";
import Footer from "@/components/navigation/Footer";
import Navbar from "@/components/navigation/Navbar";
import { Button, TextLink } from "@/components/ui/site-button";
import { primaryNav } from "@/lib/navigation";
import { ogImage, siteName } from "@/lib/site";

const TITLE = `${siteName} | Page not found`;

// robots: null drops the inherited tag; Next.js already injects a single
// <meta name="robots" content="noindex"> on every 404 response.
export const metadata: Metadata = {
  title: "Page not found",
  robots: null,
  openGraph: { type: "website", siteName, title: TITLE, images: [ogImage] },
  twitter: { card: "summary_large_image", title: TITLE, images: [ogImage] },
};

/**
 * Branded 404: a clear way back, framed like the rest of the site.
 * Headline mask reveal, campaign still with an outlined 404, an indexed list of
 * every main page and the site footer. Copy is the existing 404 copy.
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-x-clip bg-paper text-ink">
      <MotionProvider>
        <Navbar />

        <main id="content" tabIndex={-1} className="flex-1 outline-none">
          <section className="container-content grid items-center gap-12 pt-32 pb-16 lg:grid-cols-12 lg:gap-16 lg:pt-40 lg:pb-24">
            <div className="lg:col-span-6">
              <p className="eyebrow flex items-center gap-3 text-burgundy">
                <span aria-hidden="true" className="h-px w-8 bg-current" />
                Error 404
              </p>
              <TextMask as="h1" immediate text={"This page is not\npart of the story."} className="heading-1 mt-6" />
              <Reveal as="p" delay={0.35} distance={16} className="body-lead mt-6 max-w-measure text-ink-2">
                The link may be outdated or mistyped. Everything we do is one click away.
              </Reveal>
              <Reveal delay={0.5} distance={16} className="mt-10 flex flex-wrap items-center gap-6">
                <Button href="/" icon="arrow">Back to home</Button>
                <TextLink href="/case-studies" className="title-3">View case studies</TextLink>
              </Reveal>
            </div>

            <figure className="nf-figure lg:col-span-6" aria-hidden="true">
              <ClipReveal className="nf-frame" delay={0.2}>
                <Image
                  src="/images/navbar-video-poster.jpg"
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: "62% 40%" }}
                />
                <span className="nf-scrim" />
                <span className="nf-numeral">404</span>
              </ClipReveal>
              <figcaption className="caption-5 mt-4 flex justify-between font-mono uppercase tracking-eyebrow text-ink-3">
                <span>{siteName}</span>
                <span>Page not found</span>
              </figcaption>
            </figure>
          </section>

          <section aria-labelledby="nf-next" className="container-content pb-24 lg:pb-32">
            <p id="nf-next" className="eyebrow text-ink-3">Where to next</p>
            <RevealGroup as="ul" className="mt-6 border-t border-line">
              {primaryNav.map((link, i) => (
                <RevealItem as="li" key={link.href} className="border-b border-line">
                  <Link
                    href={link.href}
                    className="group flex items-baseline justify-between gap-6 py-5 transition-colors duration-300 ease-editorial hover:text-burgundy lg:py-6"
                  >
                    <span className="flex items-baseline gap-5 lg:gap-8">
                      <span className="caption-5 font-mono text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                      <span className="heading-3">{link.label}</span>
                    </span>
                    <span aria-hidden="true" className="btn-arrow title-2">↗</span>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        </main>

        <Footer />
      </MotionProvider>
    </div>
  );
}
