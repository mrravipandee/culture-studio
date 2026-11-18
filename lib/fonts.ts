import localFont from "next/font/local";

/**
 * Editorial serif for display headings on the Case Studies and Blog pages (approved
 * design references). Loaded only by the components that use it; the rest of the site
 * keeps Manrope.
 *
 * Self-hosted Newsreader (app/fonts/, SIL Open Font License; Latin variable-weight
 * subsets) rather than next/font/google, so builds are deterministic and need no network
 * (see the note in app/layout.tsx).
 */
export const editorialSerif = localFont({
  src: [
    { path: "../app/fonts/newsreader-latin-var.woff2", weight: "200 800", style: "normal" },
    { path: "../app/fonts/newsreader-italic-latin-var.woff2", weight: "200 800", style: "italic" },
  ],
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});
