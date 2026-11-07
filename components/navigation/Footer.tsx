import { contact } from "@/lib/content/home";
import { brand, contactCta, primaryNav } from "@/lib/navigation";
import { TextLink } from "@/components/ui/site-button";
import BackToTop from "./BackToTop";
import CurrentYear from "./CurrentYear";
import Wordmark from "./Wordmark";

/** Site footer: brand, navigation, contact, back to top, and monumental bottom watermark wordmark. */
export default function Footer() {
  return (
    <footer className="surface-ink relative overflow-hidden bg-black text-white selection:bg-[#4A121A] selection:text-white">
      {/* Subtle background ambient burgundy vignette */}
      <div
        className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-[#4A121A]/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="container-content relative z-10 pt-16 sm:pt-20 lg:pt-24">
        {/* Top Grid of Navigation & Brand Details */}
        <div className="grid-site gap-y-12 pb-16 lg:pb-20">
          {/* Col 1: Brand & Positioning */}
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <Wordmark tone="paper" />
            <p className="body-6 mt-6 max-w-sm text-paper-3 font-light leading-relaxed">
              {brand.tagline}
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-paper-4">
              Executive Branding &middot; Editorial Craft &middot; Cognitive Systems
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <nav
            aria-label="Footer"
            className="col-span-2 md:col-span-4 lg:col-span-2 lg:col-start-7"
          >
            <p className="eyebrow mb-6 text-paper-3 font-mono text-[11px] uppercase tracking-[0.25em]">
              Explore
            </p>
            <ul className="grid gap-3.5">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <TextLink
                    href={link.href}
                    className="body-5 text-paper-2 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 3: Connect & Socials */}
          <div className="col-span-2 md:col-span-4 lg:col-span-3">
            <p className="eyebrow mb-6 text-paper-3 font-mono text-[11px] uppercase tracking-[0.25em]">
              Connect
            </p>
            <ul className="grid gap-3.5">
              {contact.email ? (
                <li>
                  <TextLink
                    href={`mailto:${contact.email}`}
                    className="body-5 text-paper-2 transition-colors duration-300 hover:text-white"
                  >
                    {contact.email}
                  </TextLink>
                </li>
              ) : (
                <li>
                  <TextLink
                    href={contactCta.href}
                    arrow
                    className="body-5 text-paper-2 transition-colors duration-300 hover:text-white"
                  >
                    {contactCta.label}
                  </TextLink>
                </li>
              )}
              {contact.socials.map((s) => (
                <li key={s.href}>
                  <TextLink
                    href={s.href}
                    arrow
                    className="body-5 text-paper-2 transition-colors duration-300 hover:text-white"
                  >
                    {s.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Practice & Advisory Mandate */}
          <div className="col-span-4 md:col-span-4 lg:col-span-2">
            <p className="eyebrow mb-6 text-paper-3 font-mono text-[11px] uppercase tracking-[0.25em]">
              Practice
            </p>
            <ul className="grid gap-3.5 text-xs font-mono text-paper-3">
              <li>London &middot; Global</li>
              <li>Est. 2026</li>
              <li className="flex items-center gap-2 text-paper-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8B2336] animate-pulse" />
                <span>Private Advisory</span>
              </li>
              <li className="text-paper-4 pt-1">
                Monograph Archival Rights
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Back-To-Top Bar */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between text-xs font-mono text-paper-4">
          <p>
            &copy; <CurrentYear /> {brand.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">
              BEYOND THE NOISE &middot; INTO THE CULTURE
            </span>
            <BackToTop />
          </div>
        </div>
      </div>

      {/* Monumental Bottom Typography Wordmark with iPhone Burgundy & Cream Glow Effect */}
      <div className="group/wordmark relative w-full select-none overflow-hidden pt-6 pb-2 text-center cursor-pointer transition-all duration-700 sm:pt-10">
        {/* Ambient Backlight Glow Bloom on Hover */}
        <div
          className="pointer-events-none absolute inset-0 -bottom-10 bg-[radial-gradient(ellipse_60%_80%_at_bottom,_rgba(74,18,26,0.75)_0%,_rgba(250,247,242,0.18)_45%,_transparent_75%)] opacity-0 transition-opacity duration-700 ease-editorial group-hover/wordmark:opacity-100"
          aria-hidden="true"
        />

        {/* Editorial Sub-kicker that illuminates on hover */}
        <p className="pointer-events-none font-mono text-[9px] sm:text-xs uppercase tracking-[0.35em] text-[#FAF7F2]/25 transition-all duration-500 ease-editorial group-hover/wordmark:text-[#FAF7F2]/80 group-hover/wordmark:tracking-[0.45em]">
          PERSONAL BRANDING AGENCY &mdash; GLOBAL PRACTICE
        </p>

        {/* The Massive Panoramic Wordmark */}
        <h2 className="relative mt-2 text-[15.8vw] font-black uppercase tracking-[-0.04em] leading-[0.8] transition-all duration-700 ease-editorial">
          <span className="text-white/[0.06] [-webkit-text-stroke:1px_rgba(255,255,255,0.12)] transition-all duration-700 ease-editorial group-hover/wordmark:text-transparent group-hover/wordmark:[-webkit-text-stroke:0px] group-hover/wordmark:bg-gradient-to-b group-hover/wordmark:from-[#FAF7F2] group-hover/wordmark:via-[#DCA8AF] group-hover/wordmark:to-[#4A121A] group-hover/wordmark:bg-clip-text group-hover/wordmark:drop-shadow-[0_10px_40px_rgba(74,18,26,0.65)]">
            CULT<span className="text-[#8B2336] transition-colors duration-500 group-hover/wordmark:text-[#FAF7F2] group-hover/wordmark:drop-shadow-[0_0_25px_#E8A2AC]">.</span>URE
          </span>
        </h2>
      </div>
    </footer>
  );
}
