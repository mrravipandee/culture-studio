"use client";

import { useEffect, type RefObject } from "react";
import { VIEWPORT } from "@/lib/motion";

/**
 * Marks an element with [data-in] the first time it enters the viewport.
 * Pure DOM (no React state, no re-renders). CSS in app/globals.css animates
 * from the armed start state to rest. When the page is not armed (no JS before
 * hydration, reduced motion, no IntersectionObserver) it marks immediately, so
 * nothing can stay hidden.
 */
export function useRevealOnce(ref: RefObject<HTMLElement | null>, immediate = false, margin: string = VIEWPORT.margin) {
  useEffect(() => {
    const el = ref.current;
    if (!el || el.hasAttribute("data-in")) return;

    const reveal = () => el.setAttribute("data-in", "");
    const armed = document.documentElement.hasAttribute("data-motion-armed");
    if (!armed || !("IntersectionObserver" in window)) return reveal();

    if (immediate) {
      // Two frames so the armed start state is painted before transitioning.
      let raf = requestAnimationFrame(() => (raf = requestAnimationFrame(reveal)));
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          reveal();
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, immediate, margin]);
}
