"use client";

import React, { type ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  staggerChildren?: number;
}

const OFFSETS = {
  up: (d: number) => ({ x: 0, y: d }),
  down: (d: number) => ({ x: 0, y: -d }),
  left: (d: number) => ({ x: d, y: 0 }),
  right: (d: number) => ({ x: -d, y: 0 }),
  none: () => ({ x: 0, y: 0 }),
};

/** Rise + fade once on entering the viewport. Opacity only under reduced motion. */
export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 32,
  duration = 0.8,
  staggerChildren,
  ...props
}: ScrollRevealProps) {
  const reduce = useReducedMotion();
  const offset = reduce ? OFFSETS.none() : OFFSETS[direction](distance);

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
