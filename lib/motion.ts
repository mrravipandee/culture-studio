/**
 * CULT.URE cinematic motion tokens (seconds).
 * Mirror of the CSS variables in app/design-system.css (--ease, --duration-*).
 * Import these instead of writing easing curves or durations inline.
 */

/** The one house curve: cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

export const DURATION = {
  color: 0.3, // colour and opacity changes
  ui: 0.5, // interface interactions: menus, accordions, underlines, lifts
  reveal: 0.8, // fade-up section entrances
  text: 0.9, // masked text reveals
  image: 1.1, // image reveals and image hover zoom
  imageSettle: 1.4, // inner scale settle that accompanies an image reveal
  // Legacy aliases (same values) kept so existing imports keep working.
  fast: 0.3,
  base: 0.5,
  slow: 0.8,
  mask: 0.9,
} as const;

/**
 * GSAP easings for scroll-linked timelines. Scrubbed stage changes use an in-out
 * curve (it follows the scroll in both directions); direct scroll mapping is linear.
 */
export const GSAP_EASE = {
  scrub: "power2.inOut",
  linear: "none",
} as const;

/**
 * Homepage hero sequence (ms). The CSS durations live in app/design-system.css
 * (--hero-*); these per-element delays are applied inline by HomeHero.tsx.
 */
export const HERO = {
  delay: {
    description: 650,
    actions: 800,
    scrollCue: 1000,
    scrollCueDraw: 1100,
    pillars: 1100,
  },
  wordDelay: 150,
  wordStagger: 70,
} as const;

/** Hover standards. */
export const HOVER = {
  imageZoom: 1.03,
  cardLift: 4, // px
} as const;

/** Distance a block rises on reveal (Spacing-400). */
export const REVEAL_DISTANCE = 32;

/** Viewport trigger: fire once, slightly before the element is fully in. */
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

/** Stagger step, capped so a whole sequence never exceeds 400ms of delay. */
export const stagger = (count: number, step = 0.06) =>
  Math.min(step, 0.4 / Math.max(count, 1));
