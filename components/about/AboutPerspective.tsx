import Container from "@/components/home/shared/Container";
import { aboutPerspective } from "@/lib/content/about";

export default function AboutPerspective() {
  const { eyebrow, title, lead, pillars } = aboutPerspective;

  return (
    <section className="py-24 sm:py-32 bg-white text-black border-b border-black/10">
      <Container>
        {/* Section Header */}
        <div className="border-b border-black/10 pb-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-black/50">
            [ {eyebrow} ]
          </p>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <h2 className="lg:col-span-8 text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1]">
              {title}
            </h2>
            <p className="lg:col-span-4 text-base font-light text-black/70 leading-relaxed">
              {lead}
            </p>
          </div>
        </div>

        {/* 4 Perspective Pillars */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          {pillars.map((pillar) => (
            <article
              key={pillar.number}
              className="group border border-black/10 bg-neutral-50/50 p-8 sm:p-10 rounded-sm hover:border-black/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono tracking-[0.25em] text-black/40 pb-6 border-b border-black/10">
                  <span className="text-black font-semibold">PILLAR {pillar.number}</span>
                  <span className="text-[#240C0E] font-medium uppercase">
                    CULT.URE THESIS
                  </span>
                </div>

                <h3 className="mt-6 text-2xl sm:text-3xl font-light text-black tracking-tight">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-xs font-mono uppercase tracking-[0.15em] text-[#240C0E]">
                  {pillar.subtitle}
                </p>

                <p className="mt-6 text-sm sm:text-base font-light text-black/75 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-black/10 flex items-start gap-3">
                <span className="font-mono text-xs uppercase tracking-wider text-black/40 shrink-0">
                  IMPACT:
                </span>
                <p className="font-serif italic text-sm text-black/90">
                  &ldquo;{pillar.takeaway}&rdquo;
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

