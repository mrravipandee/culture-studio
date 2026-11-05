import type { SectionIntro } from "@/lib/content/home";

interface SectionHeadingProps {
  intro: SectionIntro;
  /** id applied to the <h2>, referenced by the section's aria-labelledby. */
  titleId: string;
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Shared editorial heading: index + eyebrow rule, serif title, optional lead.
 * Two-column on large screens so titles and descriptions sit asymmetrically.
 */
export default function SectionHeading({
  intro,
  titleId,
  tone = "light",
  className = "",
}: SectionHeadingProps) {
  const dark = tone === "dark";

  return (
    <header
      className={`grid gap-6 lg:grid-cols-12 lg:gap-8 ${className}`}
    >
      <p
        className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] lg:col-span-12 ${
          dark ? "text-white/60" : "text-brand-burgundy"
        }`}
      >
        <span>{intro.index}</span>
        <span
          aria-hidden="true"
          className={`h-px w-8 ${dark ? "bg-white/40" : "bg-brand-burgundy"}`}
        />
        <span>{intro.eyebrow}</span>
      </p>

      <h2
        id={titleId}
        className={`font-serif text-4xl leading-[1.02] tracking-[-0.03em] text-balance sm:text-5xl lg:col-span-7 lg:text-6xl ${
          dark ? "text-white" : "text-black"
        }`}
      >
        {intro.title}
      </h2>

      {intro.description && (
        <p
          className={`max-w-md text-base leading-relaxed font-light lg:col-span-4 lg:col-start-9 lg:self-end ${
            dark ? "text-white/70" : "text-neutral-600"
          }`}
        >
          {intro.description}
        </p>
      )}
    </header>
  );
}
