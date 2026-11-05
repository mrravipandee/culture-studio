import Image from "next/image";
import type { ContentImage } from "@/lib/content/home";

interface ImageFrameProps {
  image: ContentImage;
  /** Tailwind aspect class, e.g. "aspect-[4/5]". */
  aspect?: string;
  sizes: string;
  className?: string;
}

/**
 * Renders an optimised next/image when `image.src` is set,
 * otherwise a clearly labelled placeholder frame of the same size
 * (no layout shift when real assets are added).
 */
export default function ImageFrame({
  image,
  aspect = "aspect-[4/3]",
  sizes,
  className = "",
}: ImageFrameProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-neutral-100 ${aspect} ${className}`}
    >
      {image.src ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
      ) : (
        <div
          role="img"
          aria-label={`Placeholder: ${image.placeholderLabel}`}
          className="absolute inset-0 flex flex-col justify-between border border-dashed border-black/15 p-4"
        >
          <span className="self-start bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Placeholder
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            {image.placeholderLabel}
          </span>
        </div>
      )}
    </div>
  );
}
