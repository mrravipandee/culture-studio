import { capabilities } from "@/lib/content/services";
import Container from "@/components/home/shared/Container";
import { RevealGroup, RevealItem } from "@/components/motion";
import { GridCrosshairMarker } from "@/components/home/shared/WorkVectors";

export default function CapabilitiesSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40 bg-white text-ink border-b border-black/10">
      <Container>
        {/* Section Header */}
        <div className="border-b border-black/10 pb-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-burgundy font-semibold">
            [ 04 / DELIVERABLES &amp; CAPABILITIES ]
          </p>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <h2 className="lg:col-span-8 text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.08] text-ink">
              Every deliverable is crafted as an{" "}
              <span className="font-serif italic font-normal text-burgundy">
                enduring intellectual asset.
              </span>
            </h2>
            <p className="lg:col-span-4 text-sm sm:text-base font-light text-ink-2 leading-relaxed">
              We reject formulaic social media collateral. Our studio operates as
              a hybrid of an executive publishing house, creative atelier, and
              cognitive distribution engine.
            </p>
          </div>
        </div>

        {/* Numbered Deliverable Groups (Editorial Divider Layout, not generic cards) */}
        <RevealGroup
          as="div"
          count={capabilities.length}
          className="divide-y divide-black/10 border-b border-black/10 mt-12 lg:mt-16"
        >
          {capabilities.map((group) => (
            <RevealItem
              as="article"
              key={group.number}
              className="group py-12 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start transition-colors duration-300 hover:bg-[#FAF7F2]/40 px-2 sm:px-4 rounded-lg"
            >
              {/* Group Number & Category */}
              <div className="md:col-span-3 flex md:flex-col justify-between items-baseline md:items-start gap-4">
                <span className="font-mono text-2xl sm:text-3xl font-light text-black/30 group-hover:text-burgundy transition-colors">
                  {group.number}
                </span>
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-burgundy font-semibold">
                    {group.category}
                  </h3>
                  <GridCrosshairMarker className="mt-2 text-black/30 hidden md:block" />
                </div>
              </div>

              {/* Headline & Description */}
              <div className="md:col-span-5">
                <h4 className="text-xl sm:text-2xl font-light tracking-tight text-ink group-hover:text-black">
                  {group.headline}
                </h4>
                <p className="mt-4 text-sm sm:text-base font-light leading-relaxed text-ink-2">
                  {group.description}
                </p>
              </div>

              {/* Deliverable Items List */}
              <div className="md:col-span-4 border-t border-black/8 pt-4 md:border-t-0 md:pt-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 mb-3">
                  PRACTICE ARTIFACTS
                </p>
                <ul className="space-y-2.5">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="text-xs sm:text-sm font-light text-ink flex items-center gap-3 transition-transform duration-200 group-hover:translate-x-1"
                    >
                      <span className="h-1 w-1 rounded-full bg-burgundy shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Section Footnote */}
        <div className="mt-12 flex flex-col sm:flex-row items-baseline justify-between gap-4 text-xs font-mono text-black/45">
          <span>04 PRACTICE DIVISIONS &middot; BESPOKE STUDIO ENGAGEMENTS</span>
          <span>NO RETAINERS FOR MERE VOLUME &middot; QUALITY OVER NOISE</span>
        </div>
      </Container>
    </section>
  );
}
