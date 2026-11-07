import Image from "next/image";
import Container from "@/components/home/shared/Container";
import { aboutStory } from "@/lib/content/about";

export default function AboutStory() {
  const { eyebrow, title, lead, purpose, vision, editableNotice, milestones } =
    aboutStory;

  return (
    <section className="py-24 sm:py-32 bg-white text-black border-b border-black/10">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-black/10 pb-8">
          <p className="font-mono text-xs uppercase tracking-eyebrow text-black/50">
            [ {eyebrow} ]
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] max-w-4xl">
            {title}
          </h2>
        </div>

        {/* Story Content & Imagery */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Narrative, Purpose, Vision */}
          <div className="lg:col-span-7 space-y-10">
            <p className="text-xl sm:text-2xl font-light leading-relaxed text-black/85">
              {lead}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-black/10 pt-8">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-semibold">
                  OUR PURPOSE
                </h3>
                <p className="mt-3 text-sm sm:text-base font-light leading-relaxed text-black/70">
                  {purpose}
                </p>
              </div>

              <div>
                <h3 className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-semibold">
                  OUR VISION
                </h3>
                <p className="mt-3 text-sm sm:text-base font-light leading-relaxed text-black/70">
                  {vision}
                </p>
              </div>
            </div>

            {/* Editable Content Badge / Notice */}
            <div className="rounded-lg border border-line bg-subtle p-5">
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-black/60 uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-burgundy" />
                <span>STUDIO TRANSPARENCY NOTE</span>
              </div>
              <p className="mt-2 text-xs text-ink-3 font-mono leading-relaxed">
                {editableNotice}
              </p>
            </div>

            {/* Evolution Phases */}
            <div className="border-t border-black/10 pt-8">
              <h4 className="font-mono text-xs uppercase tracking-eyebrow text-black/50 mb-6">
                EVOLUTION PHASES
              </h4>
              <div className="space-y-6">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.phase}
                    className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 pb-5 border-b border-black/5 last:border-0"
                  >
                    <span className="font-mono text-xs font-medium text-black/40 min-w-20">
                      {milestone.phase}
                    </span>
                    <div>
                      <h5 className="text-base font-medium text-black">
                        {milestone.label}
                      </h5>
                      <p className="mt-1 text-sm font-light text-black/65">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Framing */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-subtle shadow-sm border border-black/5">
              <Image
                src="/images/hero/portrait.jpg"
                alt="Editorial portrait representing leadership craft"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover grayscale contrast-105 transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="font-mono text-xs uppercase tracking-eyebrow text-white/70">
                  THE HUMAN ELEMENT
                </p>
                <p className="text-sm font-light tracking-wide mt-1">
                  &ldquo;A steady, recognizable voice outlasts any single algorithmic cycle.&rdquo;
                </p>
              </div>
            </div>

            <p className="font-mono text-xs uppercase tracking-eyebrow text-black/40 text-center">
              CULT.URE STUDIO ARCHIVE &mdash; FIGURE 01
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

