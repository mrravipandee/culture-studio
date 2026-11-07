import { caseStudiesCta } from "@/lib/content/case-studies";
import { Button } from "@/components/ui/site-button";
import ScrollReveal from "@/components/home/shared/ScrollReveal";
import Container from "@/components/home/shared/Container";

export default function CaseStudiesCta() {
  return (
    <section className="py-24 md:py-36 bg-burgundy text-white overflow-hidden relative">
      <Container>
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Eyebrow */}
            <span className="font-mono text-xs uppercase tracking-eyebrow text-white/50">
              [ 04 / {caseStudiesCta.eyebrow} ]
            </span>

            {/* Headline */}
            <h2 className="mt-8 text-4xl sm:text-6xl md:text-7xl font-light tracking-heading leading-[1.08] text-white">
              Ready to define{" "}
              <span className=" text-white/90">your category</span>
              ?
            </h2>

            {/* Description */}
            <p className="mt-8 max-w-2xl text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/75">
              {caseStudiesCta.description}
            </p>

            {/* CTA Button */}
            <div className="mt-12">
              <Button href={caseStudiesCta.ctaHref} variant="inverse" size="lg" icon="badge">
                {caseStudiesCta.ctaText}
              </Button>
            </div>

            {/* Bottom Fine Print */}
            <p className="mt-16 font-mono text-xs uppercase tracking-eyebrow text-white/40 border-t border-white/10 pt-8 w-full max-w-xl">
              CULT.URE &mdash; Beyond the noise. Into the culture.
            </p>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}

