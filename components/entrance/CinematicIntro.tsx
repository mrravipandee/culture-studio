
"use client";

import { useEffect, useState } from "react";
import BrandReveal from "./BrandReveal";

interface CinematicIntroProps {
  videoSrc: string;
  onComplete?: () => void;
}

export default function CinematicIntro({
  videoSrc,
  onComplete,
}: CinematicIntroProps) {
  const [showBrand, setShowBrand] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMotionChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      onComplete?.();
      return;
    }

    const timer = window.setTimeout(() => {
      setShowBrand(true);
      onComplete?.();
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [reducedMotion, onComplete]);

  const isBrandVisible = reducedMotion || showBrand;

  return (
    <section
      id="cinematic-intro"
      aria-label="CULT.URE cinematic introduction"
      className="relative h-svh min-h-[560px] w-full overflow-hidden bg-black"
    >
      {/* Background Video */}
      <video
        autoPlay={!reducedMotion}
        muted
        playsInline
        loop
        preload="metadata"
        poster="/images/intro-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Cinematic Overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-burgundy/50"
        aria-hidden="true"
      />

      {/* Brand Reveal */}
      <BrandReveal visible={isBrandVisible} />

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
        <div className="flex flex-col items-center gap-3 text-white/70">
          <span className="text-xs uppercase tracking-eyebrow">
            Scroll to explore
          </span>

          <div className="h-10 w-px overflow-hidden bg-white/20">
            <div className="h-1/2 w-full animate-pulse bg-white" />
          </div>
        </div>
      </div>
    </section>
  );
}
