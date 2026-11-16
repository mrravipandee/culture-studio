import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import Container from "@/components/home/shared/Container";
import { Reveal } from "@/components/motion";
import CaseStudiesHero from "@/components/case-studies/CaseStudiesHero";
import CaseStudyCard from "@/components/case-studies/CaseStudyCard";
import CaseStudiesExplorer from "@/components/case-studies/CaseStudiesExplorer";
import CaseStudiesCta from "@/components/case-studies/CaseStudiesCta";
import { caseStudyFilters, caseStudyGroups, publishedCaseStudies } from "@/lib/content/case-studies";
import { caseStudiesEnabled } from "@/lib/content/case-studies-publishing";

export const metadata: Metadata = pageMetadata({
  title: "Case Studies",
  path: "/case-studies",
  description:
    "A selection of CULT.URE projects that show how strategy, design and marketing come together to create real business impact.",
});

/**
 * Case Studies listing: published projects only (lib/content/case-studies-publishing.ts).
 * Returns HTTP 404 while nothing is published (proxy.ts rewrites it as well).
 * Sections: hero · performance highlights · filters + project grid · contact CTA.
 */
export default function CaseStudiesPage() {
  if (!caseStudiesEnabled) notFound();

  const filters = caseStudyFilters.filter((f) => publishedCaseStudies.some((p) => p.filters.includes(f.id)));
  const items = publishedCaseStudies.map((project, i) => ({
    key: project.slug,
    filters: project.filters,
    group: project.group,
    card: <CaseStudyCard project={project} priority={i < 3} />,
  }));

  return (
    <div className="relative min-h-screen bg-[var(--cream)] selection:bg-burgundy selection:text-white">
      <JsonLd data={breadcrumbSchema([["Case Studies", "/case-studies"]])} />
      <Navbar />

      <main className="relative z-0">
        <CaseStudiesHero />

        <section aria-labelledby="cs-projects-title" className="pb-20 md:pb-28">
          <Container>
            <h2 id="cs-projects-title" className="sr-only">
              Projects
            </h2>
            <Reveal distance={16}>
              <CaseStudiesExplorer
                filters={filters}
                items={items}
                separatorGroup="growth"
                separatorTitle={caseStudyGroups.growth.title}
              />
            </Reveal>
          </Container>
        </section>

        <CaseStudiesCta />
      </main>
    </div>
  );
}
