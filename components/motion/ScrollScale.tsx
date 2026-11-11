"use client";

import { useRef, useSyncExternalStore, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

interface ScrollScaleProps {
  children: ReactNode;
  className?: string;
  /** Scale at the moment the frame enters the viewport. */
  from?: number;
  /** Vertical drift in percent across the whole pass (0 = none). */
  drift?: number;
}

/**
 * 4. Subtle image scale, scroll linked. Media eases from `from` to 1 as the
 * frame crosses the viewport, with optional parallax drift.
 * Uses Motion's scroll timeline (no scroll listeners per frame on supporting browsers).
 */
const NARROW = "(max-width: 767px)";
const subscribeNarrow = (cb: () => void) => {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function ScrollScale({ children, className = "", from = 1.1, drift: driftProp = 0 }: ScrollScaleProps) {
  // No parallax drift on narrow screens (phones): scale only.
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW).matches, () => false);
  const drift = narrow ? 0 : driftProp;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [from, 1], { clamp: true });
  const y = useTransform(scrollYProgress, [0, 1], [`${-drift}%`, `${drift}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div className="h-full w-full will-change-transform" style={reduce ? undefined : { scale, y }}>
        {children}
      </motion.div>
    </div>
  );
}
