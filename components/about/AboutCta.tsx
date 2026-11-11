import { ArrowUpRight } from "lucide-react";
import { Reveal, TextMask } from "@/components/motion";
import Link from "next/link";
import Container from "@/components/home/shared/Container";
import { Button } from "@/components/ui/site-button";
import { aboutCta } from "@/lib/content/about";

export default function AboutCta() {
  const { eyebrow, lead, primaryAction, secondaryAction, headline } = aboutCta;

  return (
    <section className="py-24 sm:py-36 bg-burgundy text-white relative overflow-hidden">
      {/* Subtle atmospheric vignette */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-black/20 via-transparent to-black/40 pointer-events-none"
        aria-hidden="true"
      />

      <Container>
        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Eyebrow */}
          <span className="font-mono text-xs uppercase tracking-eyebrow text-white/50">
            [ {eyebrow} ]
          </span>

          {/* Headline */}
          <TextMask as="h2" text={headline} className="mt-8 text-4xl sm:text-6xl md:text-7xl font-light tracking-heading leading-[1.08] text-white" />

          {/* Lead */}
          <Reveal as="p" delay={0.15} distance={16} className="mt-8 max-w-2xl text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/75">
            {lead}
          </Reveal>

          {/* Actions */}
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            <Button href={primaryAction.href} variant="inverse" size="lg" icon="badge">
              {primaryAction.label}
            </Button>

            <Link
              href={secondaryAction.href}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-xs uppercase tracking-eyebrow text-white/80 hover:text-white hover:border-white transition-colors"
            >
              <span>{secondaryAction.label}</span>
              <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.5} />
            </Link>
          </div>

          {/* Brand Tagline */}
          <p className="mt-16 font-mono text-xs uppercase tracking-eyebrow text-white/40 border-t border-white/10 pt-8 w-full max-w-xl">
            CULT.URE &mdash; Beyond the noise. Into the culture.
          </p>
        </div>
      </Container>
    </section>
  );
}
