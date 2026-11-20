import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import Container from "@/components/home/shared/Container";
import { ClipReveal, Reveal, RevealGroup, RevealItem } from "@/components/motion";
import ProjectVisual from "@/components/case-studies/ProjectVisual";
import CaseStudiesCta from "@/components/case-studies/CaseStudiesCta";
import { caseStudyCategory, caseStudyGroups } from "@/lib/content/case-studies";
import { getCaseStudyPage, getPublishedCaseStudies } from "@/lib/case-studies/public";

/**
 * The complete page must be static (prerendered or generated on first request, then cached):
 * this is what gives unknown, draft, archived and deleted slugs a real HTTP 404 and old slugs
 * a real 308, decided before any HTML is sent. All data comes from `'use cache'` reads of
 * PUBLISHED records only (lib/case-studies/public.ts), invalidated on every publishing change.
 */
export const ensureStatic = "navigation";

/**
 * Every published slug is prerendered. Cache Components needs at least one param, so when
 * nothing is published a reserved, never-valid slug is returned (it renders the 404).
 */
export async function generateStaticParams() {
  const all = await getPublishedCaseStudies();
  return all.length > 0 ? all.map((project) => ({ slug: project.slug })) : [{ slug: "unpublished" }];
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCaseStudyPage(slug);
  // Old slug: the page redirects; unknown: the 404 page supplies the title + noindex.
  if (result.kind === "redirect") permanentRedirect(`/case-studies/${result.slug}`);
  if (result.kind === "missing") notFound();
  const { project } = result;

  return pageMetadata({
    title: project.seo.title,
    path: `/case-studies/${project.slug}`,
    description: project.seo.description,
    type: "article",
    ...(project.seo.ogImage ? { image: { url: project.seo.ogImage, alt: project.image.alt || project.title } } : {}),
  });
}

/**
 * Presents only the supplied content: title, highlight, image, overview, services, the
 * project's scope and/or results, optional gallery, next project and the contact CTA.
 */
export default async function CaseStudyDetailPage({ params }: Params) {
  const { slug } = await params;
  const result = await getCaseStudyPage(slug);
  if (result.kind === "redirect") permanentRedirect(`/case-studies/${result.slug}`);
  if (result.kind === "missing") notFound();

  const { project, next: nextProject } = result;
  const total = String(result.total).padStart(2, "0");

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
                <p className="mt-6 whitespace-pre-line text-xl sm:text-2xl font-light leading-relaxed text-black">{project.overview}</p>
              </Reveal>

              <div className="lg:col-span-4">
                <h2 className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">[ Services ]</h2>
                <ul className="mt-6 space-y-3">
                  {project.services.map((service: string) => (
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

        {/* Scope and / or results (only what was supplied) */}
        {project.figureSections.map((section, sectionIndex) => (
          <section key={section.label} aria-labelledby={`figures-${sectionIndex}`} className={sectionIndex === 0 ? "py-20 md:py-28" : "pb-20 md:pb-28"}>
            <Container>
              <h2 id={`figures-${sectionIndex}`} className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
                [ {section.label} ]
              </h2>
              <RevealGroup as="ul" count={section.items.length} className="mt-8 grid grid-cols-1 border-t border-black/10 sm:grid-cols-3">
                {section.items.map((figure) => (
                  <RevealItem
                    as="li"
                    key={`${figure.value}-${figure.label}`}
                    className="border-b border-black/10 py-8 sm:border-b-0 sm:pr-8 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:pl-8"
                  >
                    {figure.value && (
                      <>
                        <span className="block text-5xl md:text-6xl lg:text-7xl font-light tracking-heading text-burgundy">{figure.value}</span>{" "}
                      </>
                    )}
                    <span className={`block font-mono text-xs uppercase tracking-eyebrow text-ink-3 ${figure.value ? "mt-3" : ""}`}>{figure.label}</span>
                    {figure.description && <span className="mt-2 block text-sm font-light leading-relaxed text-ink-2">{figure.description}</span>}
                  </RevealItem>
                ))}
              </RevealGroup>
            </Container>
          </section>
        ))}
        {project.figureSections.length === 0 && <div className="pb-20 md:pb-28" />}

        {/* Gallery (only when images were added) */}
        {project.gallery.length > 0 && (
          <section aria-label="Gallery" className="pb-20 md:pb-28">
            <Container>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                {project.gallery.map((image) => (
                  <li key={image.src}>
                    <ClipReveal className="rounded-xl">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--subtle)]">
                        <Image src={image.src} alt={image.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                      </div>
                    </ClipReveal>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        )}

        {/* Next project */}
        {nextProject && (
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
        )}

        <CaseStudiesCta />
      </main>
    </div>
  );
}
