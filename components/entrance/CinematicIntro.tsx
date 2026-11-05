"use client";

import { useEffect, useRef, useState } from "react";
import BrandReveal from "./BrandReveal";

interface CinematicIntroProps {
  onComplete: () => void;
  videoSrc?: string;
}

export default function CinematicIntro({
  onComplete,
  videoSrc = "/videos/file.mp4",
}: CinematicIntroProps) {
  const [phase, setPhase] = useState<
    "loading" | "playing" | "reveal" | "transitioning" | "finished"
  >("loading");
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      onComplete();
      setPhase("finished");
      return;
    }

    // Lock body scroll during intro
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [onComplete]);

  // Video autoplay & timer coordination
  useEffect(() => {
    if (phase === "finished") return;

    const video = videoRef.current;
    if (video) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setHasStarted(true);
            setPhase("playing");
          })
          .catch(() => {
            // If autoplay is blocked by browser policy, proceed gracefully
            setHasStarted(true);
            setPhase("playing");
          });
      }
    }

    // Phase 2: Brand Reveal ~2 seconds after start
    const revealTimer = setTimeout(() => {
      setPhase((current) => (current === "finished" ? "finished" : "reveal"));
    }, 2000);

    // Phase 3: Auto transition to homepage after ~5.5 seconds total
    const transitionTimer = setTimeout(() => {
      handleFinish();
    }, 5600);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(transitionTimer);
    };
  }, []);

  const handleFinish = () => {
    if (phase === "finished" || phase === "transitioning") return;

    setPhase("transitioning");

    // Fade out overlay & unlock scroll
    setTimeout(() => {
      setPhase("finished");
      document.body.style.overflow = "";
      onComplete();
    }, 900);
  };

  if (phase === "finished") {
    return null;
  }

  const isRevealing = phase === "reveal" || phase === "transitioning";
  const isTransitioning = phase === "transitioning";

  return (
    <aside
      aria-label="Cinematic Entrance"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden transition-opacity duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isTransitioning ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Video Container with Subtle Zoom Transition */}
      <div
        className={`absolute inset-0 w-full h-full transform transition-transform duration-1000 ease-out ${
          isTransitioning ? "scale-105" : "scale-100"
        }`}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          className="w-full h-full object-cover select-none"
        />

        {/* Cinematic Vignette & Ambient Gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#240c0e]/70 mix-blend-multiply pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-black/30 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Phase 2: Brand Typography Reveal */}
      <BrandReveal visible={isRevealing} />

      {/* Skip / Enter Site Button */}
      <div className="absolute bottom-8 right-8 z-20">
        <button
          type="button"
          onClick={handleFinish}
          className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-white/70 hover:text-white hover:border-white/50 text-xs font-light tracking-[0.2em] uppercase transition-all duration-300"
          aria-label="Skip introduction and enter website"
        >
          <span>Enter Site</span>
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
            &rarr;
          </span>
        </button>
      </div>

      {/* Subtle Bottom Brand Watermark */}
      <div className="absolute bottom-8 left-8 z-20 pointer-events-none hidden sm:block">
        <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-mono">
          [ 2026 / FILM 01 ]
        </span>
      </div>
    </aside>
  );
}

