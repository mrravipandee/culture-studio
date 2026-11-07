import { Fragment, type CSSProperties } from "react";
import { Button, TextLink } from "@/components/ui/site-button";
import HeroReveal from "./hero/HeroReveal";
import HeroMedia from "./hero/HeroMedia";
import {
  heroActions,
  heroDescription,
  heroHeadline,
  heroLabel,
  heroPillars,
  heroTagline,
} from "./hero/hero-content";

const headlineText = heroHeadline
  .flat()
  .map((word) => word.text)
  .join(" ");

/** Pre-computed global word index, used to stagger the reveal. */
const headlineLines = heroHeadline.map((line, lineIndex) =>
  line.map((word, wordIndex) => ({
    ...word,
    index:
      heroHeadline
        .slice(0, lineIndex)
        .reduce((total, prev) => total + prev.length, 0) + wordIndex,
  }))
);

/** CSS custom property helper for staggered reveal delays. */
const motion = (vars: Record<string, string | number>) =>
  vars as CSSProperties;

export default function HomeHero() {

  return (
    <HeroReveal className="hero relative overflow-hidden" labelledBy="home-hero-title">

      <div className="hero__inner relative z-10">
        {/* Editorial meta bar */}
        <div className="hero__meta">
          <p className="hero-reveal hero-eyebrow">
            <span className="hero-eyebrow__dot" aria-hidden="true" />
            {heroLabel}
          </p>
          <p className="hero-reveal hero-mono hidden md:block">
            {heroTagline}
          </p>
          <span className="hero-rule hero-rule--bottom" aria-hidden="true" />
        </div>

        {/* Headline */}
        <div className="hero__headline">
          <h1 id="home-hero-title" className="hero-title">
            <span className="sr-only">{headlineText}</span>
            <span aria-hidden="true">
              {headlineLines.map((line, lineIndex) => (
                <span key={lineIndex} className="hero-title__line">
                  {line.map((word) => (
                    <Fragment key={word.text}>
                      <span
                        className={
                          word.tone
                            ? `hero-word hero-word--${word.tone}`
                            : "hero-word"
                        }
                      >
                        <span
                          className="hero-word__inner"
                          style={motion({ "--i": word.index })}
                        >
                          {word.text}
                        </span>
                      </span>{" "}
                    </Fragment>
                  ))}
                </span>
              ))}
            </span>
          </h1>
        </div>

        {/* Supporting copy + actions */}
        <div className="hero__body">
          <p className="hero-reveal hero-description" style={motion({ "--d": "650ms" })}>
            {heroDescription}
          </p>

          <div className="hero-reveal hero-actions" style={motion({ "--d": "800ms" })}>
            <Button href={heroActions.primary.href} variant="primary" size="lg" icon="arrow">
              {heroActions.primary.label}
            </Button>

            <TextLink href={heroActions.secondary.href} arrow className="title-3 text-ink">
              {heroActions.secondary.label}
            </TextLink>
          </div>
        </div>

        {/* Photographic composition */}
        <div className="hero__media">
          <HeroMedia />
        </div>

        {/* Footer: scroll hint + practice index */}
        <div className="hero__footer">
          <span className="hero-rule hero-rule--top" aria-hidden="true" />

          <div className="hero-reveal hero-scroll" aria-hidden="true" style={motion({ "--d": "1000ms" })}>
            <span className="hero-scroll__line" />
            <span className="hero-mono">Scroll</span>
          </div>

          <ol className="hero-reveal hero-pillars" aria-label="Practice areas" style={motion({ "--d": "1100ms" })}>
            {heroPillars.map((pillar, index) => (
              <li key={pillar}>
                <span className="hero-pillars__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {pillar}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </HeroReveal>
  );
}
