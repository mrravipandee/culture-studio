import type { SectionIntro } from "@/lib/content/home";
import { TextMask } from "@/components/motion/TextMask";
import { Reveal } from "@/components/motion/Reveal";

interface SectionHeadingProps {
  intro: SectionIntro;
  /** id applied to the <h2>, referenced by the section's aria-labelledby. */
  titleId: string;
  tone?: "light" | "dark";
  /** "split": title left, description bottom right (default). "stacked": single column. */
  layout?: "split" | "stacked";
  className?: string;
}

/**
 * Shared editorial heading: index + eyebrow rule, masked title, optional lead.
 * Uses design system text styles only (eyebrow · heading-2 · body-3).
 */
export default function SectionHeading({
  intro,
  titleId,
  tone = "light",
  layout = "split",
  className = "",
}: SectionHeadingProps) {
  const dark = tone === "dark";
  const split = layout === "split";

  return (
    <header className={`grid gap-6 ${split ? "lg:grid-cols-12 lg:gap-8" : "max-w-narrow"} ${className}`}>
      <p className={`eyebrow flex items-center gap-3 lg:col-span-12 ${dark ? "text-paper-3" : "text-burgundy"}`}>
        <span>{intro.index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
        <span>{intro.eyebrow}</span>
      </p>

      <TextMask
        as="h2"
        id={titleId}
        text={intro.title}
        className={`heading-2 ${split ? "lg:col-span-7" : ""} ${dark ? "text-paper" : "text-ink"}`}
      />

      {intro.description && (
        <Reveal
          as="p"
          delay={0.2}
          distance={16}
          className={`body-3 max-w-md ${split ? "lg:col-span-4 lg:col-start-9 lg:self-end" : ""} ${dark ? "text-paper-2" : "text-ink-2"}`}
        >
          {intro.description}
        </Reveal>
      )}
    </header>
  );
}
