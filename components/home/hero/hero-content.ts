/**
 * HomeHero content & art direction.
 *
 * Copy: client copy deck (CULTURE_Complete_Website_Copy_B2B.pdf), Home → Hero.
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

export const heroLabel = "Marketing Agency";
export const heroTagline = "Beyond the noise. Into the culture.";

/** Each inner array is one line on tablet+; words wrap naturally on mobile. */
export const heroHeadline: HeadlineWord[][] = [
  [{ text: "Before" }, { text: "the" }],
  [{ text: "pitch,", tone: "serif" }],
  [{ text: "there" }, { text: "is" }],
  [{ text: "perception.", tone: "accent" }],
];

export const heroDescription =
  "By the time a potential client speaks to your business, they have already formed an opinion. Your positioning, reputation and communication have shaped it. CULT.URE works with B2B businesses to shape that perception, bringing together brand strategy, content, marketing and technology to make expertise understood, build market relevance and create stronger commercial opportunities.";

export const heroActions = {
  primary: { label: "Start a conversation", href: "/contact" },
  secondary: { label: "Explore services", href: "/services" },
} as const;

/** The four service disciplines (exact names from the client copy deck). */
export const heroPillars = [
  "Brand Strategy & Communications",
  "Content & Creative",
  "Digital Marketing & Growth",
  "Technology & Automation",
] as const;

export const heroMedia: { primary: HeroImage; secondary: HeroImage } = {
  primary: {
    // Art directed from the existing /images/work/project-04.jpg (same treatment as the
    // previous campaign.jpg: 4:5 crop, monochrome, burgundy shadows). Person-free on purpose:
    // no image may imply an unverified CULT.URE founder, employee or client.
    src: "/images/hero/workspace.jpg",
    alt: "A quiet workspace with a laptop and a tall plant beside floor-to-ceiling windows, in monochrome",
    caption: "Fig. 01 — Presence",
    focus: "50% 45%",
  },
  // Inset card is a typographic SVG seal; set a src here to use a photo instead.
  secondary: {
    src: null,
    alt: "",
  },
};
