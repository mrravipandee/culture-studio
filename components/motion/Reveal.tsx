"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { REVEAL_DISTANCE } from "@/lib/motion";
import { useRevealOnce } from "./useRevealOnce";

type Tag = "div" | "section" | "article" | "header" | "footer" | "ul" | "ol" | "li" | "p" | "span" | "figure" | "aside";
type Direction = "up" | "down" | "left" | "right" | "none";

const offset = (d: Direction, n: number) =>
  ({ up: [0, n], down: [0, -n], left: [n, 0], right: [-n, 0], none: [0, 0] })[d];

type Common = Omit<HTMLAttributes<HTMLElement>, "children"> & { children: ReactNode; as?: Tag };

const ms = (s: number) => `${Math.round(s * 1000)}ms`;

/**
 * 1. Fade-up reveal. Plays once on entering the viewport.
 * Server HTML is fully visible; the start state applies only once the page is
 * armed (lib/motion-arm.ts). Styles: `.rv` in app/globals.css.
 */
export function Reveal({
  children,
  as = "div",
  delay = 0,
  direction = "up",
  distance = REVEAL_DISTANCE,
  duration,
  viewport,
  className = "",
  style,
  ...rest
}: Common & {
  delay?: number;
  direction?: Direction;
  distance?: number;
  duration?: number;
  /** Optional trigger margin, e.g. { margin: "120px 0px 0px 0px" } to start earlier. Always plays once. */
  viewport?: { once?: boolean; margin?: string };
}) {
  const ref = useRef<HTMLElement>(null);
  useRevealOnce(ref, false, viewport?.margin);
  const [x, y] = offset(direction, distance);
  const vars = {
    "--rv-x": `${x}px`,
    "--rv-y": `${y}px`,
    ...(delay ? { "--rv-delay": ms(delay) } : {}),
    ...(duration ? { "--rv-dur": ms(duration) } : {}),
    ...style,
  } as CSSProperties;
  const Tag = as as ElementType;
  return (
    <Tag ref={ref} className={`rv ${className}`} style={vars} {...rest}>
      {children}
    </Tag>
  );
}

/** Container that staggers its <RevealItem> children once in view (60ms steps, 400ms cap). */
export function RevealGroup({
  children,
  as = "div",
  step = 0.06,
  count = 6,
  delay = 0,
  className = "",
  style,
  ...rest
}: Common & { step?: number; count?: number; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  useRevealOnce(ref);

  // Index direct items once (DOM only) so CSS can compute each item's delay.
  useEffect(() => {
    ref.current?.querySelectorAll<HTMLElement>(".rv-item").forEach((el, i) => el.style.setProperty("--rv-i", String(i)));
  }, []);

  const vars = {
    "--rv-step": ms(Math.min(step, 0.4 / Math.max(count, 1))),
    ...(delay ? { "--rv-group-delay": ms(delay) } : {}),
    ...style,
  } as CSSProperties;
  const Tag = as as ElementType;
  return (
    <Tag ref={ref} className={`rv-group ${className}`} style={vars} {...rest}>
      {children}
    </Tag>
  );
}

export function RevealItem({
  children,
  as = "div",
  distance = 16,
  className = "",
  style,
  ...rest
}: Common & { distance?: number }) {
  const vars = { "--rv-y": `${distance}px`, ...style } as CSSProperties;
  const Tag = as as ElementType;
  return (
    <Tag className={`rv-item ${className}`} style={vars} {...rest}>
      {children}
    </Tag>
  );
}
