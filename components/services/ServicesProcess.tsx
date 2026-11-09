import { serviceProcess } from "@/lib/content/services";
import Container from "@/components/home/shared/Container";
import { Reveal } from "@/components/motion";
import { ProcessStepGlyph, GridCrosshairMarker } from "@/components/home/shared/WorkVectors";

export default function ServicesProcess() {

  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32 lg:py-40 bg-[#FCFBF9] text-ink border-b border-black/10"
    >
      <Container>
        {/* Header */}
        <div className="border-b border-black/10 pb-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-burgundy font-semibold">
            [ 05 / OUR PROCESS ]
          </p>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <h2 className="lg:col-span-8 text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.08] text-ink">
              How every engagement{" "}
              <span className="text-burgundy">runs.</span>
            </h2>
            <p className="lg:col-span-4 text-sm sm:text-base font-light text-ink-2 leading-relaxed">
              Four stages, from the first conversation to ongoing improvement.
              Scope and timing are agreed for each project.
            </p>
          </div>
        </div>

        {/* Process Timeline Grid */}
        <div className="mt-16 sm:mt-20 relative">
          {/* Subtle Horizontal Connector Line on Desktop */}
          <div
            className="hidden lg:block absolute top-7 inset-x-8 h-px bg-black/15 z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
            {serviceProcess.map((stage, idx) => (
              <Reveal
                key={stage.number}
                as="div"
                delay={idx * 0.12}
                distance={20}
                className="group relative flex flex-col justify-between rounded-xl border border-black/10 bg-white/90 p-6 sm:p-7 shadow-xs backdrop-blur-sm transition-all duration-300 hover:border-black/30 hover:shadow-md hover:-translate-y-1"
              >
                {/* Precision Corner Crosshair */}
                <GridCrosshairMarker className="absolute top-2.5 right-2.5 text-black/30 group-hover:text-burgundy transition-colors" />

                <div>
                  {/* Step Header with Node & Glyph */}
                  <div className="flex items-center justify-between pb-4 border-b border-black/8">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-7 place-items-center rounded-full bg-black text-white font-mono text-xs font-bold transition-colors group-hover:bg-burgundy">
                        {stage.number}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-wider text-black/45">
                        {stage.timeline}
                      </span>
                    </div>

                    <div className="h-6 w-6 text-black/50 transition-transform group-hover:scale-110 group-hover:text-burgundy">
                      <ProcessStepGlyph step={idx + 1} className="h-full w-full" />
                    </div>
                  </div>

                  {/* Stage Title & Tagline */}
                  <h3 className="mt-6 text-2xl font-light text-ink group-hover:text-burgundy transition-colors">
                    {stage.name}
                  </h3>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-burgundy font-medium">
                    {stage.tagline}
                  </p>

                  {/* Summary */}
                  <p className="mt-4 text-xs sm:text-sm font-light leading-relaxed text-ink-2">
                    {stage.summary}
                  </p>
                </div>

                {/* Deliverables Mini-Pills */}
                <div className="mt-6 pt-4 border-t border-black/6">
                  <p className="font-mono text-xs uppercase tracking-wider text-black/40 mb-2">
                    TYPICAL OUTPUTS
                  </p>
                  <ul className="space-y-1.5">
                    {stage.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-xs font-mono text-black/70"
                      >
                        <span className="h-1 w-1 rounded-full bg-burgundy/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-12 flex items-center justify-between border-t border-black/10 pt-4 text-xs font-mono text-black/40">
          <span>FOUR-PHASE ENGAGEMENT LIFECYCLE</span>
          <span>DISCIPLINE &middot; DISCOVERY &middot; DOMINANCE</span>
        </div>
      </Container>
    </section>
  );
}

