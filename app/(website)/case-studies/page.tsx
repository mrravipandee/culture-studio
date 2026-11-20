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
import { buildCaseStudyHighlights, caseStudyFilters, caseStudyGroups } from "@/lib/content/case-studies";
import { getPublishedCaseStudies } from "@/lib/case-studies/public";
import { caseStudiesEnabled } from "@/lib/content/case-studies-publishing";
import { trustedBy } from "@/lib/content/home";
import LogoMarquee from "@/components/motion/LogoMarquee";

export const metadata: Metadata = pageMetadata({
  title: "Case Studies",
  path: "/case-studies",
  description:
    "A selection of CULT.URE projects that show how strategy, design and marketing come together to create real business impact.",
});

/**
 * Case Studies listing: PUBLISHED records from MongoDB only (lib/case-studies/public.ts,
 * cached and invalidated on every publishing change). Drafts, archived and deleted records
 * never appear. HTTP 404 while the section is switched off or nothing is published.
 * Sections: hero · performance highlights · client logos · filters + project grid · CTA.
 */
export default async function CaseStudiesPage() {
  if (!caseStudiesEnabled) notFound();
  const publishedCaseStudies = await getPublishedCaseStudies();
  if (publishedCaseStudies.length === 0) notFound();

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
        <CaseStudiesHero highlights={buildCaseStudyHighlights(publishedCaseStudies)} />

        {/* Client logos: same strip and data as the Home page (lib/content/home.ts → trustedBy). */}
        {!trustedBy.placeholder && (
          <Container className="mb-16 md:mb-24">
            <LogoMarquee label={trustedBy.label} logos={trustedBy.logos} speed={70} />
          </Container>
        )}

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
