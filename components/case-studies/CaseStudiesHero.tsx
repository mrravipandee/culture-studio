import { caseStudiesHero } from "@/lib/content/case-studies";
import ScrollReveal from "@/components/home/shared/ScrollReveal";
import Container from "@/components/home/shared/Container";

export default function CaseStudiesHero() {
  return (
    <section className="relative pt-36 pb-16 md:pt-48 md:pb-24 bg-white border-b border-black/10">
      <Container>
        <ScrollReveal>
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#240C0E]" aria-hidden="true" />
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#240C0E] font-medium">
              {caseStudiesHero.eyebrow}
            </p>
          </div>

          {/* Headline */}
          <h1 className="mt-8 max-w-5xl font-light text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[-0.03em] leading-[1.05] text-black">
            Ideas built to{" "}
            <span className="font-serif italic font-normal text-[#240C0E]">
              shape perception
            </span>
            .
          </h1>

          {/* Description */}
          <p className="mt-8 md:mt-10 max-w-2xl text-base sm:text-lg md:text-xl font-light leading-relaxed text-neutral-600">
            {caseStudiesHero.description}
          </p>

          {/* Editorial Meta Strip */}
          <div className="mt-14 md:mt-20 pt-8 border-t border-black/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {caseStudiesHero.meta.map((item) => (
              <div key={item.label}>
                <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                  {item.label}
                </span>
                <span className="mt-1 block font-mono text-xs uppercase tracking-[0.18em] text-black">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}

