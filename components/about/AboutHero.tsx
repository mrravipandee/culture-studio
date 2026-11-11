import Image from "next/image";
import Container from "@/components/home/shared/Container";
import { aboutHero } from "@/lib/content/about";

export default function AboutHero() {
  const { eyebrow, lead, metadata, disciplines } = aboutHero;

  return (
    <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28 lg:pt-48 lg:pb-32 bg-white">
      <Container>
        {/* Eyebrow & Meta bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-6 text-xs uppercase tracking-eyebrow text-black/50">
          <span className="font-mono text-black font-medium tracking-eyebrow">
            [ {eyebrow} ]
          </span>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline font-mono">
              DIGITAL GROWTH, MARKETING &amp; CREATIVE
            </span>
            <span className="font-mono text-brand-burgundy font-semibold">
              CONTENT × CULTURE × COGNITION
            </span>
          </div>
        </div>

        {/* Hero Title & Lead */}
        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-8">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl font-light leading-[1.05] tracking-tight text-black">
              We believe brands{" "}
              <span className=" font-normal text-burgundy">
                should mean
              </span>{" "}
              something.
            </h1>
            <p className="mt-8 text-lg sm:text-xl lg:text-2xl font-light leading-relaxed text-black/75 max-w-2xl">
              {lead}
            </p>

            {/* Disciplines tags */}
            <div className="mt-10 flex flex-wrap gap-2.5">
              {disciplines.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-black/10 bg-subtle px-4 py-1.5 text-xs font-mono tracking-wider text-black/70 uppercase"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right Editorial Portrait & Practice Metadata */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-subtle shadow-sm border border-black/5">
              <Image
                src="/images/hero/detail.jpg"
                alt="CULT.URE editorial detail and craftsmanship"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="font-mono text-xs uppercase tracking-eyebrow text-white/70">
                  OUR APPROACH
                </p>
                <p className="text-xs font-light tracking-wide mt-1">
                  Strategy, creative and technology, planned as one.
                </p>
              </div>
            </div>

            {/* Practice Specs List */}
            <dl className="border-t border-black/10 pt-4 divide-y divide-black/5">
              {metadata.map((item) => (
                <div
                  key={item.label}
                  className="py-2.5 flex items-baseline justify-between text-xs"
                >
                  <dt className="font-mono uppercase tracking-eyebrow text-black/45">
                    {item.label}
                  </dt>
                  <dd className="font-medium text-black/90 text-right">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
