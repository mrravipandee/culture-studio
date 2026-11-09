import { processSteps } from "@/lib/content/home";
import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import {
  ProcessStepGlyph,
  ArchitecturalDialVector,
  GridCrosshairMarker,
} from "../shared/WorkVectors";

/** 04 — Process: four ordered steps, a row on desktop. */
export default function ProcessSection() {
  const steps = processSteps.steps;

  return (
    <section
      id="process"
      aria-labelledby="process-title"
      className="relative overflow-hidden py-24 sm:py-32 lg:py-36 bg-[#FCFBF9] text-ink"
    >
      {/* Background Architectural Vector Watermark */}
      <div
        className="pointer-events-none absolute -top-20 -right-24 h-[600px] w-[600px] text-burgundy opacity-[0.11] lg:h-[750px] lg:w-[750px]"
        aria-hidden="true"
      >
        <ArchitecturalDialVector className="h-full w-full" />
      </div>

      <Container className="relative z-10">
        {/* Section Heading */}
        <SectionHeading intro={processSteps.intro} titleId="process-title" />

        {/* Process Meta Strip */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-black/10 py-3.5 text-xs text-black/55">
          <div className="flex items-center gap-4">
            <span className="font-mono uppercase tracking-[0.2em] font-medium text-black">
              [ METHODOLOGY: 04 STAGES ]
            </span>
            <span className="hidden sm:inline font-mono tracking-wider text-black/45">
              THE ENDURING LEADERSHIP CONTINUUM
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider">
            <span className="inline-block h-2 w-2 rounded-full bg-burgundy animate-pulse" />
            <span className="text-burgundy font-medium">DISCOVER → EVOLVE</span>
            <span className="text-black/30">/</span>
            <span>SYSTEMATIC IMPACT</span>
          </div>
        </div>

        {/* 4 Process Cards Grid */}
        <RevealGroup
          as="ol"
          count={steps.length}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6"
        >
          {steps.map((step, index) => {
            const stepNumber = String(index + 1).padStart(2, "0");
            const stepData = step as {
              title: string;
              body: string;
              tagline?: string;
              deliverables?: string[];
            };

            return (
              <RevealItem
                as="li"
                key={step.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-black/10 bg-white/85 p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-sm transition-all duration-500 hover:border-black/30 hover:bg-white hover:shadow-[0_16px_36px_rgba(36,12,14,0.06)] hover:-translate-y-1"
              >
                {/* Subtle top accent line draw on hover */}
                <span
                  className="absolute inset-x-0 top-0 h-[2px] bg-burgundy scale-x-0 transition-transform duration-500 ease-editorial origin-left group-hover:scale-x-100"
                  aria-hidden="true"
                />

                {/* Corner Crosshairs */}
                <GridCrosshairMarker className="absolute top-2.5 right-2.5 text-black/35 group-hover:text-burgundy transition-colors" />

                <div>
                  {/* Step Header: Step Number & Vector Glyph */}
                  <div className="flex items-center justify-between pb-6 border-b border-black/8">
                    <span className="font-mono text-xs uppercase tracking-[0.25em] text-black/50 group-hover:text-burgundy transition-colors font-medium">
                      STEP {stepNumber}
                    </span>

                    <div className="h-8 w-8 text-black/60 transition-all duration-300 group-hover:text-burgundy group-hover:scale-110">
                      <ProcessStepGlyph step={index + 1} className="h-full w-full" />
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div className="mt-8">
                    <h3 className="heading-4 text-ink transition-colors duration-300 group-hover:text-burgundy">
                      {step.title}
                    </h3>
                    {stepData.tagline && (
                      <p className="mt-1.5 font-mono text-xs uppercase tracking-[0.18em] text-burgundy font-medium">
                        {stepData.tagline}
                      </p>
                    )}
                  </div>

                  {/* Step Body Description */}
                  <p className="body-6 mt-4 text-ink-2 leading-relaxed font-light">
                    {step.body}
                  </p>
                </div>

                {/* Deliverables / Outputs Pills */}
                {stepData.deliverables && stepData.deliverables.length > 0 && (
                  <div className="mt-8 pt-5 border-t border-black/6">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-black/40 mb-2.5">
                      Typical outputs
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {stepData.deliverables.map((item) => (
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
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>

        {/* Section Bottom Footnote */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-black/10 pt-6 text-xs text-black/45 sm:flex-row">
          <span className="font-mono tracking-wider">
            CULT.URE METHODOLOGY &mdash; BEYOND THE NOISE
          </span>
          <span className="font-mono tracking-wider">
            DISCOVER · DEFINE · CREATE · EVOLVE
          </span>
        </div>
      </Container>
    </section>
  );
}
