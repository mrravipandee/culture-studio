"use client";

import { useEffect, type DependencyList, type RefObject } from "react";
import { useLenis } from "@/components/motion/MotionProvider";

type GsapModule = typeof import("gsap").gsap;
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger").ScrollTrigger;

/**
 * GSAP ScrollTrigger, only for complex scroll-linked sequences (pinning,
 * scrubbed multi-step timelines). Simple reveals use <Reveal> instead.
 *
 * - GSAP is lazy loaded, so pages that do not use this hook never ship it.
 * - Everything created inside `setup` is reverted on unmount (gsap.context).
 * - Skipped entirely under prefers-reduced-motion.
 * - Kept in sync with Lenis smooth scroll.
 *
 * useScrollTimeline(sectionRef, (gsap, ScrollTrigger, el) => {
 *   gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "+=100%", scrub: true, pin: true } })
 *     .to(el.querySelector(".a"), { yPercent: -20 });
 * });
 */
export function useScrollTimeline(
  scope: RefObject<HTMLElement | null>,
  setup: (gsap: GsapModule, ScrollTrigger: ScrollTriggerModule, el: HTMLElement) => void,
  deps: DependencyList = [],
) {
  const lenis = useLenis();

  useEffect(() => {
    const el = scope.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: { revert: () => void } | undefined;
    let off: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      if (lenis) off = lenis.on("scroll", ScrollTrigger.update);
      ctx = gsap.context(() => setup(gsap, ScrollTrigger, el), el);
      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      off?.();
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenis, ...deps]);
}
