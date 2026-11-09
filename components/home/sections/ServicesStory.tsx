"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { ContentImage } from "@/lib/content/home";
import { GSAP_EASE } from "@/lib/motion";
import { useScrollTimeline } from "@/hooks/useScrollTimeline";
import ImageFrame from "../shared/ImageFrame";


export type StoryService = {
  id: string;
  title: string;
  description: string;
  /** Items shown as links (e.g. official service names to /services anchors). */
  includes: { label: string; href: string }[];
  /** Closing link for the stage. */
  more: { label: string; href: string };
  image: ContentImage;
};

/** Space kept clear above and below the pinned stage (navbar + breathing room). */
const VIEWPORT_MARGIN = 160;
/** Scroll distance per service transition, as a fraction of the viewport height. */
const STAGE_SCROLL = 1.1;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Services scrollytelling.
 *
 * Modes (set on the root as data-mode, never via React state, so scrolling causes no re-renders):
 * - "static"   Server HTML, no JS, or reduced motion: all four services stacked and fully readable.
 * - "pinned"   One stage pinned with GSAP ScrollTrigger; a scrubbed timeline moves through the
 *              four services in the same position (right to left slide, opacity, subtle scale).
 * - "flow"     Stage too tall for the viewport (small phones): no pinning. Each service slides in
 *              as it scrolls into view (scrubbed, reversible) and a floating counter tracks progress.
 *
 * Every panel stays in the DOM with its full text, so screen readers always get all four services.
 */
export default function ServicesStory({ services }: { services: StoryService[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  /** Scroll position for each stage while pinned; used to bring a focused stage into view. */
  const stageScrollRef = useRef<((i: number) => number) | null>(null);
  const total = pad(services.length);

  // Pinned / flow timelines via the shared GSAP helper (lazy GSAP, Lenis sync,
  // reduced-motion skip, rebuild on width change, cleanup on unmount).
  useScrollTimeline(
    rootRef,
    (gsap, ScrollTrigger, root) => {
      const q = <T extends Element>(sel: string, el: ParentNode = root) => Array.from(el.querySelectorAll<T>(sel));
      root.dataset.mode = "static";

      const pin = root.querySelector<HTMLElement>("[data-svc-pin]")!;
      const panels = q<HTMLElement>("[data-svc-panel]");
      const count = root.querySelector<HTMLElement>("[data-svc-count]")!;
      const bars = q<HTMLElement>("[data-svc-bar]");
      const setCount = (i: number) => {
        const next = pad(i + 1);
        if (count.textContent !== next) count.textContent = next;
        root.dataset.active = String(i);
        panels.forEach((p, k) => p.toggleAttribute("data-current", k === i));
      };

      // Measure the single-stage layout; fall back to flow mode if it cannot fit.
      root.dataset.mode = "pinned";
      const fits = pin.offsetHeight + VIEWPORT_MARGIN <= window.innerHeight;
      if (!fits) root.dataset.mode = "flow";

        const parts = (p: HTMLElement) => ({
          text: p.querySelector<HTMLElement>("[data-svc-text]")!,
          media: p.querySelector<HTMLElement>("[data-svc-media]")!,
        });

        if (fits) {
          // ---------- Pinned stage ----------
          panels.slice(1).forEach((p) => {
            const { text, media } = parts(p);
            gsap.set(text, { x: 64, opacity: 0 });
            gsap.set(media, { x: 96, scale: 1.04, opacity: 0 });
          });
          gsap.set(bars.slice(1), { scaleX: 0 });
          setCount(0);

          const labels: number[] = [];
          const tl = gsap.timeline({
            defaults: { ease: GSAP_EASE.scrub },
            // Driven by the timeline itself (not scroll events), so the counter stays
            // correct while the scrub catches up after a fast scroll.
            onUpdate: () => syncTo(tl.time()),
            scrollTrigger: {
              trigger: pin,
              start: "center center",
              end: () => `+=${(panels.length - 1) * window.innerHeight * STAGE_SCROLL}`,
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              // Restored scroll positions and refreshes jump the timeline without updates.
              onRefresh: (self) => syncTo(self.progress * tl.duration()),
            },
          });
          function syncTo(t: number) {
            let i = 0;
            labels.forEach((at, k) => {
              if (t >= at) i = k + 1;
            });
            setCount(i);
          }

          const stageTimes = [0];
          tl.to({}, { duration: 0.4 }); // let the first service settle before moving on
          for (let i = 1; i < panels.length; i++) {
            const prev = parts(panels[i - 1]);
            const next = parts(panels[i]);
            const at = tl.duration();
            labels.push(at + 0.5); // counter flips at the midpoint of the transition
            tl.to(prev.text, { x: -64, opacity: 0, duration: 0.7 }, at)
              .to(prev.media, { x: -96, scale: 0.96, opacity: 0, duration: 0.8 }, at)
              .to(next.media, { x: 0, scale: 1, opacity: 1, duration: 1 }, at + 0.15)
              .to(next.text, { x: 0, opacity: 1, duration: 0.9 }, at + 0.3)
              .to(bars[i], { scaleX: 1, duration: 1, ease: GSAP_EASE.linear }, at)
              .to({}, { duration: 0.9 }); // reading hold
            stageTimes.push(tl.duration() - 0.45);
          }
          stageScrollRef.current = (i: number) => {
            const st = tl.scrollTrigger!;
            return st.start + (stageTimes[i] / tl.duration()) * (st.end - st.start);
          };
        } else {
          // ---------- Flow fallback (no pinning) ----------
          setCount(0);
          panels.forEach((p, i) => {
            const { text, media } = parts(p);
            gsap.fromTo(
              media,
              { x: 48, scale: 1.04, opacity: 0.2 },
              { x: 0, scale: 1, opacity: 1, ease: GSAP_EASE.linear, scrollTrigger: { trigger: p, start: "top 95%", end: "top 55%", scrub: 0.5 } },
            );
            gsap.fromTo(
              text,
              { x: 32, opacity: 0.2 },
              { x: 0, opacity: 1, ease: GSAP_EASE.linear, scrollTrigger: { trigger: p, start: "top 85%", end: "top 45%", scrub: 0.5 } },
            );
            ScrollTrigger.create({
              trigger: p,
              start: "top 60%",
              end: "bottom 60%",
              onToggle: (self) => self.isActive && setCount(i),
            });
            gsap.set(bars[i], { scaleX: 1 });
          });
        }

      // Runs on rebuild/unmount (gsap.context revert): back to the readable stacked layout.
      return () => {
        stageScrollRef.current = null;
        root.dataset.mode = "static";
      };
    },
    [],
    { rebuildOnResize: true },
  );

  // Keyboard: tabbing into a stage that is not on screen scrolls the story to it.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onFocusIn = (e: FocusEvent) => {
      const stageScroll = stageScrollRef.current;
      if (!stageScroll) return;
      const panel = (e.target as HTMLElement).closest<HTMLElement>("[data-svc-panel]");
      if (!panel || panel.hasAttribute("data-current")) return;
      const i = Array.from(root.querySelectorAll("[data-svc-panel]")).indexOf(panel);
      window.scrollTo({ top: stageScroll(i), behavior: "instant" as ScrollBehavior });
    };
    root.addEventListener("focusin", onFocusIn);
    return () => root.removeEventListener("focusin", onFocusIn);
  }, []);

  return (
    <div ref={rootRef} className="svc" data-mode="static" data-active="0">
      <div data-svc-pin className="svc__pin container-content">
        <div className="svc__progress" aria-hidden="true">
          <span className="svc__count">
            <span data-svc-count>01</span> / {total}
          </span>
          <span className="svc__bars">
            {services.map((s) => (
              <span key={s.id} className="svc__bar">
                <span data-svc-bar className="svc__bar-fill" />
              </span>
            ))}
          </span>
          <span className="svc__label">Scroll to explore</span>
        </div>

        <div className="svc__stage">
          {services.map((service, index) => (
            <article
              key={service.id}
              id={service.id}
              data-svc-panel
              aria-labelledby={`${service.id}-title`}
              className="svc__panel"
            >
              <div data-svc-text className="svc__text">
                <span className="eyebrow text-burgundy">
                  {pad(index + 1)}
                  <span className="svc__of"> / {total}</span>
                </span>
                <h3 id={`${service.id}-title`} className="heading-3 mt-4 text-ink">
                  {service.title}
                </h3>
                <p className="body-3 mt-4 max-w-lg text-ink-2">{service.description}</p>
                <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 lg:mt-8">
                  {service.includes.map((item) => (
                    <li key={item.href} className="flex items-center gap-3">
                      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-burgundy" />
                      <Link href={item.href} className="link body-5 min-h-6 py-0.5 text-ink">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={service.more.href} className="link title-4 mt-6 min-h-6 py-0.5 text-burgundy lg:mt-8">
                  {service.more.label}
                  <span aria-hidden="true" className="btn-arrow">↗</span>
                </Link>
              </div>

              <div data-svc-media className="svc__media">
                <ImageFrame
                  image={service.image}
                  aspect="aspect-landscape"
                  sizes="(min-width: 1024px) 50vw, (min-width: 768px) 42vw, 100vw"
                  className="rounded-lg"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
