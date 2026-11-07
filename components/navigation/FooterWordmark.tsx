"use client";

import { useRef } from "react";

/**
 * Oversized footer wordmark with a cursor spotlight: the letters stay a quiet outline,
 * and colour appears only in a soft circle under the pointer.
 * Pointer position is written to CSS variables (no React state, no re-renders).
 * Decorative: hidden from assistive tech; the brand name is already in the footer.
 */
export default function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${clientX - r.left}px`);
      el.style.setProperty("--y", `${clientY - r.top}px`);
    });
  };

  return (
    <div
      ref={ref}
      className="footer-mark"
      aria-hidden="true"
      onPointerMove={onMove}
      onPointerEnter={(e) => e.pointerType === "mouse" && ref.current?.setAttribute("data-active", "")}
      onPointerLeave={() => ref.current?.removeAttribute("data-active")}
    >
      <span className="footer-mark__base">CULT.URE</span>
      <span className="footer-mark__spot">CULT.URE</span>
    </div>
  );
}
