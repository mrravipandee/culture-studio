import Image from "next/image";
import type { CaseStudy } from "@/lib/content/case-studies";
import { caseStudyCategory } from "@/lib/content/case-studies";
import { TopographicContourVector } from "@/components/home/shared/WorkVectors";

type Tone = "ink" | "burgundy" | "ivory";
const TONES: Tone[] = ["ink", "burgundy", "ivory"];

interface ProjectVisualProps {
  project: CaseStudy;
  /** Tailwind aspect class for the frame. */
  aspect?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Show the category / CULT.URE row on the typographic stand-in (off when a card overlays its own label). */
  showMeta?: boolean;
}

/**
 * Project image frame. Uses `project.image.src` when set (currently temporary illustrative
 * photography, see lib/content/case-studies.ts); otherwise it renders a branded
 * typographic visual (project number, discipline, contour lines) in the CULT.URE palette.
 * Same frame size either way, so replacing an image never shifts the layout.
 */
export default function ProjectVisual({
  project,
  aspect = "aspect-[4/3]",
  sizes,
  priority = false,
  className = "",
  showMeta = true,
}: ProjectVisualProps) {
  const tone = TONES[(Number(project.number) - 1) % TONES.length];

  return (
    <div className={`relative w-full overflow-hidden rounded-xl ${aspect} ${className}`}>
      {project.image.src ? (
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          sizes={sizes}
          priority={priority}
          style={project.image.position ? { objectPosition: project.image.position } : undefined}
          className="object-cover transition-transform duration-1100 ease-editorial group-hover:scale-[1.04]"
        />
      ) : (
        <div aria-hidden="true" className={`cs-visual cs-visual--${tone}`}>
          <TopographicContourVector className="cs-visual__lines" />
          <span className="cs-visual__meta">
            {showMeta && (
              <>
                <span>{caseStudyCategory(project)}</span>
                <span>CULT.URE</span>
              </>
            )}
          </span>
          <span className="cs-visual__number">{project.number}</span>
        </div>
      )}
    </div>
  );
}
