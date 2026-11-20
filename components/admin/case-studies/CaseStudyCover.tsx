"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { editorialSerif } from "@/lib/fonts";

interface Props {
  src: string | null;
  alt: string;
  /** Shown on the fallback panel. */
  label: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** The project deliberately uses the branded typographic cover (no photograph). */
  typographic?: boolean;
}

/**
 * Cover image with a loading tint and a branded fallback for missing or broken images, or
 * for the deliberate typographic cover. Only existing site images are used (no uploads).
 */
export default function CaseStudyCover({ src, alt, label, sizes, priority = false, className = "", typographic = false }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const failed = src !== null && failedSrc === src;
  const showImage = src !== null && !failed;

  return (
    <div className={`relative overflow-hidden bg-[#3a0f15] ${className}`}>
      {showImage ? (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={() => setLoadedSrc(src)}
          onError={() => {
            setFailedSrc(src);
            if (process.env.NODE_ENV !== "production") console.warn(`[admin] Cover image failed to load: ${src}`);
          }}
          className={`object-cover transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] ${loadedSrc === src ? "opacity-100" : "opacity-0"}`}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 flex items-end justify-between gap-3 bg-[radial-gradient(120%_90%_at_100%_100%,rgba(140,38,50,0.55),transparent_60%)] p-4 text-[#F8F5F0]">
          <span className={`${editorialSerif.className} truncate text-2xl leading-none opacity-90`}>{label}</span>
          <span className="flex shrink-0 items-center gap-1.5 text-[0.625rem] uppercase tracking-[0.16em] text-[#F8F5F0]/70">
            <ImageOff size={12} />
            {failed ? "Image unavailable" : typographic ? "Typographic cover" : "No cover"}
          </span>
        </div>
      )}
      {failed && <span className="sr-only">Cover image could not be loaded.</span>}
    </div>
  );
}
