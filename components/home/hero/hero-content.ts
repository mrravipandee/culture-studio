/**
 * HomeHero content & art direction.
 *
 * Copy is derived from existing CULT.URE positioning (tagline + site metadata).
 * Photography: drop real, licensed images into /public/images/hero/ and set
 * `src` below. While `src` is null, a brand plate renders in its place.
 */

export type HeadlineWord = {
  text: string;
  tone?: "serif" | "accent";
};

export type HeroImage = {
  src: string | null;
  alt: string;
  /** Short editorial caption shown over the primary image. */
  caption?: string;
  /** CSS object-position focal point, e.g. "50% 30%". */
  focus?: string;
};

export const heroLabel = "Personal Branding Agency";
export const heroTagline = "Beyond the noise. Into the culture.";

/** Each inner array is one line on tablet+; words wrap naturally on mobile. */
export const heroHeadline: HeadlineWord[][] = [
  [{ text: "We" }, { text: "build" }],
  [
    { text: "personal", tone: "serif" },
    { text: "brands", tone: "serif" },
  ],
  [{ text: "that" }, { text: "become" }],
  [{ text: "culture.", tone: "accent" }],
];

export const heroDescription =
  "CULT.URE is a personal branding agency for founders, creators and executives — working across content, culture, cognition and AI automation to carry your name beyond the noise.";

export const heroActions = {
  primary: { label: "Explore Case Studies", href: "/case-studies" },
  secondary: { label: "Our Philosophy", href: "/about" },
} as const;

export const heroPillars = [
  "Content",
  "Culture",
  "Cognition",
  "AI Automation",
] as const;

export const heroMedia: { primary: HeroImage; secondary: HeroImage } = {
  primary: {
    // Art directed from /images/work/featured.jpg: 4:5 crop, monochrome, burgundy shadows.
    src: "/images/hero/campaign.jpg",
    alt: "A man in a tailored dark suit fastening his jacket, photographed in black and white",
    caption: "Fig. 01 — Presence",
    focus: "50% 45%",
  },
  // Inset card is a typographic SVG seal; set a src here to use a photo instead.
  secondary: {
    src: null,
    alt: "",
  },
};
