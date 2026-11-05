"use client";

import { useState } from "react";
import CinematicIntro from "@/components/entrance/CinematicIntro";
import Navbar from "@/components/navigation/Navbar";
import HomeHero from "@/components/home/HomeHero";

export default function HomePage() {
  const [introActive, setIntroActive] = useState(true);

  return (
    <div className="relative min-h-screen bg-white">
      {/* Cinematic Full-Viewport Entrance Experience */}
      <CinematicIntro
        videoSrc="/videos/file.mp4"
        onComplete={() => setIntroActive(false)}
      />

      {/* Floating Scroll-Aware Editorial Navbar */}
      <Navbar introActive={introActive} />

      {/* Primary Homepage Content */}
      <main className="relative z-0">
        <HomeHero />
      </main>
    </div>
  );
}

