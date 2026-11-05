import Link from "next/link";

export default function HomeHero() {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between px-6 pt-28 pb-16 md:px-12 md:pt-36 md:pb-24 max-w-7xl mx-auto">
      {/* Top Editorial Identifier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-[#240c0e] font-medium">
          [ Personal Branding Agency ]
        </span>
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-mono">
          Est. 2026 &mdash; Global Practice
        </span>
      </div>

      {/* Center Cinematic Editorial Statement */}
      <div className="my-auto py-12 md:py-20 max-w-5xl">
        <p className="text-xs md:text-sm font-mono tracking-[0.3em] uppercase text-neutral-400 mb-6">
          Beyond the noise. Into the culture.
        </p>

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[-0.03em] leading-[1.05] text-black">
          We shape iconic reputations for leaders who{" "}
          <span className="font-serif italic font-normal text-[#240c0e]">
            define eras
          </span>
          .
        </h1>

        <p className="mt-8 md:mt-12 text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl font-light leading-relaxed">
          CULT.URE engineers strategic narrative, elevated visual resonance,
          and cultural authority for high-impact founders, creators, and executives.
        </p>

        {/* Action Row */}
        <div className="mt-10 md:mt-14 flex flex-wrap items-center gap-6">
          <Link
            href="/case-studies"
            className="group inline-flex items-center gap-3 rounded-full bg-black px-8 py-4 text-xs uppercase tracking-[0.2em] text-white hover:bg-[#240c0e] transition-all"
          >
            <span>Explore Case Studies</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>

          <Link
            href="/about"
            className="text-xs uppercase tracking-[0.2em] text-neutral-700 hover:text-black transition-colors underline-offset-8 hover:underline py-2"
          >
            Our Philosophy
          </Link>
        </div>
      </div>

      {/* Bottom Metrics / Editorial Footer Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-black/10 text-xs">
        <div>
          <span className="block font-mono text-neutral-400 uppercase tracking-widest mb-1">
            01 / Narrative Architecture
          </span>
          <p className="text-neutral-700 leading-relaxed">
            Positioning personal story at the exact inflection point of industry shift.
          </p>
        </div>
        <div>
          <span className="block font-mono text-neutral-400 uppercase tracking-widest mb-1">
            02 / Cultural Resonance
          </span>
          <p className="text-neutral-700 leading-relaxed">
            Moving beyond synthetic vanity metrics into enduring prestige and pull.
          </p>
        </div>
        <div>
          <span className="block font-mono text-neutral-400 uppercase tracking-widest mb-1">
            03 / Executive Presence
          </span>
          <p className="text-neutral-700 leading-relaxed">
            Multi-platform distribution driven by precision editorial craftsmanship.
          </p>
        </div>
      </div>
    </section>
  );
}

