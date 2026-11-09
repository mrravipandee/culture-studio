"use client";

import { useRef, type CSSProperties, type ElementType } from "react";
import { stagger } from "@/lib/motion";
import { useRevealOnce } from "./useRevealOnce";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span";

interface TextMaskProps {
  /** Plain text. Use "\n" to force a meaningful line break. */
  text: string;
  as?: HeadingTag;
  /** "word" for short titles, "line" for long ones (fewer nodes, calmer). */
  by?: "word" | "line";
  className?: string;
  id?: string;
  /** Seconds before the first unit moves. */
  delay?: number;
  /** Animate on mount instead of on scroll (hero). */
  immediate?: boolean;
}

/**
 * 2. Text mask reveal. Each word/line rises out of an overflow mask (900ms, house curve).
 * Server HTML shows the text at rest; the masked start state applies only once the
 * page is armed. Screen readers get the full sentence via aria-label.
 * Styles: `.tm` in app/globals.css.
 */
export function TextMask({ text, as = "h2", by = "word", className = "", id, delay = 0, immediate = false }: TextMaskProps) {
  const ref = useRef<HTMLElement>(null);
  useRevealOnce(ref, immediate);

  const lines = text.split("\n");
  const units = by === "line" ? lines.map((l) => [l]) : lines.map((l) => l.split(" "));
  const total = units.flat().length;
  const step = stagger(total, by === "line" ? 0.1 : 0.05);
  let i = 0;

  const vars = {
    "--tm-step": `${Math.round(step * 1000)}ms`,
    ...(delay ? { "--tm-delay": `${Math.round(delay * 1000)}ms` } : {}),
  } as CSSProperties;

  const Tag = as as ElementType;
  return (
    <Tag ref={ref} id={id} className={`tm ${className}`} style={vars} aria-label={text.replace(/\n/g, " ")}>
      {units.map((line, li) => (
      <span key={li} aria-hidden="true" className="block">
        {line.map((unit, ui) => {
          const index = i++;
          return (
            <span key={ui} className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
              <span className="tm-inner" style={{ "--tm-i": index } as CSSProperties}>
                {unit}
              </span>
              {ui < line.length - 1 && " "}
            </span>
          );
        })}
      </span>
      ))}
    </Tag>
  );
}
