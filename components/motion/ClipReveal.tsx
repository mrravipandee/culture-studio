"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useRevealOnce } from "./useRevealOnce";

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
  /** Seconds. */
  delay?: number;
  /** Starting scale of the inner media. 1 disables the settle. */
  scale?: number;
}

/**
 * 3. Image clip-path reveal (1100ms) with inner scale settle (1400ms), house curve.
 * Server HTML shows the image uncropped; the clipped start state applies only once
 * the page is armed. Styles: `.cr` in app/globals.css.
 */
export function ClipReveal({ children, className = "", from = "up", delay = 0, scale = 1.12 }: ClipRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useRevealOnce(ref);
  const vars = {
    "--cr-from": FROM[from],
    "--cr-scale": scale,
    ...(delay ? { "--cr-delay": `${Math.round(delay * 1000)}ms` } : {}),
  } as CSSProperties;

  return (
    <div ref={ref} className={`cr relative overflow-hidden ${className}`} style={vars}>
      <div className="cr-inner h-full w-full">{children}</div>
    </div>
  );
}
