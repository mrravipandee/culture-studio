/**
 * CULT.URE motion system. Import from "@/components/motion".
 *
 * Simple viewport reveals → Reveal / RevealGroup / TextMask / ClipReveal (IntersectionObserver via Motion)
 * Scroll linked, lightweight → ScrollScale / ScrollProgress (Motion scroll timeline)
 * Complex sequences → useScrollTimeline (GSAP ScrollTrigger, lazy loaded)
 * Hover feedback → CSS only: .btn, .btn-arrow, .hover-lift, .link (app/design-system.css)
 */
export { default as MotionProvider, useLenis } from "./MotionProvider";
export { default as ScrollProgress } from "./ScrollProgress";
export { default as PageTransition, PAGE_TRANSITIONS } from "./PageTransition";
export { Reveal, RevealGroup, RevealItem } from "./Reveal";
export { TextMask } from "./TextMask";
export { ClipReveal } from "./ClipReveal";
export { ScrollScale } from "./ScrollScale";
// GSAP sequences: import { useScrollTimeline } from "@/hooks/useScrollTimeline" directly,
// so pages that never use it never reference the GSAP chunk.
