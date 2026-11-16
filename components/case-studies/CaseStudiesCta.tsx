import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { caseStudiesCta, caseStudiesHero } from "@/lib/content/case-studies";
import { Reveal } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import { editorialSerif } from "./fonts";

/** Closing burgundy CTA (listing and detail pages). Links to /contact. */
export default function CaseStudiesCta() {
  const { headline } = caseStudiesCta;

  return (
    <section aria-labelledby="cs-cta-title" className="pb-20 md:pb-28">
      <Container>
        <Reveal distance={20}>
          <div className="relative isolate overflow-hidden rounded-2xl bg-[#2a0a0f] px-6 py-10 text-white sm:px-10 md:px-14 md:py-12">
            {/* Soft material texture (decorative) */}
            <Image
              src={caseStudiesHero.image.src}
              alt=""
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="-z-10 object-cover object-[50%_40%] opacity-50 mix-blend-soft-light"
            />
            <div
              aria-hidden="true"
              className="cs-cta-sheen absolute inset-0 -z-10"
            />

            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/85">{caseStudiesCta.eyebrow}</p>
                <h2
                  id="cs-cta-title"
                  className={`${editorialSerif.className} mt-4 text-[2.25rem] font-normal leading-[1.08] tracking-[-0.01em] sm:text-5xl lg:text-[3.5rem]`}
                >
                  <span className="block">{headline.before}</span>
                  <span className="block">
                    {headline.line2}
                    <em className="italic underline decoration-1 decoration-white/60 underline-offset-[0.12em]">{headline.accent}</em>
                    {headline.after}
                  </span>
                </h2>
              </div>

              <Link
                href={caseStudiesCta.ctaHref}
                className="group inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-md bg-[#faf7f2] px-6 text-[0.9375rem] font-medium text-burgundy transition-colors duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:self-auto"
              >
                {caseStudiesCta.ctaText}
                <ArrowUpRight
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.75}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
