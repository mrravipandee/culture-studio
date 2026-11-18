/**
 * Article body format shared by the admin editor (TipTap) and the public renderer.
 *
 * Content is stored as TipTap/ProseMirror JSON, never as HTML. The public renderer
 * (components/blog/RichText.tsx) walks this tree and outputs React elements for a fixed
 * whitelist of node and mark types, so there is no raw HTML to sanitise and unknown or
 * unsafe input is dropped instead of rendered.
 *
 * Client- and server-safe (no imports).
 */

export interface RichMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface RichNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  marks?: RichMark[];
  text?: string;
}

export const ALLOWED_NODES = new Set([
  "doc",
  "paragraph",
  "heading",
  "text",
  "hardBreak",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "horizontalRule",
  "image",
]);
export const ALLOWED_MARKS = new Set(["bold", "italic", "underline", "strike", "code", "link"]);
export const HEADING_LEVELS = [1, 2, 3, 4] as const;
export const ALIGNMENTS = ["left", "center", "right"] as const;

export const emptyDoc = (): RichNode => ({ type: "doc", content: [{ type: "paragraph" }] });

/* Links ------------------------------------------------------------------- */

/**
 * Allowed: https/http URLs, mailto:, tel:, site-relative paths ("/services") and
 * in-page anchors ("#section"). Everything else (javascript:, data:, vbscript:, //host …)
 * is rejected.
 */
export function isSafeHref(href: unknown): href is string {
  if (typeof href !== "string") return false;
  const value = href.trim();
  if (/^tel:\+?[\d\s().-]{5,}$/i.test(value)) return true; // phone numbers may contain spaces
  if (!value || value.length > 2048 || /[\s<>"]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (value.startsWith("#")) return /^#[\w-]+$/.test(value);
  if (/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(value)) return true;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
}

/** External = absolute http(s) link to another site (opens in a new tab with rel=noopener). */
export const isExternalHref = (href: string, siteHost = "studioculture.in") => /^https?:\/\//i.test(href) && !new URL(href).hostname.endsWith(siteHost);

/** Accepts "example.com/page" by adding https://; returns null when still invalid. */
export function normaliseHref(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (isSafeHref(value)) return value;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(value) && isSafeHref(`https://${value}`)) return `https://${value}`;
  return null;
}

/** Images inside articles: site assets, https URLs or (admin preview only) local blob: previews. */
export function isSafeImageSrc(src: unknown, allowBlob = false): src is string {
  if (typeof src !== "string" || !src) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  if (allowBlob && src.startsWith("blob:")) return true;
  try {
    return new URL(src).protocol === "https:";
  } catch {
    return false;
  }
}

/* Text statistics ------------------------------------------------------------- */

/** Visible text only (no markup, no attributes). Blocks are separated by spaces. */
export function plainText(node: RichNode | null | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return " ";
  return (node.content ?? []).map(plainText).join(" ");
}

export const countWords = (doc: RichNode | null | undefined) => {
  const text = plainText(doc).trim();
  return text ? text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0;
};

/** Words per minute used for reading time (configurable here). */
export const READING_WPM = 225;

export const readingMinutes = (words: number, wpm = READING_WPM) => (words === 0 ? 0 : Math.max(1, Math.ceil(words / wpm)));
export const readingTimeLabel = (words: number) => `${readingMinutes(words)} min read`;

/* Structure checks ---------------------------------------------------------------- */

const walk = (node: RichNode, visit: (n: RichNode) => void) => {
  visit(node);
  node.content?.forEach((child) => walk(child, visit));
};

export interface DocIssues {
  unknownTypes: string[];
  unsafeLinks: number;
  unsafeImages: number;
  imagesWithoutAlt: number;
  h1Count: number;
}

export function inspectDoc(doc: RichNode | null | undefined, allowBlob = false): DocIssues {
  const issues: DocIssues = { unknownTypes: [], unsafeLinks: 0, unsafeImages: 0, imagesWithoutAlt: 0, h1Count: 0 };
  if (!doc || doc.type !== "doc") {
    issues.unknownTypes.push(doc?.type ?? "empty");
    return issues;
  }
  const unknown = new Set<string>();
  walk(doc, (n) => {
    if (!ALLOWED_NODES.has(n.type)) unknown.add(n.type);
    if (n.type === "heading" && n.attrs?.level === 1) issues.h1Count += 1;
    if (n.type === "image") {
      if (!isSafeImageSrc(n.attrs?.src, allowBlob)) issues.unsafeImages += 1;
      if (typeof n.attrs?.alt !== "string" || !n.attrs.alt.trim()) issues.imagesWithoutAlt += 1;
    }
    n.marks?.forEach((m) => {
      if (!ALLOWED_MARKS.has(m.type)) unknown.add(`mark:${m.type}`);
      if (m.type === "link" && !isSafeHref(m.attrs?.href)) issues.unsafeLinks += 1;
    });
  });
  issues.unknownTypes = [...unknown];
  return issues;
}

/** True when the document has visible text or at least one image. */
export function hasContent(doc: RichNode | null | undefined) {
  if (!doc) return false;
  let images = 0;
  walk(doc, (n) => {
    if (n.type === "image") images += 1;
  });
  return plainText(doc).trim().length > 0 || images > 0;
}

/** Type guard for values loaded from storage/APIs. */
export function isRichDoc(value: unknown): value is RichNode {
  return typeof value === "object" && value !== null && (value as RichNode).type === "doc";
}
