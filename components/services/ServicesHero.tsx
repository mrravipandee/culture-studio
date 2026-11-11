import { servicesHero } from "@/lib/content/services";
import ScrollCue from "@/components/motion/ScrollCue";
import Container from "@/components/home/shared/Container";
import { ArchitecturalDialVector, GridCrosshairMarker } from "@/components/home/shared/WorkVectors";

export default function ServicesHero() {
  const { eyebrow, headline, supportingCopy, meta } = servicesHero;
  const [lineOne, lineTwo] = headline.split("\n");

  return (
    <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28 lg:pt-52 lg:pb-36 bg-[#FCFBF9] text-ink border-b border-black/10">
      {/* Background Architectural Vector Graphic */}
      <div
        className="pointer-events-none absolute -top-16 -right-20 h-[600px] w-[600px] text-burgundy opacity-[0.12] lg:h-[800px] lg:w-[800px]"
        aria-hidden="true"
      >
        <ArchitecturalDialVector className="h-full w-full" />
      </div>

      <Container className="relative z-10">
        {/* Top Eyebrow & Archival Practice Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-6 text-xs uppercase tracking-[0.25em] text-ink-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-black font-semibold">
              [ {eyebrow} ]
            </span>
            <span className="h-1 w-1 rounded-full bg-burgundy" />
            <span className="font-mono text-burgundy font-medium hidden sm:inline">
              FOUR DISCIPLINES &middot; NINE SERVICES
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <span>DIGITAL GROWTH</span>
            <span aria-hidden="true" className="text-black/30">/</span>
            <span className="text-burgundy font-semibold">MARKETING &amp; CREATIVE</span>
          </div>
        </div>

        {/* Oversized Asymmetric Display Headline */}
        <div className="mt-12 lg:mt-18 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-8 relative">
            <GridCrosshairMarker className="absolute -top-6 -left-3 text-burgundy" />
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-light leading-[1.03] tracking-tight text-ink">
              <span className="text-burgundy">{lineOne}</span>
              <br />
              {lineTwo}
            </h1>

            <p className="mt-8 text-lg sm:text-xl lg:text-2xl font-light leading-relaxed text-ink-2 max-w-2xl">
              {supportingCopy}
            </p>
          </div>

          {/* Right Practice Meta Strip & Scroll Cue */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-12 lg:pt-4">
            <dl className="divide-y divide-black/8 border-y border-black/10">
              {meta.map((item) => (
                <div
                  key={item.label}
                  className="py-3 flex items-baseline justify-between text-xs font-mono"
                >
                  <dt className="uppercase tracking-[0.2em] text-ink-3">
                    {item.label}
                  </dt>
                  <dd className="font-medium text-ink text-right">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Scroll Indicator */}
            <div>
              <ScrollCue label="Scroll to explore the services" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
