import type { Metadata } from "next";
import { ServiceTags, SampleBadge } from "@/components/case-studies/ServiceTags";
import { categoryOf } from "@/lib/content/service-catalog";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import Container from "@/components/home/shared/Container";
import {
  featuredProject,
  caseStudiesList,
  type CaseStudy,
} from "@/lib/content/case-studies";

const allProjects: CaseStudy[] = [featuredProject, ...caseStudiesList];

export async function generateStaticParams() {
  return allProjects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) return { title: "Case Study Not Found" };

  return {
    title: `${project.title} — Case Study`,
    description: project.description,
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projectIndex = allProjects.findIndex((p) => p.slug === slug);
  if (projectIndex === -1) {
    notFound();
  }

  const project = allProjects[projectIndex];
  const nextProject = allProjects[(projectIndex + 1) % allProjects.length];

  return (
    <div className="relative min-h-screen bg-white selection:bg-burgundy selection:text-white">
      <Navbar />

      <main className="pt-36 pb-24 md:pt-48 md:pb-36">
        <Container>
          {/* Back Navigation */}
          <Link
            href="/case-studies"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-eyebrow text-ink-3 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            <span>All Case Studies</span>
          </Link>

          {/* Header */}
          <div className="mt-10 max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
                {categoryOf(project.services[0]).name}
              </span>
              <span className="text-ink-4">•</span>
              <span className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
                {project.year}
              </span>
            </div>

            <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl font-light tracking-heading leading-tight text-black">
              {project.title}
            </h1>

            <p className="mt-4 font-mono text-xs uppercase tracking-eyebrow text-ink-3">
              Client: {project.clientType}
            </p>
            <ServiceTags ids={project.services} className="mt-6" />
            {project.placeholder && <SampleBadge className="mt-6" />}
          </div>

          {/* Hero Image */}
          <div className="mt-14 relative w-full overflow-hidden rounded-2xl bg-subtle aspect-[16/9] shadow-[0_12px_45px_rgba(0,0,0,0.06)]">
            <Image
              src={project.image.src}
              alt={project.image.alt}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          </div>

          {/* Editorial Content Breakdown */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-black/10 pt-16">
            {/* Left: Deliverables & Specifications */}
            <div className="lg:col-span-4">
              <span className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">
                [ ENGAGEMENT SCOPE ]
              </span>
              <ul className="mt-6 space-y-3">
                {project.deliverables.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-ink border-b border-black/5 pb-3 font-light"
                  >
                    <span className="h-1 w-1 rounded-full bg-burgundy" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Narrative & Impact */}
            <div className="lg:col-span-8 max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
                [ EXECUTIVE SUMMARY ]
              </span>
              <p className="mt-6 text-xl sm:text-2xl font-light leading-relaxed text-black">
                {project.description}
              </p>

              {project.placeholder ? (
                <p className="caption-2 mt-12 rounded-lg border border-dashed border-line-strong p-6 text-ink-3">
                  The full project narrative, approach and outcomes will be added once the project details are confirmed.
                </p>
              ) : null}
            </div>
          </div>

          {/* Next Project Nav */}
          <div className="mt-24 pt-12 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
              Next Engagement
            </span>

            <Link
              href={`/case-studies/${nextProject.slug}`}
              className="group flex items-center gap-3 text-xl sm:text-2xl font-light text-black hover:text-burgundy transition-colors"
            >
              <span>{nextProject.title}</span>
              <ArrowUpRight
                size={20}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </div>
        </Container>
      </main>
    </div>
  );
}
