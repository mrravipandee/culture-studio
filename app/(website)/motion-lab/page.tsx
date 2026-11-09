import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ClipReveal,
  LineDraw,
  Reveal,
  RevealGroup,
  RevealItem,
  ScrollScale,
  TextMask,
} from "@/components/motion";
import PinnedDemo from "./PinnedDemo";

export const metadata: Metadata = {
  title: "Motion lab",
  robots: { index: false, follow: false },
  description: "Internal QA page for CULT.URE motion patterns.",
  alternates: { canonical: null },
};

const label = (n: string, t: string) => <p className="eyebrow mb-8 text-burgundy">{n} · {t}</p>;

/** Internal QA page for every motion pattern. Not linked, not indexed. */
export default function MotionLab() {
  return (
    <main className="pt-24">
      <h1 className="sr-only">Motion lab</h1>
      <section className="section container-content">
        {label("01", "Reveal + RevealGroup")}
        <Reveal className="heading-2 max-w-narrow">A block rises 32px and fades in, once.</Reveal>
        <RevealGroup as="ul" count={4} className="mt-12 grid gap-4 sm:grid-cols-4">
          {["Strategy", "Story", "Identity", "Systems"].map((t) => (
            <RevealItem as="li" key={t} className="hover-lift rounded-lg border border-line p-6 title-2">
              {t}
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="section surface-subtle">
        <div className="container-content">
          {label("02", "TextMask (word / line)")}
          <TextMask as="h2" className="heading-1 max-w-narrow" text={"Four disciplines.\nOne coherent presence."} />
          <TextMask
            as="p"
            by="line"
            className="body-lead mt-8 max-w-measure text-ink-2"
            text={"Line mode suits longer copy:\nfewer moving parts, calmer read."}
          />
          <div className="mt-12"><LineDraw /></div>
        </div>
      </section>

      <section className="section container-content grid gap-8 md:grid-cols-2">
        <div>
          {label("03", "ClipReveal + subtle scale")}
          <ClipReveal className="aspect-portrait rounded-lg">
            <Image src="/images/hero/portrait.jpg" alt="Portrait" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </ClipReveal>
        </div>
        <div>
          {label("04", "ScrollScale (scroll linked)")}
          <ScrollScale className="relative aspect-portrait rounded-lg" from={1.12} drift={4}>
            <Image src="/images/work/featured.jpg" alt="Featured project" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </ScrollScale>
        </div>
      </section>

      <section className="section surface-ink">
        <div className="container-content flex flex-wrap items-center gap-4">
          <p className="eyebrow w-full text-paper-3">05 · Buttons and links (CSS only)</p>
          <Link href="/" className="btn btn-inverse">
            Book a call <span className="btn-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link href="/about" className="btn btn-secondary">About the studio</Link>
          <Link href="/case-studies" className="link title-3">
            View case studies <span className="btn-arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <PinnedDemo />

      <section className="section container-content">
        {label("07", "Page transition")}
        <p className="body-3 max-w-measure text-ink-2">
          Navigate to another page with the links above: the new page fades in (opacity only, 400ms). The first load
          never animates. Toggle with <code className="font-mono">PAGE_TRANSITIONS</code> in
          components/motion/PageTransition.tsx. The burgundy bar at the top is the scroll progress indicator.
        </p>
      </section>
    </main>
  );
}
