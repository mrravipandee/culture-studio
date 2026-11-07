import type { Metadata } from "next";
import Navbar from "@/components/navigation/Navbar";
import AboutHero from "@/components/about/AboutHero";
import AboutPhilosophy from "@/components/about/AboutPhilosophy";
import AboutStory from "@/components/about/AboutStory";
import AboutPerspective from "@/components/about/AboutPerspective";
import AboutApproach from "@/components/about/AboutApproach";
import AboutPrinciples from "@/components/about/AboutPrinciples";
import AboutCta from "@/components/about/AboutCta";
import ContactSection from "@/components/home/sections/ContactSection";

export const metadata: Metadata = {
  title: "About | Philosophy, Story & Principles",
  description:
    "We believe brands should mean something. CULT.URE is an executive personal branding agency shaping iconic reputations for leaders who define eras.",
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white selection:bg-burgundy selection:text-white">
      {/* Navigation */}
      <Navbar />

      <main className="relative z-0">
        {/* 01 — Editorial Hero */}
        <AboutHero />

        {/* 02 — Our Philosophy */}
        <AboutPhilosophy />

        {/* 03 — Our Story */}
        <AboutStory />

        {/* 04 — Our Perspective */}
        <AboutPerspective />

        {/* 05 — Our Approach */}
        <AboutApproach />

        {/* 06 — Our Principles */}
        <AboutPrinciples />

        {/* 07 — Closing CTA */}
        <AboutCta />

        {/* 08 — Contact & Footer */}
        <ContactSection />
      </main>
    </div>
  );
}
