import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import CaseStudiesHero from "@/components/case-studies/CaseStudiesHero";
import FeaturedProject from "@/components/case-studies/FeaturedProject";
import ProjectsGrid from "@/components/case-studies/ProjectsGrid";
import BehindTheWork from "@/components/case-studies/BehindTheWork";
import CaseStudiesCta from "@/components/case-studies/CaseStudiesCta";
import { notFound } from "next/navigation";
import { caseStudiesEnabled } from "@/lib/content/case-studies-publishing";

export const metadata: Metadata = pageMetadata({
  title: "Case Studies",
  path: "/case-studies",
  description:
    "Selected CULT.URE projects across brand, marketing, search and technology, each labelled with the services involved.",
});

/**
 * Hidden (HTTP 404) until at least one case study is explicitly published in
 * lib/content/case-studies-publishing.ts. proxy.ts also rewrites /case-studies to a
 * 404 while disabled, so this page is never rendered with unpublished content.
 */
export default function CaseStudiesPage() {
  if (!caseStudiesEnabled) notFound();
  return (
    <div className="relative min-h-screen bg-white selection:bg-burgundy selection:text-white">
      {/* Navigation */}
      <JsonLd data={breadcrumbSchema([["Case Studies", "/case-studies"]])} />
      <Navbar />

      <main className="relative z-0">
        {/* 01 — Editorial Hero */}
        <CaseStudiesHero />

        {/* 02 — Prominent Featured Project */}
        <FeaturedProject />

        {/* 03 — Selected Projects Grid */}
        <ProjectsGrid />

        {/* 04 — Behind the Work Methodology */}
        <BehindTheWork />

        {/* 05 — Contact CTA */}
        <CaseStudiesCta />
      </main>
    </div>
  );
}
