import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/Arrow";
import { Button } from "@/components/ui/site-button";
import { selectedWork } from "@/lib/content/selected-work";
import { caseStudyCategory, type CaseStudy } from "@/lib/content/case-studies";
import { getPublishedCaseStudies } from "@/lib/case-studies/public";
import ProjectVisual from "@/components/case-studies/ProjectVisual";
import Container from "../shared/Container";
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
  project: CaseStudy;
  featured: boolean;
  span: string;
  index: number;
}) {
  const [keyFigure] = project.figures;

  return (
    <li className={span}>
      <Reveal as="div" delay={(index % 2) * 0.1} distance={24} viewport={{ once: true, margin: "120px 0px 0px 0px" }}>
        <Link href={`/case-studies/${project.slug}`} className="group block">
          <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-black/10 bg-white/80 p-5 backdrop-blur-sm transition-[transform,border-color,background-color] duration-500 ease-editorial hover:-translate-y-1 hover:border-black/30 hover:bg-white">
            {/* Precision corner crosshairs */}
            <GridCrosshairMarker className="absolute top-2 left-2 text-black/40" />
            <GridCrosshairMarker className="absolute top-2 right-2 text-black/40" />

            {/* Card Header Metadata */}
            <div className="mb-4 flex items-center justify-between border-b border-black/8 pb-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-medium text-ink-3">[{project.number}]</span>
                <span className="h-1 w-1 rounded-full bg-burgundy" />
                <span className="font-mono uppercase tracking-wider text-burgundy font-semibold">{caseStudyCategory(project)}</span>
              </div>
            </div>

            {/* Project visual */}
            <div className="relative overflow-hidden rounded-lg">
              <ProjectVisual
                project={project}
                aspect={featured ? "aspect-[16/10]" : "aspect-[4/3] md:aspect-[4/5]"}
                sizes={featured ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 40vw, 100vw"}
                className="rounded-lg"
              />

              {/* Corner seal badge */}
              <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-white/25 bg-black/60 px-3 py-1.5 backdrop-blur-md transition-opacity duration-300 group-hover:bg-black/70">
                <EditorialSealVector className="h-3.5 w-3.5 text-white/80" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/90">Case study</span>
              </div>
            </div>

            {/* Card Footer Details */}
            <div className="mt-5 flex flex-col justify-between gap-4">
              <div>
                {keyFigure && (
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-3">
                    {keyFigure.value} {keyFigure.label}
                  </p>
                )}

                <div className="mt-1 flex items-start justify-between gap-4">
                  <h3 className="heading-5 text-ink transition-colors duration-300 group-hover:text-burgundy">{project.title}</h3>
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-line-strong text-ink transition-all duration-300 ease-editorial group-hover:border-burgundy group-hover:bg-burgundy group-hover:text-paper group-hover:rotate-45"
                  >
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>

                <p className="body-6 mt-2 text-ink-2 line-clamp-2">{project.highlight}</p>
              </div>

              {/* Service labels */}
              <ul aria-label="Services" className="flex flex-wrap gap-1.5 pt-3 border-t border-black/5">
                {project.services.map((service) => (
                  <li key={service} className="rounded-full bg-subtle px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider text-ink-2">
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </Link>
      </Reveal>
    </li>
  );
}

/** Home shows at most this many featured projects (cards 01 and 04 are wide). */
const MAX_FEATURED = 4;

/**
 * 03 — Selected work: PUBLISHED case studies marked "featured" in the admin, in site order
 * (MongoDB, cached; lib/case-studies/public.ts). Drafts, archived and deleted records never
 * appear. Rendered by the Home page only while the Case Studies section is switched on.
 */
export default async function SelectedWorkSection() {
  const published = await getPublishedCaseStudies();
  const projects: CaseStudy[] = published.filter((p) => p.featured).slice(0, MAX_FEATURED);
  const total = String(published.length).padStart(2, "0");

  return (
    <section id="work" aria-labelledby="work-title" className="relative overflow-hidden py-24 sm:py-32 lg:py-36 bg-[#FCFBF9] text-ink">
      {/* Transparent Vector Architectural Backdrops */}
      <div
        className="pointer-events-none absolute -top-12 -right-16 h-[550px] w-[550px] text-burgundy opacity-[0.14] lg:h-[750px] lg:w-[750px]"
        aria-hidden="true"
      >
        <ArchitecturalDialVector className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute top-1/2 left-0 w-full text-black opacity-[0.10]" aria-hidden="true">
        <TopographicContourVector className="w-full" />
      </div>
      <div
        className="pointer-events-none absolute -bottom-24 -left-20 h-[500px] w-[500px] text-black opacity-[0.08]"
        aria-hidden="true"
      >
        <ArchitecturalDialVector className="h-full w-full" />
      </div>

      <Container className="relative z-10">
        <SectionHeading intro={selectedWork.intro} titleId="work-title" />

        {projects.length > 0 && (
          <>
            {/* Metadata strip */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-black/10 py-3.5 text-xs text-ink-3">
              <span className="font-mono uppercase tracking-[0.2em] font-medium text-black">
                [ {String(projects.length).padStart(2, "0")} OF {total} PROJECTS ]
              </span>
              <span className="font-mono uppercase tracking-wider">Brand Strategy · Content · Growth · Technology</span>
            </div>

            {/* Project Cards Grid */}
            <ul className="mt-12 grid items-start gap-8 sm:gap-10 md:grid-cols-12 md:gap-x-8 lg:mt-16">
              {projects.map((project, index) => (
                <ProjectCard key={project.slug} project={project} index={index} {...layoutFor(index)} />
              ))}
            </ul>
          </>
        )}

        <div className="mt-12 flex justify-start md:justify-end lg:mt-16">
          <Button href={selectedWork.cta.href} variant="secondary" icon="arrow">
            {selectedWork.cta.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
