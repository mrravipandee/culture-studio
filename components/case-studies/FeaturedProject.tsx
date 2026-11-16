import Link from "next/link";
import { caseStudyCategory, type CaseStudy } from "@/lib/content/case-studies";
import { Button } from "@/components/ui/site-button";
import { ClipReveal, Reveal } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import ProjectVisual from "./ProjectVisual";

/** Featured case study: large image-led card (first published project). */
export default function FeaturedProject({ project }: { project: CaseStudy }) {
  const href = `/case-studies/${project.slug}`;

  return (
    <section aria-labelledby="featured-project-title" className="py-20 md:py-32 bg-white">
      <Container>
        {/* Header Tag */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-10">
          <span className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
            [ 01 / FEATURED PROJECT ]
          </span>
          <span className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">{project.number}</span>
        </div>

        <article className="group grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
          {/* Image Column */}
          <div className="lg:col-span-7">
            <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
              <ClipReveal className="h-full w-full rounded-xl">
                <ProjectVisual project={project} aspect="aspect-[16/10]" sizes="(min-width: 1024px) 60vw, 100vw" priority />
              </ClipReveal>
            </Link>
          </div>

          {/* Content Column */}
          <Reveal delay={0.15} className="lg:col-span-5 flex flex-col justify-center">
            <span className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
              {caseStudyCategory(project)}
            </span>

            <h2 id="featured-project-title" className="mt-4 text-3xl sm:text-5xl font-light tracking-heading text-black leading-tight">
              <Link href={href} className="hover:text-burgundy transition-colors">
                {project.title}
              </Link>
            </h2>

            <p className="mt-6 text-base md:text-lg font-light leading-relaxed text-ink-2">{project.highlight}</p>

            <ul aria-label="Services" className="mt-8 flex flex-wrap gap-2">
              {project.services.map((service) => (
                <li key={service} className="caption-4 rounded-full border border-line-strong px-3 py-1 text-ink-2">
                  {service}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Button href={href} variant="burgundy" icon="arrow">
                View project
              </Button>
            </div>
          </Reveal>
        </article>
      </Container>
    </section>
  );
}
