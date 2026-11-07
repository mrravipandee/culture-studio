"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin reading progress bar. scaleX only, never intercepts pointer events. */
export default function ScrollProgress({ className = "bg-burgundy" }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 32, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left ${className}`}
    />
  );
}
