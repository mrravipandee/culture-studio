import { caseStudiesHero } from "@/lib/content/case-studies";
import { Reveal } from "@/components/motion";
import Container from "@/components/home/shared/Container";

export default function CaseStudiesHero() {
  return (
    <section className="relative pt-36 pb-16 md:pt-48 md:pb-24 bg-white border-b border-black/10">
      <Container>
        <Reveal>
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-burgundy" aria-hidden="true" />
            <p className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
              {caseStudiesHero.eyebrow}
            </p>
          </div>

          {/* Headline */}
          <h1 className="mt-8 max-w-5xl font-light text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-heading leading-[1.05] text-black">
            Case studies across brand,{" "}
            <span className=" font-normal text-burgundy">
              marketing and technology
            </span>
            .
          </h1>

          {/* Description */}
          <p className="mt-8 md:mt-10 max-w-2xl text-base sm:text-lg md:text-xl font-light leading-relaxed text-ink-2">
            {caseStudiesHero.description}
          </p>

          {/* Editorial Meta Strip */}
          <div className="mt-14 md:mt-20 pt-8 border-t border-black/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {caseStudiesHero.meta.map((item) => (
              <div key={item.label}>
                <span className="block font-mono text-xs uppercase tracking-eyebrow text-ink-3">
                  {item.label}
                </span>
                <span className="mt-1 block font-mono text-xs uppercase tracking-eyebrow text-black">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

