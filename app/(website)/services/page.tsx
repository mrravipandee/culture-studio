import type { Metadata } from "next";
import Navbar from "@/components/navigation/Navbar";
import ServicesHero from "@/components/services/ServicesHero";
import PinnedShowcase from "@/components/services/PinnedShowcase";
import CapabilitiesSection from "@/components/services/CapabilitiesSection";
import ServicesProcess from "@/components/services/ServicesProcess";
import ServicesFaq from "@/components/services/ServicesFaq";
import ServicesCta from "@/components/services/ServicesCta";

export const metadata: Metadata = {
  title: "Services & Capabilities | Executive Branding & Cultural Architecture",
  description:
    "Explore CULT.URE's four core disciplines: Personal Branding, Content Strategy & Creation, Brand Identity & Positioning, and AI Automation.",
};

export default function ServicesPage() {
  return (
    <div className="relative min-h-screen bg-[#FCFBF9] selection:bg-[#4A121A] selection:text-white">
      {/* Navigation */}
      <Navbar />

      <main className="relative z-0">
        {/* Section 01 — Cinematic Hero */}
        <ServicesHero />

        {/* Sections 02 & 03 — Service Navigation & Pinned Showcase */}
        <PinnedShowcase />

        {/* Section 04 — Deliverables & Capabilities */}
        <CapabilitiesSection />

        {/* Section 05 — Our Process */}
        <ServicesProcess />

        {/* Section 06 — Frequently Asked Questions */}
        <ServicesFaq />

        {/* Section 07 — Closing CTA & Direct Contact */}
        <ServicesCta />
      </main>
    </div>
  );
}
