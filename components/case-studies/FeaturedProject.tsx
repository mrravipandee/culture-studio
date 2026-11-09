import Image from "next/image";
import { ServiceTags, SampleBadge } from "@/components/case-studies/ServiceTags";
import { categoryOf } from "@/lib/content/service-catalog";
import Link from "next/link";
import { featuredProject } from "@/lib/content/case-studies";
import { Button } from "@/components/ui/site-button";
import ScrollReveal from "@/components/home/shared/ScrollReveal";
import Container from "@/components/home/shared/Container";

export default function FeaturedProject() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <Container>
        <ScrollReveal>
          {/* Header Tag */}
          <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-10">
            <span className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
              [ 01 / FEATURED ENGAGEMENT ]
            </span>
            <span className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
              {featuredProject.year}
            </span>
          </div>

          {/* Featured Card */}
          <article className="group grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
            {/* Image Column */}
            <div className="lg:col-span-7">
              <Link
                href={`/case-studies/${featuredProject.slug}`}
                className="block relative overflow-hidden rounded-xl bg-subtle aspect-[16/10] shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
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
                <span className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
                  {categoryOf(featuredProject.services[0]).name}
                </span>
                <span className="text-ink-4">•</span>
                <span className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
                  {featuredProject.clientType}
                </span>
              </div>

              <h2 className="mt-4 text-3xl sm:text-5xl font-light tracking-heading text-black leading-tight">
                <Link
                  href={`/case-studies/${featuredProject.slug}`}
                  className="hover:text-burgundy transition-colors"
                >
                  {featuredProject.title}
                </Link>
              </h2>

              <p className="mt-6 text-base md:text-lg font-light leading-relaxed text-ink-2">
                {featuredProject.description}
              </p>

              {/* Official services involved */}
              <ServiceTags ids={featuredProject.services} className="mt-8" />
              {featuredProject.placeholder && <SampleBadge className="mt-6 self-start" />}

              {/* Action Button */}
              <div className="mt-10">
                <Button href={`/case-studies/${featuredProject.slug}`} variant="burgundy" icon="arrow">
                  Explore case study
                </Button>
              </div>
            </div>
          </article>
        </ScrollReveal>
      </Container>
    </section>
  );
}

