"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface HeroRevealProps {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}

/**
 * Client island that only toggles data attributes; all motion lives in CSS.
 * Server HTML renders fully visible, so the hero stays usable if JS fails,
 * and nothing is hidden for users who prefer reduced motion.
 */
export default function HeroReveal({
  children,
  className,
  labelledBy,
}: HeroRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    el.dataset.motion = "ready";

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) play();
      },
      { rootMargin: "0px 0px -15% 0px" }
    );

    function play() {
      cleanup();
      frame = window.requestAnimationFrame(() => {
        el!.dataset.state = "in";
      });
    }

    function cleanup() {
      observer.disconnect();
      el!.removeEventListener("focusin", play);
    }

    observer.observe(el);
    // Keyboard users tabbing in should never meet hidden content.
    el.addEventListener("focusin", play);

    return () => {
      cleanup();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={ref} className={className} aria-labelledby={labelledBy}>
      {children}
    </section>
  );
}
