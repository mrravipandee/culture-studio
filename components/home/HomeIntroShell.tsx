"use client";

import { useCallback, useState } from "react";
import CinematicIntro from "@/components/entrance/CinematicIntro";
import Navbar from "@/components/navigation/Navbar";

/**
 * 01 — Cinematic opening + navbar.
 * Holds the only piece of homepage state (whether the intro is active)
 * so the rest of the page can stay as Server Components.
 */
export default function HomeIntroShell() {
  const [introActive, setIntroActive] = useState(true);

  // Stable reference: CinematicIntro lists onComplete as an effect dependency.
  const handleComplete = useCallback(() => setIntroActive(false), []);

  return (
    <>
      <CinematicIntro videoSrc="/videos/file.mp4" onComplete={handleComplete} />
      <Navbar introActive={introActive} />
    </>
  );
}
