/**
 * Motion tokens: mirror of the CSS variables in app/design-system.css.
 * Import these instead of writing easing curves or durations inline.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.3, // hover, colour, opacity
  base: 0.5, // layout and position
  slow: 0.8, // scroll reveals
  mask: 0.9, // text mask / clip reveals
} as const;

/** Distance a block rises on reveal (Spacing-400). */
export const REVEAL_DISTANCE = 32;

/** Viewport trigger: fire once, slightly before the element is fully in. */
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

/** Stagger step, capped so a whole sequence never exceeds 400ms of delay. */
export const stagger = (count: number, step = 0.06) =>
  Math.min(step, 0.4 / Math.max(count, 1));
