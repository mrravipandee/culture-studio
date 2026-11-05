import { ArrowUpRight } from "lucide-react";
import { caseStudiesCta } from "@/lib/content/case-studies";
import { RippleButton } from "@/registry/magicui/ripple-button";
import ScrollReveal from "@/components/home/shared/ScrollReveal";
import Container from "@/components/home/shared/Container";

export default function CaseStudiesCta() {
  return (
    <section className="py-24 md:py-36 bg-[#240C0E] text-white overflow-hidden relative">
      <Container>
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Eyebrow */}
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
              [ 04 / {caseStudiesCta.eyebrow} ]
            </span>

            {/* Headline */}
            <h2 className="mt-8 text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.03em] leading-[1.08] text-white">
              Ready to define{" "}
              <span className="font-serif italic text-white/90">your category</span>
              ?
            </h2>

            {/* Description */}
            <p className="mt-8 max-w-2xl text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/75">
              {caseStudiesCta.description}
            </p>

            {/* CTA Button */}
            <div className="mt-12">
              <RippleButton
                href={caseStudiesCta.ctaHref}
                rippleColor="rgba(36, 12, 14, 0.3)"
                className="group inline-flex items-center gap-4 rounded-full bg-white px-9 py-4 text-xs uppercase tracking-[0.2em] font-medium !text-black transition-all duration-300 hover:bg-neutral-100 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] active:scale-[0.98]"
              >
                <span>{caseStudiesCta.ctaText}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.5} />
                </span>
              </RippleButton>
            </div>

            {/* Bottom Fine Print */}
            <p className="mt-16 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40 border-t border-white/10 pt-8 w-full max-w-xl">
              CULT.URE &mdash; Beyond the noise. Into the culture.
            </p>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
