import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import Container from "@/components/home/shared/Container";
import { ClipReveal, Reveal, RevealGroup, RevealItem } from "@/components/motion";
import ProjectVisual from "@/components/case-studies/ProjectVisual";
import CaseStudiesCta from "@/components/case-studies/CaseStudiesCta";
import { caseStudyCategory, caseStudyGroups, publishedCaseStudies } from "@/lib/content/case-studies";

/** Only explicitly published case studies (lib/content/case-studies-publishing.ts). */
const allProjects = publishedCaseStudies;

/**
 * Every published slug is prerendered. cacheComponents requires at least one param, so
 * if nothing is published a non-project placeholder slug is returned instead (it renders
 * a 404). Unknown and unpublished slugs never reach this page: proxy.ts answers them with
 * a real HTTP 404.
 */
export async function generateStaticParams() {
  return allProjects.length > 0 ? allProjects.map((project) => ({ slug: project.slug })) : [{ slug: "unpublished" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = allProjects.find((p) => p.slug === slug);
  // Unknown slug: the 404 page supplies the title; Next.js adds the single noindex tag.
  if (!project) notFound();

  return pageMetadata({
    title: `${project.title} — Case Study`,
    path: `/case-studies/${project.slug}`,
    description: project.highlight,
    type: "article",
  });
}

export default function CaseStudyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Route params are read inside Suspense so navigation can show the shell instantly.
  // Every published slug is prerendered via generateStaticParams, so the HTML is complete.
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" aria-hidden="true" />}>
      <CaseStudyDetail params={params} />
    </Suspense>
  );
}

/**
 * Presents only the supplied content: title, highlight, image, overview, services, the
 * project's scope or results, next project and the contact CTA. No challenge, strategy, process, solution or testimonial
 * sections, because no such content has been supplied.
 */
async function CaseStudyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projectIndex = allProjects.findIndex((p) => p.slug === slug);
  if (projectIndex === -1) notFound();

  const project = allProjects[projectIndex];
  const nextProject = allProjects[(projectIndex + 1) % allProjects.length];
  const total = String(allProjects.length).padStart(2, "0");

  return (
    <div className="relative min-h-screen bg-[var(--cream)] selection:bg-burgundy selection:text-white">
      <JsonLd
        data={breadcrumbSchema([
          ["Case Studies", "/case-studies"],
          [project.title, `/case-studies/${project.slug}`],
        ])}
      />
      <Navbar />

      <main>
        {/* Header */}
        <section className="pt-36 pb-12 md:pt-48 md:pb-16">
          <Container>
            <Link
              href="/case-studies"
              className="group inline-flex min-h-6 items-center gap-2 py-1 font-mono text-xs uppercase tracking-eyebrow text-ink-3 hover:text-black transition-colors"
            >
              <ArrowLeft aria-hidden="true" size={14} className="transition-transform group-hover:-translate-x-1" />
              <span>All case studies</span>
            </Link>

            <div className="mt-10 max-w-5xl">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-eyebrow">
                <span className="text-ink-3">
                  {project.number} / {total}
                </span>
                <span aria-hidden="true" className="text-ink-4">•</span>
                <span className="text-burgundy font-medium">{caseStudyCategory(project)}</span>
                {project.group === "growth" && (
                  <>
                    <span aria-hidden="true" className="text-ink-4">•</span>
                    <span className="text-ink-3">{caseStudyGroups.growth.title}</span>
                  </>
                )}
              </p>

              <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl font-light tracking-heading leading-[1.05] text-black">
                {project.title}
              </h1>

              <p className="mt-8 max-w-3xl text-xl sm:text-2xl font-light leading-relaxed text-ink-2">{project.highlight}</p>
            </div>
          </Container>
        </section>

        {/* Project visual */}
        <Container>
          <figure>
            <ClipReveal className="rounded-xl">
              <ProjectVisual project={project} aspect="aspect-[4/3] sm:aspect-[16/9]" sizes="(min-width: 1280px) 1200px, 100vw" priority />
            </ClipReveal>
            {project.image.temporary && (
              <figcaption className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
                Illustrative image
              </figcaption>
            )}
          </figure>
        </Container>

        {/* Overview + services */}
        <section aria-labelledby="overview-title" className="pt-20 md:pt-28">
          <Container>
            <div className="grid grid-cols-1 gap-12 border-t border-black/10 pt-12 lg:grid-cols-12 lg:gap-16 lg:pt-16">
              <Reveal className="lg:col-span-8 max-w-2xl" distance={16}>
                <h2 id="overview-title" className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
                  [ Overview ]
                </h2>
                <p className="mt-6 text-xl sm:text-2xl font-light leading-relaxed text-black">{project.overview}</p>
              </Reveal>

              <div className="lg:col-span-4">
                <h2 className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">[ Services ]</h2>
                <ul className="mt-6 space-y-3">
                  {project.services.map((service) => (
                    <li key={service} className="flex items-center gap-3 border-b border-black/5 pb-3 text-sm font-light text-ink">
                      <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-burgundy" />
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        {/* Scope or results */}
        <section aria-labelledby="figures-title" className="py-20 md:py-28">
          <Container>
            <h2 id="figures-title" className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
              [ {project.figuresLabel} ]
            </h2>
            <RevealGroup
              as="ul"
              count={project.figures.length}
              className="mt-8 grid grid-cols-1 border-t border-black/10 sm:grid-cols-3"
            >
              {project.figures.map((figure) => (
                <RevealItem
                  as="li"
                  key={figure.label}
                  className="border-b border-black/10 py-8 sm:border-b-0 sm:pr-8 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:pl-8"
                >
                  <span className="block text-5xl md:text-6xl lg:text-7xl font-light tracking-heading text-burgundy">{figure.value}</span>{" "}
                  <span className="mt-3 block font-mono text-xs uppercase tracking-eyebrow text-ink-3">{figure.label}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </Container>
        </section>

        {/* Next project */}
        <section aria-label="Next project" className="pb-20 md:pb-28">
          <Container>
            <div className="pt-12 border-t border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <span className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">Next project</span>
              <Link
                href={`/case-studies/${nextProject.slug}`}
                className="group flex items-center gap-3 text-xl sm:text-2xl font-light text-black hover:text-burgundy transition-colors"
              >
                <span>{nextProject.title}</span>
                <ArrowUpRight
                  aria-hidden="true"
                  size={20}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </div>
          </Container>
        </section>

        <CaseStudiesCta />
      </main>
    </div>
  );
}
