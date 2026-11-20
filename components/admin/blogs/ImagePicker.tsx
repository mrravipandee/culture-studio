"use client";

import { useId } from "react";
import { Info } from "lucide-react";
import ImageUploadButton from "../media/ImageUploadButton";

export interface LibraryImage {
  src: string;
  alt: string;
}

interface Props {
  library: LibraryImage[];
  selected: string | null;
  /** publicId is set only for images uploaded to Cloudinary. */
  onPick: (src: string, suggestedAlt: string, publicId?: string) => void;
  /** Cloudinary is configured on the server: show the Upload button. */
  uploadsEnabled: boolean;
  label?: string;
}

/**
 * Choose an image for the blog: upload it to Cloudinary (blog folder, signed, admin-only) or
 * pick an existing site image. Nothing is kept as a temporary browser preview, so what you
 * see is exactly what will be saved.
 */
export default function ImagePicker({ library, selected, onPick, uploadsEnabled, label = "Upload image" }: Props) {
  const groupId = useId();

  return (
    <div>
      {uploadsEnabled ? (
        <ImageUploadButton purpose="blog" label={label} text={label} onUploaded={({ url, publicId }) => onPick(url, "", publicId)} />
      ) : (
        <p className="flex items-start gap-1.5 text-xs text-ink-3">
          <Info aria-hidden="true" size={14} className="mt-px shrink-0" />
          Image uploads are off (Cloudinary isn&rsquo;t configured on the server). Choose a site image below.
        </p>
      )}
      {library.length > 0 && (
        <fieldset className="mt-3">
          <legend id={groupId} className="text-xs text-ink-3">
            {uploadsEnabled ? "Or use a site image" : "Site images"}
          </legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {library.map((img) => (
              <button
                key={img.src}
                type="button"
                onClick={() => onPick(img.src, img.alt)}
                aria-pressed={selected === img.src}
                aria-label={img.alt || img.src}
                title={img.alt || img.src}
                className={`relative h-12 w-[4.5rem] overflow-hidden rounded-md border-2 bg-black/5 bg-cover bg-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${
                  selected === img.src ? "border-[#5a0c14]" : "border-transparent hover:border-black/20"
                }`}
                style={{ backgroundImage: `url("${img.src}")` }}
              />
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
