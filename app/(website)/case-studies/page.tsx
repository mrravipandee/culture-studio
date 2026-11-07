import type { Metadata } from "next";
import Navbar from "@/components/navigation/Navbar";
import CaseStudiesHero from "@/components/case-studies/CaseStudiesHero";
import FeaturedProject from "@/components/case-studies/FeaturedProject";
import ProjectsGrid from "@/components/case-studies/ProjectsGrid";
import BehindTheWork from "@/components/case-studies/BehindTheWork";
import CaseStudiesCta from "@/components/case-studies/CaseStudiesCta";

export const metadata: Metadata = {
  title: "Case Studies | Selected Work",
  description:
    "Explore how CULT.URE crafts defining personal brands, executive publications, and cultural authority for category leaders.",
};

export default function CaseStudiesPage() {
  return (
    <div className="relative min-h-screen bg-white selection:bg-burgundy selection:text-white">
      {/* Navigation */}
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
