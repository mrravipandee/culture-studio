
"use client";

import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import BrandReveal from "./BrandReveal";

const POSTER = "/images/intro-poster.jpg";
/** Hold on the moving image before the wordmark appears (ms). */
const BRAND_DELAY = 1200;

interface CinematicIntroProps {
  videoSrc: string;
  onComplete?: () => void;
}

export default function CinematicIntro({
  videoSrc,
  onComplete,
}: CinematicIntroProps) {
  // The poster is the first full-screen paint: fetch it at high priority.
  preload(POSTER, { as: "image", fetchPriority: "high" });

  const videoRef = useRef<HTMLVideoElement>(null);
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
    }, BRAND_DELAY);

    return () => window.clearTimeout(timer);
  }, [reducedMotion, onComplete]);

  // Load the 850 KB video only after the page has loaded and the browser is idle,
  // so it never competes with critical CSS, fonts, JS or images. Poster shows meanwhile.
  useEffect(() => {
    if (reducedMotion) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    let idleId = 0;
    const start = () => {
      const v = videoRef.current;
      if (!v || v.src) return;
      v.src = videoSrc;
      v.play().catch(() => {});
    };
    const schedule = () => {
      const w = window as Window & typeof globalThis;
      idleId = typeof w.requestIdleCallback === "function" ? w.requestIdleCallback(start, { timeout: 1500 }) : w.setTimeout(start, 300);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.removeEventListener("load", schedule);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      window.clearTimeout(idleId);
    };
  }, [reducedMotion, videoSrc]);

  const isBrandVisible = reducedMotion || showBrand;

  return (
    <section
      id="cinematic-intro"
      aria-label="CULT.URE cinematic introduction"
      className="relative h-svh min-h-[560px] w-full overflow-hidden bg-black"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        muted
        playsInline
        loop
        preload="none"
        poster={POSTER}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

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
