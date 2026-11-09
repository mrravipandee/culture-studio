import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import HomeIntroShell from "@/components/home/HomeIntroShell";
import HomeHero from "@/components/home/HomeHero";
import ManifestoSection from "@/components/home/sections/ManifestoSection";
import ExpertiseSection from "@/components/home/sections/ExpertiseSection";
import SelectedWorkSection from "@/components/home/sections/SelectedWorkSection";
import ThinkingSection from "@/components/home/sections/ThinkingSection";
import ProcessSection from "@/components/home/sections/ProcessSection";
import WhyCultureSection from "@/components/home/sections/WhyCultureSection";
import ClientVoicesSection from "@/components/home/sections/ClientVoicesSection";
import TaglineReveal from "@/components/motion/TaglineReveal";
import ContactSection from "@/components/home/sections/ContactSection";

export const metadata: Metadata = pageMetadata({
  title: "CULT.URE | Digital Growth, Marketing & Creative Agency",
  absoluteTitle: true,
  path: "/",
  description:
    "CULT.URE is a digital growth, marketing and creative agency. Brand, social, performance, e-commerce, SEO, GEO & AEO, email, websites and AI automation, planned as one.",
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
        <SelectedWorkSection />
        {/* One type moment, between proof and method */}
        <TaglineReveal
          eyebrow="What we believe"
          lines={[
            "Your reputation walks into the room before you do.",
            "We make sure it says the right thing.",
          ]}
        />
        {/* How */}
        <ProcessSection />
        <ThinkingSection />
        {/* Why us */}
        <WhyCultureSection />
        {/* Renders only with approved testimonials */}
        <ClientVoicesSection />
        <ContactSection />
      </main>
    </div>
  );
}
