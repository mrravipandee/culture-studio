import Container from "@/components/home/shared/Container";
import { aboutPrinciples } from "@/lib/content/about";

export default function AboutPrinciples() {
  const { eyebrow, title, lead, items } = aboutPrinciples;

  return (
    <section className="py-24 sm:py-32 bg-white text-black border-b border-black/10">
      <Container>
        {/* Header */}
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

        {/* 4 Principles Editorial List */}
        <div className="mt-16 sm:mt-24 divide-y divide-black/10 border-b border-black/10">
          {items.map((principle) => (
            <article
              key={principle.number}
              className="py-12 lg:py-16 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-baseline group"
            >
              {/* Roman Numeral */}
              <div className="md:col-span-2 font-mono text-xl sm:text-2xl font-light text-black/30 group-hover:text-black transition-colors">
                {principle.number}
              </div>

              {/* Principle Title & Summary */}
              <div className="md:col-span-5">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-black">
                  {principle.title}
                </h3>
                <p className="mt-3 text-sm sm:text-base font-serif italic text-[#240C0E]">
                  &ldquo;{principle.summary}&rdquo;
                </p>
              </div>

              {/* Detail Narrative */}
              <div className="md:col-span-5">
                <p className="text-sm sm:text-base font-light text-black/70 leading-relaxed">
                  {principle.detail}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
