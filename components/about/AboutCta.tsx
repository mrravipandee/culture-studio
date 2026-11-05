import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Container from "@/components/home/shared/Container";
import { RippleButton } from "@/registry/magicui/ripple-button";
import { aboutCta } from "@/lib/content/about";

export default function AboutCta() {
  const { eyebrow, lead, primaryAction, secondaryAction } = aboutCta;

  return (
    <section className="py-24 sm:py-36 bg-[#240C0E] text-white relative overflow-hidden">
      {/* Subtle atmospheric vignette */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-black/20 via-transparent to-black/40 pointer-events-none"
        aria-hidden="true"
      />

      <Container>
        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Eyebrow */}
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
            [ {eyebrow} ]
          </span>

          {/* Headline */}
          <h2 className="mt-8 text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.03em] leading-[1.08] text-white">
            Let&apos;s build{" "}
            <span className="font-serif italic font-normal text-white/95">
              something that matters.
            </span>
          </h2>

          {/* Lead */}
          <p className="mt-8 max-w-2xl text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/75">
            {lead}
          </p>

          {/* Actions */}
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            <RippleButton
              href={primaryAction.href}
              rippleColor="rgba(36, 12, 14, 0.3)"
              className="group inline-flex items-center gap-4 rounded-full bg-white px-9 py-4 text-xs uppercase tracking-[0.2em] font-medium !text-black transition-all duration-300 hover:bg-neutral-100 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] active:scale-[0.98]"
            >
              <span>{primaryAction.label}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.5} />
              </span>
            </RippleButton>

            <Link
              href={secondaryAction.href}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-xs uppercase tracking-[0.2em] text-white/80 hover:text-white hover:border-white transition-colors"
            >
              <span>{secondaryAction.label}</span>
              <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.5} />
            </Link>
          </div>

          {/* Brand Tagline */}
          <p className="mt-16 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40 border-t border-white/10 pt-8 w-full max-w-xl">
            CULT.URE &mdash; Beyond the noise. Into the culture.
          </p>
        </div>
      </Container>
    </section>
  );
}
