"use client";

import { useLenis } from "@/components/motion/MotionProvider";
import { ArrowUp } from "@/components/ui/Arrow";

/** Smooth scroll to top (Lenis when active, native otherwise), then focus the page top. */
export default function BackToTop() {
  const lenis = useLenis();

  const toTop = () => {
    const done = () => document.querySelector<HTMLElement>("#top, main, body")?.focus({ preventScroll: true });
    if (lenis) lenis.scrollTo(0, { duration: 1.2, onComplete: done });
    else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      done();
    }
  };

  return (
    <button type="button" onClick={toTop} className="link caption-4 self-start text-paper-2 hover:text-paper sm:self-auto">
      Back to top
      <ArrowUp className="size-3.5" />
    </button>
  );
}
