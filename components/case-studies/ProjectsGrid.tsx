import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { caseStudyCategory, type CaseStudy } from "@/lib/content/case-studies";
import { ClipReveal, Reveal, TextMask } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import ProjectVisual from "./ProjectVisual";

/** Image-led project card: the whole card is one link (stretched over the article). */
function GridCard({ project, index }: { project: CaseStudy; index: number }) {
  // Asymmetric rhythm: alternate image heights
  const isTall = index % 3 === 0;
  const href = `/case-studies/${project.slug}`;

  return (
    <article className="group relative flex flex-col">
      <ClipReveal className="rounded-xl" delay={(index % 2) * 0.1}>
        <ProjectVisual
          project={project}
          aspect={isTall ? "aspect-[4/3]" : "aspect-[16/11]"}
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </ClipReveal>

      <Reveal delay={(index % 2) * 0.1 + 0.15} className="mt-6 flex flex-col">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
            {caseStudyCategory(project)}
          </span>
          <span className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">{project.number}</span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-4">
          <h3 className="text-2xl sm:text-3xl font-light tracking-heading text-black transition-colors group-hover:text-burgundy">
            <Link href={href} className="after:absolute after:inset-0 after:content-['']">
              {project.title}
            </Link>
          </h3>
          <span
            aria-hidden="true"
            className="mt-1 h-9 w-9 shrink-0 rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 group-hover:bg-burgundy group-hover:text-white group-hover:border-burgundy"
          >
            <ArrowUpRight size={16} strokeWidth={1.5} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>

        <p className="mt-3 text-sm sm:text-base font-light leading-relaxed text-ink-2">{project.highlight}</p>
      </Reveal>
    </article>
  );
}

interface ProjectsGridProps {
  projects: CaseStudy[];
  /** Section index and label, e.g. "02" and "SELECTED PROJECTS". */
  index: string;
  eyebrow: string;
  title: string;
  /** Alternate surface so the two groups read as separate sections. */
  tone?: "subtle" | "paper";
}

/** A group of case studies. Renders nothing when the group has no published projects. */
export default function ProjectsGrid({ projects, index, eyebrow, title, tone = "subtle" }: ProjectsGridProps) {
  if (projects.length === 0) return null;
  const id = `projects-${index}`;

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={`py-20 md:py-32 border-t border-black/10 ${tone === "subtle" ? "bg-subtle" : "bg-white"}`}
    >
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-black/10">
          <div>
            <span className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
              [ {index} / {eyebrow} ]
            </span>
            <TextMask as="h2" id={`${id}-title`} text={title} className="mt-4 text-3xl sm:text-5xl font-light tracking-heading text-black" />
          </div>
          <p className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
            {String(projects.length).padStart(2, "0")} {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>

        {/* 2-Column Asymmetric Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {projects.map((project, i) => (
            <GridCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
