import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { featuredProject } from "@/lib/content/case-studies";
import { RippleButton } from "@/registry/magicui/ripple-button";
import ScrollReveal from "@/components/home/shared/ScrollReveal";
import Container from "@/components/home/shared/Container";

export default function FeaturedProject() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <Container>
        <ScrollReveal>
          {/* Header Tag */}
          <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-10">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#240C0E] font-medium">
              [ 01 / FEATURED ENGAGEMENT ]
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400">
              {featuredProject.year}
            </span>
          </div>

          {/* Featured Card */}
          <article className="group grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
            {/* Image Column */}
            <div className="lg:col-span-7">
              <Link
                href={`/case-studies/${featuredProject.slug}`}
                className="block relative overflow-hidden rounded-xl bg-neutral-100 aspect-[16/10] shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
              >
                <Image
                  src={featuredProject.image.src}
                  alt={featuredProject.image.alt}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  priority
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  aria-hidden="true"
                />
              </Link>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#240C0E] font-medium">
                  {featuredProject.category}
                </span>
                <span className="text-neutral-300">•</span>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
                  {featuredProject.clientType}
                </span>
              </div>

              <h2 className="mt-4 text-3xl sm:text-5xl font-light tracking-[-0.02em] text-black leading-tight">
                <Link
                  href={`/case-studies/${featuredProject.slug}`}
                  className="hover:text-[#240C0E] transition-colors"
                >
                  {featuredProject.title}
                </Link>
              </h2>

              <p className="mt-6 text-base md:text-lg font-light leading-relaxed text-neutral-600">
                {featuredProject.description}
              </p>

              {/* Deliverables Pills */}
              <div className="mt-8 flex flex-wrap gap-2">
                {featuredProject.deliverables.map((item) => (
                  <span
                    key={item}
                    className="inline-block rounded-full border border-black/10 bg-neutral-50 px-3.5 py-1 text-[11px] uppercase tracking-[0.14em] text-neutral-700"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <div className="mt-10">
                <RippleButton
                  href={`/case-studies/${featuredProject.slug}`}
                  rippleColor="rgba(255, 255, 255, 0.45)"
                  className="group/btn inline-flex items-center gap-3 rounded-full bg-[#240C0E] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.18em] !text-white transition-all duration-300 hover:bg-[#3A1518] hover:shadow-[0_8px_25px_rgba(36,12,14,0.25)]"
                >
                  <span>Explore Case Study</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    size={16}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                  />
                </RippleButton>
              </div>
            </div>
          </article>
        </ScrollReveal>
      </Container>
    </section>
  );
}
