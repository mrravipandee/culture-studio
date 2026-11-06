"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * Site wide inertial scrolling (Lenis) plus a thin reading progress bar.
 * Disabled entirely under prefers-reduced-motion.
 */
export default function SmoothScroll() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (reduce) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      wheelMultiplier: 0.95,
      anchors: { offset: -96 },
    });

    // Pause inertia whenever something (e.g. the mobile menu) locks the body.
    const sync = () =>
      document.body.style.overflow === "hidden" ? lenis.stop() : lenis.start();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    return () => {
      observer.disconnect();
      lenis.destroy();
    };
  }, [reduce]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand-burgundy"
    />
  );
}
