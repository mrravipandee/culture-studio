import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/Arrow";
import { Button } from "@/components/ui/site-button";
import { selectedWork, type Project } from "@/lib/content/home";
import Container from "../shared/Container";
import ImageFrame from "../shared/ImageFrame";
import SectionHeading from "../shared/SectionHeading";
import { Reveal } from "@/components/motion";

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
  index,
}: {
  project: Project;
  featured: boolean;
  span: string;
  index: number;
}) {
  const body = (
    <>
      <ImageFrame
        image={project.image}
        aspect={featured ? "aspect-landscape" : "aspect-landscape md:aspect-portrait"}
        sizes={featured ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 40vw, 100vw"}
        className="rounded-lg"
        scrollScale
      />
      <div className="mt-6 flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow text-burgundy">{project.category}</p>
          <h3 className="heading-5 mt-3 text-ink">{project.title}</h3>
          <p className="body-6 mt-2 max-w-md text-ink-2">{project.description}</p>
        </div>
        {project.href && (
          <span
            aria-hidden="true"
            className="mt-1 grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-ink transition-colors duration-300 ease-editorial group-hover:border-burgundy group-hover:bg-burgundy group-hover:text-paper"
          >
            <ArrowUpRight className="btn-arrow size-4" />
          </span>
        )}
      </div>
    </>
  );

  return (
    <li className={span}>
      <Reveal as="article" delay={(index % 2) * 0.1}>
        {project.href ? (
          <Link href={project.href} className="group block rounded-lg">
            {body}
          </Link>
        ) : (
          body
        )}
      </Reveal>
    </li>
  );
}

/** 03 — Selected work: proof, placed right after what we do. */
export default function SelectedWorkSection() {
  const { projects } = selectedWork;

  return (
    <section id="work" aria-labelledby="work-title" className="section surface-subtle">
      <Container>
        <SectionHeading intro={selectedWork.intro} titleId="work-title" />

        <ul className="mt-16 grid items-start gap-16 md:grid-cols-12 md:gap-x-8 lg:mt-24">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              {...layoutFor(index, projects.length)}
            />
          ))}
        </ul>

        <div className="mt-16 flex justify-start border-t border-line pt-8 md:justify-end">
          <Button href={selectedWork.cta.href} variant="secondary" icon="arrow">
            {selectedWork.cta.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
