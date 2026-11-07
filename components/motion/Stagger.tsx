"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function StaggerList({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.ul
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
    >
      {children}
    </motion.ul>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      className={className}
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </motion.li>
  );
}

/** Hairline that draws left to right on entering view. */
export function LineDraw({ className = "" }: { className?: string }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`block h-px origin-left ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.2, ease: EASE }}
    />
  );
}

/** Image curtain: a cover panel lifts away (transform only), image settles from a slight zoom. */
export function CurtainReveal({ children, className = "", cover = "bg-white" }: { children: ReactNode; className?: string; cover?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15% 0px" }}
    >
      <motion.div
        variants={{
          hidden: reduce ? { opacity: 0 } : { opacity: 1, scale: 1.12 },
          show: { opacity: 1, scale: 1, transition: { duration: 1.4, ease: EASE } },
        }}
      >
        {children}
      </motion.div>
      {!reduce && (
        <motion.span
          aria-hidden="true"
          className={`absolute inset-0 origin-top ${cover}`}
          variants={{
            hidden: { scaleY: 1 },
            show: { scaleY: 0, transition: { duration: 1, ease: EASE } },
          }}
        />
      )}
    </motion.div>
  );
}
