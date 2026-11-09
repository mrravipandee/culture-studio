import type { CSSProperties } from "react";

interface ScrollCueProps {
  label: string;
  /** "column": label above a vertical line (centred). "row": line beside the label. */
  layout?: "column" | "row";
  /** "light" for light backgrounds, "dark" for images and black sections. */
  tone?: "light" | "dark";
  className?: string;
  style?: CSSProperties;
}

/**
 * The one scroll indicator. A hairline draws once (image duration, house curve)
 * and then rests: no infinite loops. CSS only; under reduced motion the line
 * simply appears drawn. Decorative, so hidden from assistive tech.
 */
export default function ScrollCue({ label, layout = "row", tone = "light", className = "", style }: ScrollCueProps) {
  const dark = tone === "dark";
  return (
    <span
      aria-hidden="true"
      style={style}
      className={`scroll-cue inline-flex ${layout === "column" ? "flex-col-reverse items-center gap-3" : "items-end gap-3.5"} ${className}`}
    >
      <span className={`relative block h-11 w-px overflow-hidden ${dark ? "bg-paper-4" : "bg-line-strong"}`}>
        <span className={`scroll-cue__fill absolute inset-0 ${dark ? "bg-paper" : "bg-burgundy"}`} />
      </span>
      <span className={`eyebrow ${dark ? "text-paper-2" : "text-ink-3"}`}>{label}</span>
    </span>
  );
}
