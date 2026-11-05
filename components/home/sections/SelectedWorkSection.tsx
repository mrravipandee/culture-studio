import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RippleButton } from "@/registry/magicui/ripple-button";
import { selectedWork, type Project } from "@/lib/content/home";
import Container from "../shared/Container";
import ImageFrame from "../shared/ImageFrame";
import SectionHeading from "../shared/SectionHeading";

/**
 * Editorial rhythm: rows alternate 7+5 / 5+7 columns.
 * A lone final card is offset to the right to keep the grid asymmetric.
 */
function layoutFor(index: number, total: number) {
  const row = Math.floor(index / 2);
  const wide = (row % 2 === 0) === (index % 2 === 0);
  const lone = index === total - 1 && index % 2 === 0;
  if (lone && index > 0) return { featured: true, span: "md:col-span-7 md:col-start-6" };
  return { featured: wide, span: wide ? "md:col-span-7" : "md:col-span-5" };
}

function ProjectCard({
  project,
  featured,
  span,
}: {
  project: Project;
  featured: boolean;
  span: string;
}) {
  const body = (
    <>
      <ImageFrame
        image={project.image}
        aspect={featured ? "aspect-[4/3] md:aspect-[16/10]" : "aspect-[4/3]"}
        sizes={featured ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 40vw, 100vw"}
      />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-burgundy">
            {project.category}
          </p>
          <h3 className="mt-2 text-2xl font-light tracking-[-0.02em] text-black">
            {project.title}
            {project.placeholder && (
              <span className="ml-3 inline-block translate-y-[-3px] border border-black/15 px-2 py-0.5 align-middle font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Sample
              </span>
            )}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-600">
            {project.description}
          </p>
        </div>
        {project.href && (
          <ArrowUpRight
            aria-hidden="true"
            size={20}
            strokeWidth={1.5}
            className="mt-1 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        )}
      </div>
    </>
  );

  return (
    <li className={span}>
      <article>
        {project.href ? (
          <Link href={project.href} className="group block">
            {body}
          </Link>
        ) : (
          body
        )}
      </article>
    </li>
  );
}

/** 05 — Selected work. Sample entries are labelled until real case studies exist. */
export default function SelectedWorkSection() {
  const { projects } = selectedWork;

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="section-padding scroll-mt-24 bg-neutral-50"
    >
      <Container>
        <SectionHeading intro={selectedWork.intro} titleId="work-title" />

        <ul className="mt-14 grid gap-14 md:grid-cols-12 md:gap-x-8 lg:mt-20">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              {...layoutFor(index, projects.length)}
            />
          ))}
        </ul>

        <div className="mt-14 flex justify-start border-t border-black/10 pt-8 md:justify-end">
          <RippleButton
            href={selectedWork.cta.href}
            rippleColor="rgba(0, 0, 0, 0.15)"
            className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-black px-7 text-xs uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-white"
          >
            <span>{selectedWork.cta.label}</span>
            <ArrowUpRight
              aria-hidden="true"
              size={14}
              strokeWidth={1.5}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </RippleButton>
        </div>
      </Container>
    </section>
  );
}
