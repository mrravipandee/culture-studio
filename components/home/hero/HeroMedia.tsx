import Image from "next/image";
import { heroLabel, heroMedia, heroTagline, type HeroImage } from "./hero-content";

const [taglineStart] = heroTagline
  .split(".")
  .map((part) => part.trim())
  .filter(Boolean);

function FramedImage({ image, sizes, priority = false }: { image: HeroImage; sizes: string; priority?: boolean }) {
  if (!image.src) return null;
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className="hero-media__img"
      style={{ objectPosition: image.focus }}
    />
  );
}

/** Print style crop marks at the four corners of the frame. Decorative. */
function CropMarks() {
  return (
    <>
      {(["tl", "tr", "bl", "br"] as const).map((corner) => (
        <svg key={corner} className={`hero-cropmark hero-cropmark--${corner}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M0 12H9M12 0V9" stroke="currentColor" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
      ))}
    </>
  );
}

/** Circular seal set in the brand tagline, around a burgundy full stop. Turns with scroll (CSS). */
function Seal() {
  const text = `${heroTagline.toUpperCase()} · `;
  return (
    <svg className="hero-seal" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <path id="hero-seal-path" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1 -92 0" />
      </defs>
      <g className="hero-seal__ring">
        <text className="hero-seal__text">
          <textPath href="#hero-seal-path" textLength="286" lengthAdjust="spacingAndGlyphs">
            {text}
          </textPath>
        </text>
      </g>
      <circle cx="60" cy="60" r="29" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
      <circle cx="60" cy="60" r="5" className="hero-seal__dot" />
    </svg>
  );
}

/**
 * Hero art direction: one campaign photograph in a tall frame that bleeds to the
 * right edge, a burgundy block behind it, print crop marks, a figure caption,
 * a vertical label and a typographic seal. Photography is next/image; vectors are inline SVG.
 */
export default function HeroMedia() {
  const { primary, secondary } = heroMedia;
  const hasPrimary = Boolean(primary.src);
  const hasSecondary = Boolean(secondary.src);

  return (
    <div className="hero-media">
      <div className="hero-media__block" aria-hidden="true" />

      <p className="hero-media__label" aria-hidden="true">
        {heroLabel}
      </p>

      <div className="hero-media__stage">
      <figure className="hero-media__frame">
        <div className="hero-media__parallax">
          {hasPrimary ? (
            <FramedImage
              image={primary}
              sizes="(min-width: 1280px) 600px, (min-width: 1024px) 42vw, (min-width: 768px) 45vw, 90vw"
            />
          ) : (
            <div className="hero-plate" aria-hidden="true">
              <span className="hero-plate__kicker">{taglineStart}</span>
              <span className="hero-plate__mark">
                CULT<span className="hero-plate__dot">.</span>
                <br />
                URE
              </span>
            </div>
          )}
        </div>

        {hasPrimary && primary.caption && <figcaption className="hero-media__caption">{primary.caption}</figcaption>}
      </figure>
      <CropMarks />
      </div>

      <div className="hero-media__card" aria-hidden="true">
        {hasSecondary ? <FramedImage image={secondary} sizes="(min-width: 1024px) 14vw, 32vw" /> : <Seal />}
      </div>
    </div>
  );
}
