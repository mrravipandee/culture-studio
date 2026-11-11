import { motion } from "motion/react";
import { DURATION, EASE } from "@/lib/motion";
import { positioning } from "@/lib/content/service-catalog";

const SEAL_TEXT = `${positioning.descriptor.replace(" and ", " · ").replace(",", " ·").toUpperCase()} · `;

/** Print style crop marks at the four corners. Decorative. */
function CropMarks() {
  return (
    <>
      {(["tl", "tr", "bl", "br"] as const).map((corner) => (
        <svg key={corner} className={`menu-stage__mark menu-stage__mark--${corner}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M0 12H9M12 0V9" stroke="currentColor" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
      ))}
    </>
  );
}

/**
 * Cinematic vector stage that fills the open mobile menu.
 * Black field with a burgundy glow (echoing the intro film), film grain, crop marks,
 * a slow-turning typographic seal with an orbiting point, an outlined wordmark that
 * eases in like a camera push, a one-time light sweep and a playhead that draws across.
 * Pure SVG/CSS: no images or video to download. Decorative, hidden from assistive tech.
 * Reduced motion: shown fully at rest (no push, turn, sweep or playhead).
 */
export default function MenuStage({ delay = 0, reduce = false }: { delay?: number; reduce?: boolean | null }) {
  return (
    <motion.div
      aria-hidden="true"
      className="menu-stage"
      initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: DURATION.image, ease: EASE, delay }}
    >
      <div className="menu-stage__glow" />
      <div className="menu-stage__grain" />

      <span className="menu-stage__wordmark">
        CULT<span className="menu-stage__dot">.</span>URE
      </span>

      <svg className="menu-stage__seal" viewBox="0 0 120 120" focusable="false">
        <defs>
          <path id="menu-stage-seal-path" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1 -88 0" />
        </defs>
        <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.18" />
        <g className="menu-stage__orbit">
          <circle cx="60" cy="4" r="1.6" className="menu-stage__orbit-dot" />
        </g>
        <g className="menu-stage__ring">
          <text className="menu-stage__seal-text">
            <textPath href="#menu-stage-seal-path" textLength="274" lengthAdjust="spacingAndGlyphs">
              {SEAL_TEXT}
            </textPath>
          </text>
        </g>
        <circle cx="60" cy="60" r="27" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
        <circle cx="60" cy="60" r="4.5" className="menu-stage__seal-dot" />
      </svg>

      <CropMarks />
      <span className="menu-stage__sweep" />
      <span className="menu-stage__playhead" />
    </motion.div>
  );
}
