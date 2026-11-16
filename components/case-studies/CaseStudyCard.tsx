import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { caseStudyFilters, type CaseStudy } from "@/lib/content/case-studies";
import ProjectVisual from "./ProjectVisual";

/** Short card label: the project's primary listing filter (falls back to nothing). */
const cardLabel = (project: CaseStudy) => caseStudyFilters.find((f) => f.id === project.filters[0])?.label ?? "";

/**
 * Listing card: 16:9 image, category label, title, highlight and up to three figures.
 * The whole card is one link (title link stretched over the article), so keyboard users
 * get a single, well-named tab stop.
 */
export default function CaseStudyCard({ project, priority = false }: { project: CaseStudy; priority?: boolean }) {
  const label = cardLabel(project);
  const figures = project.figures.slice(0, 3);

  return (
    <article className="cs-card group relative flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white transition-colors duration-500 ease-editorial hover:border-black/25 focus-within:border-black/40">
      <div className="relative">
        <ProjectVisual
          project={project}
          aspect="aspect-[16/9]"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          priority={priority}
          showMeta={false}
          className="rounded-none"
        />
        {label && (
          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {label}
          </span>
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white text-burgundy transition-colors duration-300 group-hover:bg-burgundy group-hover:text-white"
        >
          <ArrowUpRight size={16} strokeWidth={1.75} className="transition-transform duration-300 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-xl font-normal tracking-heading text-black transition-colors duration-300 group-hover:text-burgundy">
            <Link
              href={`/case-studies/${project.slug}`}
              className="outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-[-3px] focus-visible:after:outline-burgundy"
            >
              {project.title}
            </Link>
          </h3>
          <span className="shrink-0 font-mono text-xs text-ink-3">{project.number}</span>
        </div>

        <p className="mt-2 mb-5 line-clamp-3 md:min-h-[4.5em] text-sm font-light leading-[1.5] text-ink-2">{project.highlight}</p>

        <ul aria-label={project.figuresLabel} className="mt-auto grid grid-cols-3 md:min-h-[6.75rem] content-start gap-3 border-t border-black/10 pt-5">
          {figures.map((figure) => (
            <li key={figure.label} className="min-w-0">
              <span className="block text-lg font-normal tracking-heading text-burgundy sm:text-xl">{figure.value}</span>{" "}
              <span className="mt-1 block text-[0.6875rem] leading-snug text-ink-3">{figure.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
