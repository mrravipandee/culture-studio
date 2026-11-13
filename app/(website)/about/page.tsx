import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import AboutHero from "@/components/about/AboutHero";
import AboutPhilosophy from "@/components/about/AboutPhilosophy";
import AboutStory from "@/components/about/AboutStory";
import AboutPerspective from "@/components/about/AboutPerspective";
import AboutApproach from "@/components/about/AboutApproach";
import AboutPrinciples from "@/components/about/AboutPrinciples";
import AboutCta from "@/components/about/AboutCta";
import ContactSection from "@/components/home/sections/ContactSection";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: "About",
  path: "/about",
  description:
    "CULT.URE is a B2B-focused marketing agency working with businesses to shape how they are positioned, perceived and remembered.",
});

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white selection:bg-burgundy selection:text-white">
      <JsonLd data={breadcrumbSchema([["About", "/about"]])} />
      {/* Navigation */}
      <Navbar />

      <main className="relative z-0">
        {/* Order follows the client copy deck (02 / About Us). */}
        {/* 01 — Hero */}
        <AboutHero />

        {/* 02 — Our Approach (Practice, Focus, Engagement, Principle) */}
        <AboutApproach />

        {/* 03 — Our Philosophy */}
        <AboutPhilosophy />

        {/* 04 — Why CULT.URE (Purpose, Vision, How It Connects, In Practice) */}
        <AboutStory />

        {/* 05 — What CULT.URE Does */}
        <AboutPerspective />

        {/* 06 — Our Principles */}
        <AboutPrinciples />

        {/* 07 — Start a Conversation */}
        <AboutCta />

        {/* 08 — Contact & Footer */}
        <ContactSection />
      </main>
    </div>
  );
}
