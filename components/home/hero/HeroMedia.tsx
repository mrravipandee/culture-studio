import Image from "next/image";
import { heroMedia, heroTagline, type HeroImage } from "./hero-content";

const [taglineStart, taglineEnd] = heroTagline
  .split(/(?<=\.)\s/)
  .map((part) => part.trim());

function FramedImage({ image, sizes }: { image: HeroImage; sizes: string }) {
  if (!image.src) return null;

  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      className="hero-media__img"
      style={{ objectPosition: image.focus }}
    />
  );
}

export default function HeroMedia() {
  const { primary, secondary } = heroMedia;
  const hasPrimary = Boolean(primary.src);
  const hasSecondary = Boolean(secondary.src);

  return (
    <div className="hero-media">
      {/* Offset burgundy block behind the composition */}
      <div className="hero-media__block" aria-hidden="true" />

      <figure className="hero-media__frame">
        <div className="hero-media__parallax">
          {hasPrimary ? (
            <FramedImage
              image={primary}
              sizes="(min-width: 1024px) 45vw, (min-width: 768px) 50vw, 90vw"
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

        {hasPrimary && primary.caption && (
          <figcaption className="hero-media__caption">
            {primary.caption}
          </figcaption>
        )}
      </figure>

      <div
        className="hero-media__card"
        aria-hidden={hasSecondary ? undefined : true}
      >
        {hasSecondary ? (
          <FramedImage
            image={secondary}
            sizes="(min-width: 1024px) 14vw, 32vw"
          />
        ) : (
          <div className="hero-card-plate">
            <span className="hero-card-plate__index">CULT.URE</span>
            <span className="hero-card-plate__line">{taglineEnd}</span>
          </div>
        )}
      </div>
    </div>
  );
}
