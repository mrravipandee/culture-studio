/**
 * Article body sanitiser. CLIENT-SAFE (pure).
 *
 * The editor stores TipTap / ProseMirror JSON (lib/rich-text.ts). Anything a client sends is
 * untrusted, so before an article is saved the server rebuilds the document from a strict
 * whitelist instead of trusting it:
 *  - only known node and mark types survive (unknown ones are reported, never stored);
 *  - only known attributes survive, each type-checked (heading level 1–4, text alignment,
 *    ordered-list start, link href, image src / alt / title / caption / align);
 *  - links must pass isSafeHref (no javascript:, data:, protocol-relative …);
 *  - images must be site images or the site's Cloudinary uploads (no blob:, data:, other hosts);
 *  - size, depth, node, image and text-length caps stop oversized or hostile payloads.
 * The public renderer (components/blog/RichText.tsx) applies the same whitelist again.
 */

import { ALIGNMENTS, ALLOWED_MARKS, ALLOWED_NODES, isSafeHref, type RichMark, type RichNode } from "@/lib/rich-text";
import { isAllowedImageUrl } from "@/lib/case-studies/constants";
import { BLOG_LIMITS as L } from "./constants";

export interface SanitizeResult {
  doc: RichNode;
  /** Problems that make the body unsaveable (field message per problem). */
  errors: string[];
  /** Every image src in the body (for server-side Cloudinary verification). */
  images: string[];
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);

function cleanMarks(marks: unknown, errors: Set<string>): RichMark[] | undefined {
  if (!Array.isArray(marks)) return undefined;
  const out: RichMark[] = [];
  for (const m of marks) {
    if (!m || typeof m !== "object" || typeof (m as RichMark).type !== "string") continue;
    const type = (m as RichMark).type;
    if (!ALLOWED_MARKS.has(type)) {
      errors.add("The article contains formatting that can't be saved. Remove it and try again.");
      continue;
    }
    if (type === "link") {
      const href = (m as RichMark).attrs?.href;
      if (!isSafeHref(href)) {
        errors.add("A link in the article uses an invalid or unsafe address. Edit or remove it.");
        continue;
      }
      out.push({ type, attrs: { href: href.trim() } });
    } else out.push({ type });
  }
  return out.length ? out : undefined;
}

export function sanitizeRichDoc(input: unknown): SanitizeResult {
  const errors = new Set<string>();
  const images: string[] = [];
  let nodes = 0;
  let textLength = 0;

  let bytes = 0;
  try {
    bytes = new TextEncoder().encode(JSON.stringify(input) ?? "").length;
  } catch {
    errors.add("The article body could not be read.");
  }
  if (bytes > L.contentBytes) errors.add(`The article is too large (over ${Math.round(L.contentBytes / 1024)} KB). Split it into shorter articles.`);

  const visit = (raw: unknown, depth: number): RichNode | null => {
    if (!raw || typeof raw !== "object") return null;
    const node = raw as RichNode;
    if (typeof node.type !== "string") return null;
    if (++nodes > L.contentNodes) {
      errors.add("The article has too many blocks to save.");
      return null;
    }
    if (depth > L.contentDepth) {
      errors.add("The article is nested too deeply (lists inside lists). Simplify it and try again.");
      return null;
    }
    if (!ALLOWED_NODES.has(node.type)) {
      errors.add("The article contains content that can't be saved. Remove the unsupported block and try again.");
      return null;
    }

    const out: RichNode = { type: node.type };
    const attrs = node.attrs ?? {};

    switch (node.type) {
      case "text": {
        const text = typeof node.text === "string" ? node.text : "";
        if (!text) return null; // ProseMirror never has empty text nodes
        textLength += text.length;
        out.text = text;
        const marks = cleanMarks(node.marks, errors);
        if (marks) out.marks = marks;
        return out;
      }
      case "heading": {
        const level = Number(attrs.level);
        out.attrs = { level: [1, 2, 3, 4].includes(level) ? level : 2 };
        break;
      }
      case "orderedList": {
        const start = Number(attrs.start);
        if (Number.isInteger(start) && start > 1 && start < 10_000) out.attrs = { start };
        break;
      }
      case "image": {
        const src = typeof attrs.src === "string" ? attrs.src.trim() : "";
        if (!isAllowedImageUrl(src)) {
          errors.add("An image in the article isn't an uploaded or site image. Replace it using the image button.");
          return null;
        }
        images.push(src);
        out.attrs = {
          src,
          alt: str(attrs.alt, L.alt) ?? "",
          ...(str(attrs.title, L.alt) ? { title: str(attrs.title, L.alt) } : {}),
          ...(str(attrs.caption, L.caption) ? { caption: str(attrs.caption, L.caption) } : {}),
          align: attrs.align === "wide" ? "wide" : "center",
        };
        return out; // images are leaves
      }
      case "hardBreak":
      case "horizontalRule":
        return out;
    }

    if (node.type === "paragraph" || node.type === "heading") {
      const align = attrs.textAlign;
      if (typeof align === "string" && (ALIGNMENTS as readonly string[]).includes(align) && align !== "left") out.attrs = { ...(out.attrs ?? {}), textAlign: align };
    }

    if (Array.isArray(node.content)) {
      const children = node.content.map((c) => visit(c, depth + 1)).filter((c): c is RichNode => c !== null);
      if (children.length) out.content = children;
    }
    return out;
  };

  const root = input && typeof input === "object" && (input as RichNode).type === "doc" ? visit(input, 0) : null;
  if (!root) errors.add("The article body is missing or invalid.");
  if (textLength > L.textLength * 10) errors.add("The article text is too long.");
  if (images.length > L.contentImages) errors.add(`Use at most ${L.contentImages} images in one article.`);

  const doc: RichNode = root && root.content?.length ? root : { type: "doc", content: [{ type: "paragraph" }] };
  return { doc, errors: [...errors], images };
}
