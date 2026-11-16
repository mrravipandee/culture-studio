import { Newsreader } from "next/font/google";

/**
 * Editorial serif for display headings on the Case Studies and Blog pages (approved
 * design references). Loaded only by the components that use it; the rest of the site
 * keeps Manrope.
 */
export const editorialSerif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});
