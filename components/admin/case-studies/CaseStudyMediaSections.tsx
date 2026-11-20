"use client";

import { useId } from "react";
import { Info } from "lucide-react";
import { CASE_STUDY_IMAGE_LIBRARY, CASE_STUDY_LIMITS as L, isCloudinaryUrl, type CoverKind } from "@/lib/case-studies/constants";
import ImageUploadButton from "../media/ImageUploadButton";
import { seoFor } from "@/lib/case-studies/rules";
import type { CaseStudyFormValues } from "@/lib/admin/case-study-utils";
import CaseStudyCover from "./CaseStudyCover";
import { ErrorText, Field, Repeater, SectionTitle, describedBy, inputClass, rowErrors } from "./CaseStudyFormFields";
import type { SectionProps } from "./CaseStudyFormSections";

const COVER_OPTIONS: { kind: CoverKind; label: string }[] = [
  { kind: "IMAGE", label: "Image" },
  { kind: "TYPOGRAPHIC", label: "Typographic" },
  { kind: "NONE", label: "Not set" },
];

export type MediaSectionProps = SectionProps & { uploadsEnabled: boolean };

/**
 * One image reference: upload to Cloudinary (when configured), pick from the site library,
 * or type a site path. Uploading sets both URL and public id; picking or typing clears the id.
 */
function ImagePathInput({
  id,
  label,
  value,
  error,
  onChange,
  uploadsEnabled,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (url: string, publicId: string) => void;
  uploadsEnabled: boolean;
}) {
  const inLibrary = CASE_STUDY_IMAGE_LIBRARY.some((i) => i.url === value);
  const uploaded = isCloudinaryUrl(value);
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {uploadsEnabled && (
        <div className="sm:col-span-2">
          <ImageUploadButton label={`${label}: upload an image`} onUploaded={(img) => onChange(img.url, img.publicId)} />
        </div>
      )}
      <div>
        <label htmlFor={`${id}-lib`} className="sr-only">{label}: choose from the library</label>
        <select id={`${id}-lib`} value={inLibrary ? value : ""} onChange={(e) => e.target.value && onChange(e.target.value, "")} className={`${inputClass()} h-11`}>
          <option value="">{inLibrary ? "Choose a site image" : uploaded ? "Uploaded image" : value ? "Custom path (below)" : "Choose a site image"}</option>
          {CASE_STUDY_IMAGE_LIBRARY.map((img) => (
            <option key={img.url} value={img.url}>
              {img.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={id} className="sr-only">{label}: site path</label>
        <input id={id} value={value} readOnly={uploaded} placeholder="/images/case-studies/cover.jpg" spellCheck={false} autoCapitalize="none" onChange={(e) => onChange(e.target.value.trim(), "")} title={uploaded ? "Uploaded to Cloudinary. Upload or pick another image to replace it." : undefined} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error)} className={`${inputClass(error)} h-11 font-mono text-[0.8125rem]`} />
      </div>
      <div className="sm:col-span-2">
        <ErrorText id={id} error={error} />
      </div>
    </div>
  );
}

export function ImagesSection({ values, errors, patch, uploadsEnabled }: MediaSectionProps) {
  const ids = { url: useId(), alt: useId(), pos: useId(), ill: useId() };
  const cover = values.cover;
  const setCover = (c: Partial<CaseStudyFormValues["cover"]>) => patch({ cover: { ...cover, ...c } });
  const coverError = errors.coverImage ?? errors["coverImage.kind"];

  return (
    <section aria-label="Images" className="space-y-4">
      <SectionTitle>Images</SectionTitle>
      {!uploadsEnabled && (
        <p className="flex gap-2 rounded-lg border border-[#c08a2d]/25 bg-[#c08a2d]/[0.07] p-3 text-xs leading-relaxed text-[#6b4a12]">
          <Info aria-hidden="true" size={15} className="mt-px shrink-0" />
          Image uploads are off (Cloudinary isn&rsquo;t configured on the server). Choose an image that already exists on the site: the library, or a path under /images/.
        </p>
      )}

      <fieldset>
        <legend className="text-sm font-medium text-ink">Cover</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {COVER_OPTIONS.map((o) => (
            <label key={o.kind} className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-burgundy ${cover.kind === o.kind ? "border-[#5a0c14] bg-[#5a0c14] text-white" : "border-black/15 bg-white text-ink hover:border-black/30"}`}>
              <input type="radio" name="cover-kind" value={o.kind} checked={cover.kind === o.kind} onChange={() => setCover({ kind: o.kind })} className="sr-only" />
              {o.label}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-ink-3">Typographic: the branded title visual used when no approved photograph exists. A cover is required to publish.</p>
        <ErrorText id="cover-kind" error={coverError} />
      </fieldset>

      <CaseStudyCover src={cover.kind === "IMAGE" && cover.url ? cover.url : null} typographic={cover.kind === "TYPOGRAPHIC"} alt={cover.alt} label={values.title.charAt(0) || "—"} sizes="40rem" className="aspect-[16/9] rounded-lg" />

      {cover.kind === "IMAGE" && (
        <div className="space-y-4">
          <ImagePathInput id={ids.url} label="Cover image" value={cover.url} error={errors["coverImage.url"] ?? errors["coverImage.publicId"]} uploadsEnabled={uploadsEnabled} onChange={(url, publicId) => setCover({ url, publicId })} />
          <Field id={ids.alt} label="Image description (alt text)" hint="Required to publish." error={errors["coverImage.alt"]} count={`${cover.alt.length}/${L.alt}`}>
            <input id={ids.alt} value={cover.alt} maxLength={L.alt + 20} onChange={(e) => setCover({ alt: e.target.value })} aria-invalid={errors["coverImage.alt"] ? true : undefined} aria-describedby={describedBy(ids.alt, errors["coverImage.alt"], true)} className={`${inputClass(errors["coverImage.alt"])} h-11`} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={ids.pos} label="Crop position (optional)" hint="e.g. 50% 40%" error={errors["coverImage.position"]}>
              <input id={ids.pos} value={cover.position} placeholder="50% 50%" onChange={(e) => setCover({ position: e.target.value })} aria-describedby={describedBy(ids.pos, errors["coverImage.position"], true)} className={`${inputClass(errors["coverImage.position"])} h-11`} />
            </Field>
            <label htmlFor={ids.ill} className="flex min-h-11 cursor-pointer items-center gap-3 self-end text-sm text-ink">
              <input id={ids.ill} type="checkbox" checked={cover.illustrative} onChange={(e) => setCover({ illustrative: e.target.checked })} className="size-4 accent-[#5a0c14]" />
              Illustrative image (not the client&rsquo;s work)
            </label>
          </div>
        </div>
      )}

      <Repeater
        legend="Gallery (optional)"
        items={values.gallery}
        max={L.gallery}
        addLabel="Add gallery image"
        empty="Shown below the results on the project page."
        onAdd={() => patch({ gallery: [...values.gallery, { url: "", publicId: "", alt: "" }] })}
        onRemove={(i) => patch({ gallery: values.gallery.filter((_, j) => j !== i) })}
        groupError={errors.gallery}
        render={(g, i, id) => {
          const e = rowErrors(errors, "gallery", i);
          const set = (c: Partial<typeof g>) => patch({ gallery: values.gallery.map((x, j) => (j === i ? { ...x, ...c } : x)) });
          return (
            <div className="space-y-2">
              <ImagePathInput id={`${id}-url`} label={`Gallery image ${i + 1}`} value={g.url} error={e.url ?? e.publicId ?? errors[`gallery.${i}`]} uploadsEnabled={uploadsEnabled} onChange={(url, publicId) => set({ url, publicId })} />
              <label htmlFor={`${id}-alt`} className="sr-only">Gallery image {i + 1} description</label>
              <input id={`${id}-alt`} value={g.alt} placeholder="Image description (alt text)" maxLength={L.alt + 20} onChange={(ev) => set({ alt: ev.target.value })} aria-invalid={e.alt ? true : undefined} className={`${inputClass(e.alt)} h-10`} />
              <ErrorText id={`${id}-alt`} error={e.alt} />
            </div>
          );
        }}
      />
    </section>
  );
}

export function SeoSection({ values, errors, patch, uploadsEnabled }: MediaSectionProps) {
  const ids = { title: useId(), desc: useId(), og: useId() };
  const preview = seoFor({
    title: values.title || "Project title",
    projectHighlight: values.projectHighlight || "Project highlight",
    seo: { title: values.seo.title || undefined, description: values.seo.description || undefined, ogImage: values.seo.ogImage || undefined },
    coverImage: values.cover.kind === "IMAGE" ? { kind: "IMAGE", url: values.cover.url, alt: values.cover.alt, illustrative: false } : { kind: values.cover.kind, alt: "", illustrative: false },
  });
  const set = (c: Partial<CaseStudyFormValues["seo"]>) => patch({ seo: { ...values.seo, ...c } });

  return (
    <section aria-label="SEO" className="space-y-4">
      <SectionTitle note="Optional. Empty fields use the title and the project highlight.">SEO</SectionTitle>
      <Field id={ids.title} label="SEO title" error={errors["seo.title"]} count={`${values.seo.title.length}/${L.seoTitle}`}>
        <input id={ids.title} value={values.seo.title} maxLength={L.seoTitle + 20} placeholder={`${values.title || "Project title"} — Case Study`} onChange={(e) => set({ title: e.target.value })} aria-invalid={errors["seo.title"] ? true : undefined} aria-describedby={describedBy(ids.title, errors["seo.title"])} className={`${inputClass(errors["seo.title"])} h-11`} />
      </Field>
      <Field id={ids.desc} label="SEO description" error={errors["seo.description"]} count={`${values.seo.description.length}/${L.seoDescription}`}>
        <textarea id={ids.desc} value={values.seo.description} rows={2} maxLength={L.seoDescription + 40} placeholder={values.projectHighlight || "Uses the project highlight"} onChange={(e) => set({ description: e.target.value })} aria-invalid={errors["seo.description"] ? true : undefined} aria-describedby={describedBy(ids.desc, errors["seo.description"])} className={`${inputClass(errors["seo.description"])} resize-y py-2.5`} />
      </Field>
      <div>
        <p className="text-sm font-medium text-ink">Social image (optional)</p>
        <p className="mt-0.5 text-xs text-ink-3">Defaults to the cover image.</p>
        <div className="mt-1.5">
          <ImagePathInput id={ids.og} label="Social image" value={values.seo.ogImage} error={errors["seo.ogImage"]} uploadsEnabled={uploadsEnabled} onChange={(ogImage) => set({ ogImage })} />
        </div>
      </div>
      <div aria-label="Search result preview" className="rounded-lg border border-black/[0.08] bg-white p-4">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">Search preview</p>
        <p className="mt-2 truncate text-[1.0625rem] text-[#1a0dab]">{preview.title} | CULT.URE</p>
        <p className="mt-0.5 text-xs text-[#006621]">studioculture.in/case-studies/{values.slug || "…"}</p>
        <p className="mt-1 line-clamp-2 text-sm text-ink-2">{preview.description}</p>
      </div>
    </section>
  );
}
