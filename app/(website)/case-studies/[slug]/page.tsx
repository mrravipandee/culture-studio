import type { Metadata } from "next";
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
    title: `${project.title} | Case Study`,
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
    <div className="relative min-h-screen bg-white selection:bg-[#240C0E] selection:text-white">
      <Navbar />

      <main className="pt-36 pb-24 md:pt-48 md:pb-36">
        <Container>
          {/* Back Navigation */}
          <Link
            href="/case-studies"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            <span>All Case Studies</span>
          </Link>

          {/* Header */}
          <div className="mt-10 max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#240C0E] font-medium">
                {project.category}
              </span>
              <span className="text-neutral-300">•</span>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
                {project.year}
              </span>
            </div>

            <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.03em] leading-tight text-black">
              {project.title}
            </h1>

            <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
              Client: {project.clientType}
            </p>
          </div>

          {/* Hero Image */}
          <div className="mt-14 relative w-full overflow-hidden rounded-2xl bg-neutral-100 aspect-[16/9] shadow-[0_12px_45px_rgba(0,0,0,0.06)]">
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
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#240C0E] font-medium">
                [ ENGAGEMENT SCOPE ]
              </span>
              <ul className="mt-6 space-y-3">
                {project.deliverables.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-neutral-800 border-b border-black/5 pb-3 font-light"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#240C0E]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Narrative & Impact */}
            <div className="lg:col-span-8 max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-400">
                [ EXECUTIVE SUMMARY ]
              </span>
              <p className="mt-6 text-xl sm:text-2xl font-light leading-relaxed text-black">
                {project.description}
              </p>

              <div className="mt-12 space-y-8 text-neutral-600 font-light leading-relaxed">
                <div>
                  <h3 className="text-xs uppercase font-mono tracking-[0.2em] text-black font-medium mb-3">
                    The Strategic Imperative
                  </h3>
                  <p>
                    In noisy categories governed by superficial vanity metrics, genuine
                    authority stems from clarity and conviction. We worked directly with leadership
                    to extract their core point of view, distilling months of breakthrough insights
                    into a signature intellectual framework.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-mono tracking-[0.2em] text-black font-medium mb-3">
                    Cultural Resonance & Distribution
                  </h3>
                  <p>
                    Rather than relying on uncalibrated volume, we created museum-grade editorial
                    artifacts: precision essays, keynote scripts, and cinematic digital monograph
                    pieces crafted to be quoted by peers and referenced by institutional capital.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Project Nav */}
          <div className="mt-24 pt-12 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
              Next Engagement
            </span>

            <Link
              href={`/case-studies/${nextProject.slug}`}
              className="group flex items-center gap-3 text-xl sm:text-2xl font-light text-black hover:text-[#240C0E] transition-colors"
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
