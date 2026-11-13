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

/** The element named by the URL hash (#id or [name]), if any. */
function hashTarget(): HTMLElement | null {
  const raw = window.location.hash.slice(1);
  if (!raw) return null;
  let id = raw;
  try {
    id = decodeURIComponent(raw);
  } catch {
    // Malformed escape sequence: use the raw fragment.
  }
  return document.getElementById(id) ?? (document.getElementsByName(id)[0] as HTMLElement | undefined) ?? null;
}
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
  const lenisRef = useRef(lenis);
  const setupRef = useRef(setup);
  useEffect(() => {
    setupRef.current = setup;
    lenisRef.current = lenis;
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
      // Hash anchoring: GSAP loads asynchronously, so the browser / Next.js has usually
      // already scrolled to the URL hash (e.g. /#contact) before pinning inserts its
      // scroll space. If the hash target is on or near the screen, remember where it
      // sits and restore that after the rebuild, so the layout change cannot push it
      // out of view. Measured, not estimated: no timeouts or fixed offsets.
      const anchor = hashTarget();
      const anchorTop = anchor?.getBoundingClientRect().top;
      const anchored = anchor !== null && anchorTop !== undefined && Math.abs(anchorTop) <= window.innerHeight;

      ctx?.revert(); // also runs the cleanup returned by the previous setup
      ctx = null;
      if (mods && !reduce.matches) {
        const { gsap, ScrollTrigger } = mods;
        ctx = gsap.context(() => setupRef.current(gsap, ScrollTrigger, el), el);
        ScrollTrigger.refresh();
      }

      if (anchored) {
        const shift = anchor!.getBoundingClientRect().top - anchorTop!;
        if (Math.abs(shift) >= 1) {
          const top = window.scrollY + shift;
          const lenisInstance = lenisRef.current;
          if (lenisInstance) {
            // Lenis caches the page height (updated later by its ResizeObserver) and may still
            // hold the previous page's scroll target: re-measure, then move it with its own API.
            lenisInstance.resize();
            lenisInstance.scrollTo(top, { immediate: true, force: true });
          } else {
            window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
          }
          mods?.ScrollTrigger.update();
        }
      }
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
