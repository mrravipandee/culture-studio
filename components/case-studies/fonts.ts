import { Newsreader } from "next/font/google";

/**
 * Editorial serif used only on the Case Studies hero and highlights (matches the approved
 * design reference). Scoped here so it loads only on the pages that use it; the rest of
 * the site keeps Manrope.
 */
export const editorialSerif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});
