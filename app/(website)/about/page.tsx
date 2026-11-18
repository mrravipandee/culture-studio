import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import AboutHero from "@/components/about/AboutHero";
import AboutApproach from "@/components/about/AboutApproach";
import AboutPhilosophy from "@/components/about/AboutPhilosophy";
import AboutStory from "@/components/about/AboutStory";
import AboutInPractice from "@/components/about/AboutInPractice";
import AboutPerspective from "@/components/about/AboutPerspective";
import AboutPrinciples from "@/components/about/AboutPrinciples";
import AboutCta from "@/components/about/AboutCta";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: "About",
  path: "/about",
  description:
    "CULT.URE is a B2B-focused marketing agency working with businesses to shape how they are positioned, perceived and remembered.",
});

/**
 * About page. Copy: lib/content/about.ts (client copy deck, unchanged).
 * Sections in the approved order; backgrounds stay mostly white with two warm-ivory bands
 * (hero, Why CULT.URE) and one burgundy CTA. The Footer comes from the (website) layout.
 */
export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white selection:bg-burgundy selection:text-white">
      <JsonLd data={breadcrumbSchema([["About", "/about"]])} />
      <Navbar />

      <main className="relative z-0">
        {/* 01 — About hero */}
        <AboutHero />
        {/* 02 — Our Approach */}
        <AboutApproach />
        {/* 03 — Our Philosophy */}
        <AboutPhilosophy />
        {/* 04 — Why CULT.URE (Purpose, Vision, How It Connects) */}
        <AboutStory />
        {/* 05 — In Practice */}
        <AboutInPractice />
        {/* 06 — What CULT.URE Does */}
        <AboutPerspective />
        {/* 07 — Our Principles */}
        <AboutPrinciples />
        {/* 08 — Start a Conversation */}
        <AboutCta />
      </main>
    </div>
  );
}
