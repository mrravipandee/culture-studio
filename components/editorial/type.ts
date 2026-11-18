/**
 * Editorial type scale and rhythm (About and Services). One place for every size, so all sections share
 * the same hierarchy. Built on the site's tokens (Manrope body, ink colours, burgundy,
 * `eyebrow`, `container-content`, `section`), with the editorial serif (Newsreader, as on
 * Case Studies and Blog) for H1/H2 and pull quotes. Sizes are fluid with clamp().
 */

/** H1 — page heading (hero only). 40px → 68px. */
export const H1 = "text-[clamp(2.5rem,1.55rem+3.1vw,4.25rem)] font-normal leading-[1.05] tracking-[-0.02em]";

/** H2 — section headings. 32px → 52px. */
export const H2 = "text-[clamp(2rem,1.45rem+1.9vw,3.25rem)] font-normal leading-[1.1] tracking-[-0.015em] text-black";

/** H3 — item headings inside sections (sans). 18px → 20px. */
export const H3 = "text-lg font-semibold leading-snug tracking-title text-black lg:text-xl";

/** Serif statement / pull quote. 22px → 28px. */
export const STATEMENT = "text-[clamp(1.375rem,1.15rem+0.7vw,1.75rem)] font-normal leading-[1.25] tracking-[-0.01em] text-burgundy";

/** Body copy: comfortable measure and line height. */
export const BODY = "text-base leading-[1.75] text-ink-2 sm:text-[1.0625rem]";
/** Lead paragraph (first paragraph of a section). */
export const LEAD = "text-[1.0625rem] leading-[1.7] text-black/80 sm:text-lg";
/** Small supporting text (item descriptions). */
export const SMALL = "text-[0.9375rem] leading-[1.7] text-ink-2";

/** Mono index labels ("01", "I", "IN PRACTICE"). */
export const INDEX = "eyebrow text-burgundy";
export const META = "eyebrow text-ink-3";

/** Vertical rhythm: the gap between a section header and its content. */
export const HEADER_GAP = "mt-14 lg:mt-20";
