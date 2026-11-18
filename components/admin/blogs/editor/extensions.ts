import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import type { DOMOutputSpec } from "@tiptap/pm/model";
import { isSafeHref } from "@/lib/rich-text";

/**
 * Editor schema. Matches the public renderer's whitelist (lib/rich-text.ts):
 * paragraphs, H1–H4, bold/italic/underline/strike/inline code, links, lists, blockquote,
 * horizontal rule, images with alt + caption + alignment, undo/redo. Code blocks are off.
 */

/** Block image with caption and alignment, rendered as <figure>. */
export const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-caption"),
        renderHTML: (attrs: Record<string, unknown>) => (attrs.caption ? { "data-caption": String(attrs.caption) } : {}),
      },
      align: {
        default: "center",
        parseHTML: (el: HTMLElement) => (el.getAttribute("data-align") === "wide" ? "wide" : "center"),
        renderHTML: (attrs: Record<string, unknown>) => ({ "data-align": attrs.align === "wide" ? "wide" : "center" }),
      },
    };
  },
  renderHTML({ HTMLAttributes }): DOMOutputSpec {
    const { "data-caption": caption, "data-align": align, ...img } = HTMLAttributes as Record<string, string | undefined>;
    return caption ? ["figure", { "data-align": align }, ["img", img], ["figcaption", {}, caption]] : ["figure", { "data-align": align }, ["img", img]];
  },
}).configure({ inline: false, allowBase64: false });

export function articleExtensions(placeholder = "Start writing your article…") {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      codeBlock: false,
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        // Only http(s), mailto, tel, site paths and #anchors; javascript:, data: etc. are refused.
        isAllowedUri: (url) => isSafeHref(url),
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: null },
      },
    }),
    TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right"], defaultAlignment: "left" }),
    ArticleImage,
    Placeholder.configure({ placeholder }),
  ];
}
