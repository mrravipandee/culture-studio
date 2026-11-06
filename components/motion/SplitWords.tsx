"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface SplitWordsProps {
  text: string;
  className?: string;
}

/**
 * Masked word by word rise for headings. Plays once when in view.
 * Stagger is capped so long titles never exceed ~400ms of delay.
 */
export default function SplitWords({ text, className = "" }: SplitWordsProps) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const step = Math.min(0.06, 0.4 / Math.max(words.length, 1));

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12% 0px" }}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              hidden: reduce ? { opacity: 0 } : { y: "105%", opacity: 0 },
              show: { y: "0%", opacity: 1 },
            }}
            transition={{ duration: 0.8, ease: EASE, delay: i * step }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </motion.span>
  );
}
