"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { DURATION, EASE, REVEAL_DISTANCE, VIEWPORT } from "@/lib/motion";

type Tag = "div" | "section" | "article" | "header" | "footer" | "ul" | "ol" | "li" | "p" | "span" | "figure" | "aside";

type Direction = "up" | "down" | "left" | "right" | "none";

const offset = (d: Direction, n: number) =>
  ({ up: { y: n }, down: { y: -n }, left: { x: n }, right: { x: -n }, none: {} })[d];

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  as?: Tag;
  delay?: number;
  direction?: Direction;
  distance?: number;
  duration?: number;
}

/**
 * 1. Fade-up reveal. Plays once when the element enters the viewport
 * (Motion's whileInView = IntersectionObserver). Use on blocks, not on every line.
 */
export function Reveal({
  children,
  as = "div",
  delay = 0,
  direction = "up",
  distance = REVEAL_DISTANCE,
  duration = DURATION.slow,
  ...props
}: RevealProps) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      initial={{ opacity: 0, ...offset(direction, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: EASE }}
      {...props}
    >
      {children}
    </Component>
  );
}

interface GroupProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  as?: Tag;
  /** Seconds between children; total delay is capped at 400ms. */
  step?: number;
  count?: number;
  delay?: number;
}

/** Container that staggers its <RevealItem> children once in view. */
export function RevealGroup({ children, as = "div", step = 0.06, count = 6, delay = 0, ...props }: GroupProps) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{
        show: { transition: { staggerChildren: Math.min(step, 0.4 / Math.max(count, 1)), delayChildren: delay } },
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  as = "div",
  distance = 16,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & { children: ReactNode; as?: Tag; distance?: number }) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      variants={{
        hidden: { opacity: 0, y: distance },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
