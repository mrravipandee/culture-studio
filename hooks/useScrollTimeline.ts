"use client";

import { useEffect, useRef, type DependencyList, type RefObject } from "react";
import { useLenis } from "@/components/motion/MotionProvider";

type GsapModule = typeof import("gsap").gsap;
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger").ScrollTrigger;
type Modules = { gsap: GsapModule; ScrollTrigger: ScrollTriggerModule };

/** Setup may return a cleanup; it runs on every rebuild and on unmount. */
export type ScrollTimelineSetup = (gsap: GsapModule, ScrollTrigger: ScrollTriggerModule, el: HTMLElement) => void | (() => void);

interface Options {
  /** Rebuild after width changes (debounced 200ms; ignores mobile URL-bar height jitter). */
  rebuildOnResize?: boolean;
}

let modules: Promise<Modules> | null = null;
/** GSAP + ScrollTrigger, loaded once on demand: pages without scroll timelines never ship them. */
function loadGsap(): Promise<Modules> {
  modules ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  });
  return modules;
}

/**
 * GSAP ScrollTrigger for complex scroll-linked sequences (pinning, scrubbed
 * multi-step timelines). Simple entrances use <Reveal> instead.
 *
 * - Lazy loads GSAP once.
 * - Everything created in `setup` lives in a gsap.context and is reverted on
 *   rebuild/unmount; a function returned from `setup` runs at the same time.
 * - Not built under prefers-reduced-motion; rebuilds if that preference changes.
 * - Refreshes after web fonts load (text height can change).
 * - Kept in sync with Lenis smooth scroll (independent of rebuilds).
 *
 * useScrollTimeline(sectionRef, (gsap, ScrollTrigger, el) => {
 *   gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "+=100%", scrub: true, pin: true } })
 *     .to(el.querySelector(".a"), { yPercent: -20 });
 * });
 */
export function useScrollTimeline(
  scope: RefObject<HTMLElement | null>,
  setup: ScrollTimelineSetup,
  deps: DependencyList = [],
  { rebuildOnResize = false }: Options = {},
) {
  const lenis = useLenis();
  const setupRef = useRef(setup);
  useEffect(() => {
    setupRef.current = setup;
  });

  // Lenis ↔ ScrollTrigger sync (does not rebuild timelines).
  useEffect(() => {
    if (!lenis) return;
    let off: (() => void) | undefined;
    let cancelled = false;
    loadGsap().then(({ ScrollTrigger }) => {
      if (!cancelled) off = lenis.on("scroll", ScrollTrigger.update);
    });
    return () => {
      cancelled = true;
      off?.();
    };
  }, [lenis]);

  useEffect(() => {
    const el = scope.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let mods: Modules | null = null;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    let timer = 0;
    let lastWidth = window.innerWidth;

    const build = () => {
      ctx?.revert(); // also runs the cleanup returned by the previous setup
      ctx = null;
      if (!mods || reduce.matches) return;
      const { gsap, ScrollTrigger } = mods;
      ctx = gsap.context(() => setupRef.current(gsap, ScrollTrigger, el), el);
      ScrollTrigger.refresh();
    };

    loadGsap().then((m) => {
      if (cancelled) return;
      mods = m;
      build();
    });

    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 200);
    };
    if (rebuildOnResize) window.addEventListener("resize", onResize);
    reduce.addEventListener("change", build);
    document.fonts?.ready.then(() => !cancelled && mods?.ScrollTrigger.refresh());

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      reduce.removeEventListener("change", build);
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, rebuildOnResize, ...deps]);
}
