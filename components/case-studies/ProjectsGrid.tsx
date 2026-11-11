import Image from "next/image";
import { ServiceTags, SampleBadge } from "@/components/case-studies/ServiceTags";
import { categoryOf } from "@/lib/content/service-catalog";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { caseStudiesList, type CaseStudy } from "@/lib/content/case-studies";
import { ClipReveal, Reveal, TextMask } from "@/components/motion";
import Container from "@/components/home/shared/Container";

function GridCard({ project, index }: { project: CaseStudy; index: number }) {
  // Asymmetric rhythm: alternate layout heights and padding
  const isTall = index % 3 === 0;

  return (
    <article className="group flex flex-col justify-between">
        <Link
          href={`/case-studies/${project.slug}`}
          className={`block relative overflow-hidden rounded-xl bg-subtle ${
            isTall ? "aspect-[4/3] md:aspect-[4/3]" : "aspect-[16/11]"
          }`}
        >
          <ClipReveal className="h-full w-full" delay={(index % 2) * 0.1}>
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-1100 ease-editorial group-hover:scale-[1.03]"
          />
          </ClipReveal>
        </Link>

        {/* Metadata + Title */}
        <Reveal delay={(index % 2) * 0.1 + 0.15} className="mt-6 flex flex-col">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
              {categoryOf(project.services[0]).name}
            </span>
            <span className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
              {project.year}
            </span>
          </div>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-light tracking-heading text-black">
                <Link
                  href={`/case-studies/${project.slug}`}
                  className="hover:text-burgundy transition-colors"
                >
                  {project.title}
                </Link>
              </h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-eyebrow text-ink-3">
                {project.clientType}
              </p>
            </div>

            <Link
              href={`/case-studies/${project.slug}`}
              className="mt-1 h-9 w-9 shrink-0 rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 group-hover:bg-burgundy group-hover:text-white group-hover:border-burgundy"
              aria-label={`View ${project.title} case study`}
            >
              <ArrowUpRight
                aria-hidden="true"
                size={16}
                strokeWidth={1.5}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <p className="mt-3 text-sm font-light leading-relaxed text-ink-2 line-clamp-2">
            {project.description}
          </p>

          {/* Official services involved */}
          <ServiceTags ids={project.services} className="mt-4" />
          {project.placeholder && <SampleBadge className="mt-4 self-start" />}
        </Reveal>
    </article>
  );
}

export default function ProjectsGrid() {
  return (
    <section className="py-20 md:py-32 bg-subtle border-t border-b border-black/10">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-black/10">
            <div>
              <span className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
                [ 02 / ARCHIVE ]
              </span>
              <TextMask as="h2" text="More projects" className="mt-4 text-3xl sm:text-5xl font-light tracking-heading text-black" />
            </div>
            <p className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
              {caseStudiesList.every((p) => p.placeholder)
                ? `${caseStudiesList.length} sample projects · details to be confirmed`
                : `${caseStudiesList.length} projects`}
            </p>
          </div>

        {/* 2-Column Asymmetric Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {caseStudiesList.map((project, index) => (
            <GridCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

