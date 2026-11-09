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

export const heroLabel = "Digital Growth & Creative Agency";
export const heroTagline = "Beyond the noise. Into the culture.";

/** Each inner array is one line on tablet+; words wrap naturally on mobile. */
export const heroHeadline: HeadlineWord[][] = [
  [{ text: "We" }, { text: "build" }],
  [
    { text: "brands", tone: "serif" },
    { text: "that", tone: "serif" },
  ],
  [{ text: "become" }],
  [{ text: "culture.", tone: "accent" }],
];

export const heroDescription =
  "CULT.URE is a digital growth, marketing and creative agency. We bring brand strategy, social and performance marketing, SEO, websites and automation together, so every channel works towards the same goal.";

export const heroActions = {
  primary: { label: "Explore our services", href: "/services" },
  secondary: { label: "View case studies", href: "/case-studies" },
} as const;

export const heroPillars = [
  "Brand & Presence",
  "Marketing & Growth",
  "Search & Engagement",
  "Technology",
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
