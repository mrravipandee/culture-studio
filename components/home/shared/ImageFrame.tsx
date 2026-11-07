import Image from "next/image";
import type { ContentImage } from "@/lib/content/home";
import { ScrollScale } from "@/components/motion/ScrollScale";

interface ImageFrameProps {
  image: ContentImage;
  /** Tailwind aspect class, e.g. "aspect-portrait" or "aspect-[4/3]". */
  aspect?: string;
  sizes: string;
  className?: string;
  /** Opt in: subtle scroll linked scale + drift. Off by default. */
  scrollScale?: boolean;
  priority?: boolean;
  /** Optional caption rendered as <figcaption>; wraps the frame in <figure>. */
  caption?: string;
}

/**
 * Optimised next/image when `image.src` is set, otherwise a labelled
 * placeholder frame of the same size (no layout shift when assets land).
 */
export default function ImageFrame({
  image,
  aspect = "aspect-[4/3]",
  sizes,
  className = "",
  scrollScale = false,
  priority = false,
  caption,
}: ImageFrameProps) {
  const img = image.src ? (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.03]"
    />
  ) : null;

  const frame = (
    <div className={`relative w-full overflow-hidden bg-subtle ${aspect} ${className}`}>
      {img ? (
        scrollScale ? (
          <ScrollScale className="absolute inset-0" from={1.08} drift={4}>
            {img}
          </ScrollScale>
        ) : (
          img
        )
      ) : (
        <div
          role="img"
          aria-label={`Placeholder: ${image.placeholderLabel}`}
          className="absolute inset-0 flex flex-col justify-between border border-dashed border-line-strong p-4"
        >
          <span className="caption-4 self-start bg-paper px-2 py-1 uppercase tracking-eyebrow text-ink-3">
            Placeholder
          </span>
          <span className="caption-4 uppercase tracking-eyebrow text-ink-3">
            {image.placeholderLabel}
          </span>
        </div>
      )}
    </div>
  );

  if (!caption) return frame;
  return (
    <figure>
      {frame}
      <figcaption className="caption-2 mt-3 text-ink-3">{caption}</figcaption>
    </figure>
  );
}
