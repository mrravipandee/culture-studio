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

/**
 * Homepage — Server Component.
 * Only the intro/navbar shell and the hero's reveal wrapper run on the client.
 */
export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* 01 — Cinematic opening + navbar */}
      <HomeIntroShell />

      <main className="relative z-0">
        {/* 02 */}
        <HomeHero />
        {/* 03 */}
        <ManifestoSection />
        {/* 04 */}
        <ExpertiseSection />
        {/* Tagline moment */}
        <TaglineReveal
          eyebrow="What we believe"
          lines={[
            "Your reputation walks into the room before you do.",
            "We make sure it says the right thing.",
          ]}
        />
        {/* 05 */}
        <SelectedWorkSection />
        {/* 06 */}
        <ThinkingSection />
        {/* 07 */}
        <ProcessSection />
        {/* 08 */}
        <WhyCultureSection />
        {/* 09 */}
        <ClientVoicesSection />
        {/* 10 */}
        <ContactSection />
      </main>
    </div>
  );
}
