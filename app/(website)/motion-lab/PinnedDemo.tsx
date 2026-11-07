"use client";

import { useRef } from "react";
import { useScrollTimeline } from "@/hooks/useScrollTimeline";

/** GSAP ScrollTrigger demo: pinned, scrubbed three step sequence. */
export default function PinnedDemo() {
  const ref = useRef<HTMLElement>(null);

  useScrollTimeline(ref, (gsap, _ST, el) => {
    const steps = el.querySelectorAll("[data-step]");
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top top", end: "+=150%", scrub: 0.6, pin: true },
      defaults: { ease: "none" },
    });
    steps.forEach((step, i) => {
      if (i === 0) return;
      tl.to(steps[i - 1], { opacity: 0.15, yPercent: -20 }).from(step, { opacity: 0, yPercent: 20 }, "<");
    });
  });

  return (
    <section ref={ref} className="surface-ink flex min-h-svh items-center">
      <div className="container-content grid gap-6">
        <p className="eyebrow text-paper-3">06 · useScrollTimeline (GSAP, pinned + scrubbed)</p>
        {["Listen to the room.", "Shape the story.", "Own the conversation."].map((t) => (
          <p key={t} data-step className="heading-1">
            {t}
          </p>
        ))}
      </div>
    </section>
  );
}
