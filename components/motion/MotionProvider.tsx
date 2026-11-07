"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { MotionConfig, useReducedMotion } from "motion/react";
import { EASE, DURATION } from "@/lib/motion";
import ScrollProgress from "./ScrollProgress";

const LenisContext = createContext<Lenis | null>(null);

/** Access the shared Lenis instance (null under reduced motion or before mount). */
export const useLenis = () => useContext(LenisContext);

/**
 * Site wide motion root:
 * - MotionConfig reducedMotion="user": every Motion component drops transforms
 *   (keeps opacity) when the OS asks for reduced motion.
 * - Lenis inertial scroll, paused whenever something locks body scroll.
 * - Reading progress bar.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduce) return;

    const instance = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      anchors: { offset: -96 },
      // Native scrolling on touch keeps mobile fast and predictable.
      syncTouch: false,
    });
    // Publish asynchronously: Lenis is an external system, context updates follow it.
    let alive = true;
    queueMicrotask(() => alive && setLenis(instance));

    const sync = () =>
      document.body.style.overflow === "hidden" ? instance.stop() : instance.start();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    return () => {
      alive = false;
      observer.disconnect();
      instance.destroy();
      setLenis(null);
    };
  }, [reduce]);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DURATION.slow, ease: EASE }}>
      <LenisContext.Provider value={lenis}>
        <ScrollProgress />
        {children}
      </LenisContext.Provider>
    </MotionConfig>
  );
}
