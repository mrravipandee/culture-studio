"use client";

import { motion, useReducedMotion } from "motion/react";
import { DURATION, EASE, VIEWPORT, stagger } from "@/lib/motion";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span";

interface TextMaskProps {
  /** Plain text. Use "\n" to force a meaningful line break. */
  text: string;
  as?: HeadingTag;
  /** "word" for short titles, "line" for long ones (fewer nodes, calmer). */
  by?: "word" | "line";
  className?: string;
  id?: string;
  delay?: number;
  /** Animate on mount instead of on scroll (hero). */
  immediate?: boolean;
}

/**
 * 2. Text mask reveal. Each word/line rises out of an overflow mask.
 * Screen readers get the full sentence via aria-label; the split spans are hidden.
 */
export function TextMask({ text, as = "h2", by = "word", className = "", id, delay = 0, immediate = false }: TextMaskProps) {
  const reduce = useReducedMotion();
  const Component = motion[as] as typeof motion.h2;
  const lines = text.split("\n");
  const units = by === "line" ? lines.map((l) => [l]) : lines.map((l) => l.split(" "));
  const total = units.flat().length;
  const step = stagger(total, by === "line" ? 0.1 : 0.05);
  let i = 0;

  const trigger = immediate
    ? { initial: "hidden", animate: "show" }
    : { initial: "hidden", whileInView: "show", viewport: VIEWPORT };

  return (
    <Component id={id} className={className} aria-label={text.replace(/\n/g, " ")} {...trigger}>
      {units.map((line, li) => (
        <span key={li} aria-hidden="true" className="block">
          {line.map((unit, ui) => {
            const index = i++;
            return (
              <span key={ui} className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: reduce ? { opacity: 0 } : { y: "110%" },
                    show: {
                      y: "0%",
                      opacity: 1,
                      transition: { duration: DURATION.mask, ease: EASE, delay: delay + index * step },
                    },
                  }}
                >
                  {unit}
                </motion.span>
                {ui < line.length - 1 && " "}
              </span>
            );
          })}
        </span>
      ))}
    </Component>
  );
}
