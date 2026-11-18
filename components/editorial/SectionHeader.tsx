import { Reveal } from "@/components/motion";
import { editorialSerif } from "@/lib/fonts";
import { BODY, H2, LEAD, META } from "@/components/editorial/type";

/**
 * Shared editorial section header (About, Services): index + eyebrow on the left (4 of 12
 * columns), H2 and intro paragraphs on the right (8 of 12). Every section uses it, so headings, label
 * positions and gaps line up from top to bottom. Stacks on smaller screens.
 */
export default function SectionHeader({
  index,
  eyebrow,
  title,
  titleAccent,
  titleId,
  intro = [],
  tone = "dark",
}: {
  index: string;
  eyebrow: string;
  title: string;
  /** Optional second part of the title, set in burgundy. */
  titleAccent?: string;
  titleId: string;
  intro?: string[];
  tone?: "dark" | "light";
}) {
  const light = tone === "light";
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
      <Reveal className="lg:col-span-4" distance={12}>
        <p className={`${META} flex items-center gap-3 ${light ? "text-white/60" : ""}`}>
          <span className={light ? "text-white" : "text-burgundy"}>{index}</span>
          <span aria-hidden="true" className={`h-px w-8 ${light ? "bg-white/30" : "bg-black/20"}`} />
          <span>{eyebrow}</span>
        </p>
      </Reveal>
      <div className="lg:col-span-8">
        <Reveal as="div" distance={16}>
          <h2 id={titleId} className={`${editorialSerif.className} ${H2} max-w-[22ch] ${light ? "text-white" : ""}`}>
            {title}
            {titleAccent && (
              <>
                {" "}
                <span className={light ? "text-white/70" : "text-burgundy"}>{titleAccent}</span>
              </>
            )}
          </h2>
        </Reveal>
        {intro.length > 0 && (
          <Reveal delay={0.08} distance={16} className="mt-8 max-w-[62ch] space-y-5">
            {intro.map((p, i) => (
              <p key={i} className={i === 0 ? LEAD : BODY}>
                {p}
              </p>
            ))}
          </Reveal>
        )}
      </div>
    </div>
  );
}
