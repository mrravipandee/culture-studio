"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { EASE } from "@/lib/motion";

/** Flip to false to disable route transitions site wide. */
export const PAGE_TRANSITIONS = true;

// First paint is never animated (it would delay LCP); only client navigations fade.
let hasNavigated = false;

/**
 * 7. Optional page transition, used from app/(website)/template.tsx.
 * Opacity only: a transform on this wrapper would break the fixed Navbar.
 * No exit animation, so navigation is never delayed.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const [animate] = useState(() => PAGE_TRANSITIONS && hasNavigated);
  useEffect(() => {
    hasNavigated = true;
  }, []);

  if (!animate) return <>{children}</>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: EASE }}>
      {children}
    </motion.div>
  );
}
