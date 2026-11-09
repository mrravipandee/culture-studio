import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/Arrow";
import { Button } from "@/components/ui/site-button";
import { selectedWork, type Project } from "@/lib/content/home";
import { categoryOf, services } from "@/lib/content/service-catalog";
import Container from "../shared/Container";
import ImageFrame from "../shared/ImageFrame";
import SectionHeading from "../shared/SectionHeading";
import { Reveal } from "@/components/motion";
import {
  ArchitecturalDialVector,
  TopographicContourVector,
  EditorialSealVector,
  GridCrosshairMarker,
} from "../shared/WorkVectors";

/**
 * Editorial rhythm:
 * Card 01: 7 cols wide (Featured anchor)
 * Card 02: 5 cols
 * Card 03: 5 cols
 * Card 04: 7 cols wide
 */
function layoutFor(index: number) {
  const isWide = index === 0 || index === 3;
  return {
    featured: isWide,
    span: isWide ? "md:col-span-7" : "md:col-span-5",
  };
}

function ProjectCard({
  project,
  featured,
  span,
  index,
}: {
  project: Project;
  featured: boolean;
  span: string;
  index: number;
}) {
  const indexFormatted = String(index + 1).padStart(2, "0");

  const cardContent = (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-black/10 bg-white/80 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all duration-500 hover:border-black/30 hover:bg-white hover:shadow-[0_20px_40px_rgba(36,12,14,0.08)]">
      {/* Precision corner crosshairs */}
      <GridCrosshairMarker className="absolute top-2 left-2 text-black/40" />
      <GridCrosshairMarker className="absolute top-2 right-2 text-black/40" />

      {/* Card Header Metadata */}
      <div className="mb-4 flex items-center justify-between border-b border-black/8 pb-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono font-medium text-black/50">
            [{indexFormatted}]
          </span>
          <span className="h-1 w-1 rounded-full bg-burgundy" />
          <span className="font-mono uppercase tracking-wider text-burgundy font-semibold">
            {categoryOf(project.services[0]).name}
          </span>
        </div>
        {project.year && (
          <span className="font-mono text-black/45 tracking-wider">
            {project.year}
          </span>
        )}
      </div>

      {/* Image Media Frame with Hover Reveal */}
      <div className="relative overflow-hidden rounded-lg">
        <ImageFrame
          image={project.image}
          aspect={featured ? "aspect-[16/10]" : "aspect-[4/3] md:aspect-[4/5]"}
          sizes={
            featured
              ? "(min-width: 768px) 58vw, 100vw"
              : "(min-width: 768px) 40vw, 100vw"
          }
          className="rounded-lg transition-transform duration-700 ease-editorial group-hover:scale-[1.02]"
          scrollScale
        />

        {/* Transparent Corner Seal Vector Badge */}
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 backdrop-blur-md transition-opacity duration-300 group-hover:bg-black/60">
          <EditorialSealVector className="h-3.5 w-3.5 text-white/80" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/90">
            {project.placeholder ? "Sample project" : "Case study"}
          </span>
        </div>
      </div>

      {/* Card Footer Details */}
      <div className="mt-5 flex flex-col justify-between gap-4">
        <div>
          {project.scope && (
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-black/50">
              {project.scope}
            </p>
          )}

          <div className="mt-1 flex items-start justify-between gap-4">
            <h3 className="heading-5 text-ink transition-colors duration-300 group-hover:text-burgundy">
              {project.title}
            </h3>
            {project.href && (
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-line-strong text-ink transition-all duration-300 ease-editorial group-hover:border-burgundy group-hover:bg-burgundy group-hover:text-paper group-hover:rotate-45"
              >
                <ArrowUpRight className="size-4" />
              </span>
            )}
          </div>

          <p className="body-6 mt-2 text-ink-2 line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Deliverables / Tags Pills */}
        {project.services.length > 0 && (
          <ul aria-label="Services" className="flex flex-wrap gap-1.5 pt-3 border-t border-black/5">
            {project.services.map((id) => (
              <li
                key={id}
                className="rounded-full bg-subtle px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider text-ink-2"
              >
                {services[id].name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );

  return (
    <li className={span}>
      <Reveal
        as="div"
        delay={(index % 2) * 0.1}
        distance={24}
        viewport={{ once: true, margin: "120px 0px 0px 0px" }}
      >
        {project.href ? (
          <Link href={project.href} className="group block focus:outline-none">
            {cardContent}
          </Link>
        ) : (
          cardContent
        )}
      </Reveal>
    </li>
  );
}

/** 03 — Selected work: proof, placed right after what we do. */
export default function SelectedWorkSection() {
  const { projects } = selectedWork;

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="relative overflow-hidden py-24 sm:py-32 lg:py-36 bg-[#FCFBF9] text-ink"
    >
      {/* Transparent Vector Architectural Backdrops */}
      <div
        className="pointer-events-none absolute -top-12 -right-16 h-[550px] w-[550px] text-burgundy opacity-[0.14] lg:h-[750px] lg:w-[750px]"
        aria-hidden="true"
      >
        <ArchitecturalDialVector className="h-full w-full" />
      </div>

      <div
        className="pointer-events-none absolute top-1/2 left-0 w-full text-black opacity-[0.10]"
        aria-hidden="true"
      >
        <TopographicContourVector className="w-full" />
      </div>

      <div
        className="pointer-events-none absolute -bottom-24 -left-20 h-[500px] w-[500px] text-black opacity-[0.08]"
        aria-hidden="true"
      >
        <ArchitecturalDialVector className="h-full w-full" />
      </div>

      <Container className="relative z-10">
        {/* Section Heading */}
        <SectionHeading intro={selectedWork.intro} titleId="work-title" />

        {/* Archival Practice Metadata Strip */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-black/10 py-3.5 text-xs text-black/55">
          <div className="flex items-center gap-6">
            <span className="font-mono uppercase tracking-[0.2em] font-medium text-black">
              [ ARCHIVE: 04 MONOGRAPHS ]
            </span>
            <span className="hidden sm:inline font-mono tracking-wider">
              GLOBAL LEADERSHIP PORTFOLIO
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider">
            <span className="inline-block h-2 w-2 rounded-full bg-burgundy animate-pulse" />
            <span className="text-burgundy font-medium">SAMPLE PROJECTS</span>
            <span className="text-black/30">/</span>
            <span>DETAILS TO BE CONFIRMED</span>
          </div>
        </div>

        {/* Project Cards Grid */}
        <ul className="mt-12 grid items-start gap-8 sm:gap-10 md:grid-cols-12 md:gap-x-8 lg:mt-16">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              {...layoutFor(index)}
            />
          ))}
        </ul>

        {/* Bottom Editorial Banner & Action */}
        <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-xl border border-black/10 bg-white/70 p-8 backdrop-blur-sm sm:flex-row sm:items-center lg:mt-24">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-burgundy font-semibold">
              About these projects
            </p>
            <p className="mt-2 text-sm sm:text-base font-light text-ink-2 leading-relaxed">
              These are sample entries that show how our case studies are
              structured. Confirmed client work will replace them.
            </p>
          </div>

          <Button
            href={selectedWork.cta.href}
            variant="secondary"
            icon="arrow"
            className="shrink-0 rounded-full border border-black/15 bg-white px-7 py-3 text-xs uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all duration-300"
          >
            {selectedWork.cta.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
