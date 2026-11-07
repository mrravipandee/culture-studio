"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE, VIEWPORT } from "@/lib/motion";

const FROM = {
  up: "inset(100% 0% 0% 0%)",
  down: "inset(0% 0% 100% 0%)",
  left: "inset(0% 0% 0% 100%)",
  right: "inset(0% 100% 0% 0%)",
} as const;

interface ClipRevealProps {
  children: ReactNode;
  className?: string;
  /** Edge the image grows from. */
  from?: keyof typeof FROM;
  delay?: number;
  /** Starting scale of the inner media (4. subtle image scale). 1 disables it. */
  scale?: number;
}

/**
 * 3. Image clip-path reveal + 4. subtle image scale.
 * The frame unclips while the media settles from a slight zoom.
 * Reduced motion: plain fade.
 */
export function ClipReveal({ children, className = "", from = "up", delay = 0, scale = 1.12 }: ClipRevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={
        reduce
          ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6, delay } } }
          : {
              hidden: { clipPath: FROM[from] },
              show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.1, ease: EASE, delay } },
            }
      }
    >
      <motion.div
        className="h-full w-full"
        variants={{
          hidden: { scale: reduce ? 1 : scale },
          show: { scale: 1, transition: { duration: 1.4, ease: EASE, delay } },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
