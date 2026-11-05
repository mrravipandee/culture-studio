import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { caseStudiesList, type CaseStudy } from "@/lib/content/case-studies";
import ScrollReveal from "@/components/home/shared/ScrollReveal";
import Container from "@/components/home/shared/Container";

function GridCard({ project, index }: { project: CaseStudy; index: number }) {
  // Asymmetric rhythm: alternate layout heights and padding
  const isTall = index % 3 === 0;

  return (
    <ScrollReveal delay={index * 0.12} distance={30}>
      <article className="group flex flex-col justify-between">
        <Link
          href={`/case-studies/${project.slug}`}
          className={`block relative overflow-hidden rounded-xl bg-neutral-100 ${
            isTall ? "aspect-[4/3] md:aspect-[4/3]" : "aspect-[16/11]"
          } shadow-sm`}
        >
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            aria-hidden="true"
          />
        </Link>

        {/* Metadata + Title */}
        <div className="mt-6 flex flex-col">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#240C0E] font-medium">
              {project.category}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              {project.year}
            </span>
          </div>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-light tracking-[-0.02em] text-black">
                <Link
                  href={`/case-studies/${project.slug}`}
                  className="hover:text-[#240C0E] transition-colors"
                >
                  {project.title}
                </Link>
              </h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-400">
                {project.clientType}
              </p>
            </div>

            <Link
              href={`/case-studies/${project.slug}`}
              className="mt-1 h-9 w-9 shrink-0 rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#240C0E] group-hover:text-white group-hover:border-[#240C0E]"
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

          <p className="mt-3 text-sm font-light leading-relaxed text-neutral-600 line-clamp-2">
            {project.description}
          </p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {project.deliverables.map((item) => (
              <span
                key={item}
                className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 bg-neutral-100/70 px-2.5 py-0.5 rounded"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}

export default function ProjectsGrid() {
  return (
    <section className="py-20 md:py-32 bg-neutral-50 border-t border-b border-black/10">
      <Container>
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-black/10">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#240C0E] font-medium">
                [ 02 / ARCHIVE ]
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-light tracking-[-0.02em] text-black">
                Selected Engagements
              </h2>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
              Showing 04 of 04 Published Works
            </p>
          </div>
        </ScrollReveal>

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
