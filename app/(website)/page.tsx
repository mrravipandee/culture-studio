import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import HomeIntroShell from "@/components/home/HomeIntroShell";
import HomeHero from "@/components/home/HomeHero";
import ManifestoSection from "@/components/home/sections/ManifestoSection";
import ExpertiseSection from "@/components/home/sections/ExpertiseSection";
import SelectedWorkSection from "@/components/home/sections/SelectedWorkSection";
import ProcessSection from "@/components/home/sections/ProcessSection";
import WhyCultureSection from "@/components/home/sections/WhyCultureSection";
import ClientVoicesSection from "@/components/home/sections/ClientVoicesSection";
import TaglineReveal from "@/components/motion/TaglineReveal";
import ContactCta from "@/components/home/sections/ContactCta";
import { reputationLine } from "@/lib/content/home";
import { caseStudiesEnabled } from "@/lib/content/case-studies-publishing";

export const metadata: Metadata = pageMetadata({
  title: "CULT.URE | B2B Marketing Agency",
  absoluteTitle: true,
  path: "/",
  description:
    "CULT.URE is a B2B-focused marketing agency helping businesses clarify their market position, communicate their expertise and build stronger relationships with the audiences and decision-makers that matter.",
});

/**
 * Homepage — Server Component.
 * Only the intro/navbar shell and the hero's reveal wrapper run on the client.
 */
export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-paper">
      {/* 01 — Cinematic opening + navbar */}
      <HomeIntroShell />

      <main className="relative z-0">
        <HomeHero />
        {/* Why */}
        <ManifestoSection />
        {/* What */}
        <ExpertiseSection />
        {/* Proof */}
        {/* Proof: hidden until a case study is explicitly published (client rule: verified projects only). */}
        {caseStudiesEnabled && <SelectedWorkSection />}
        {/* One type moment, between proof and method */}
        <TaglineReveal lines={reputationLine.lines} body={reputationLine.body} />
        {/* How */}
        <ProcessSection />
        {/* Why us */}
        <WhyCultureSection />
        {/* Renders only with approved testimonials */}
        <ClientVoicesSection />
        <ContactCta />
      </main>
    </div>
  );
}
