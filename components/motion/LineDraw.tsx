"use client";

import { motion } from "motion/react";
import { EASE, VIEWPORT } from "@/lib/motion";

/** Hairline that draws left to right once in view (scaleX only). */
export function LineDraw({ className = "bg-line" }: { className?: string }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`block h-px w-full origin-left ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.2, ease: EASE }}
    />
  );
}
