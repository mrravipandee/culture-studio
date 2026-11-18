import type { CSSProperties, ReactNode } from "react";
import { ALIGNMENTS, isExternalHref, isSafeHref, isSafeImageSrc, type RichMark, type RichNode } from "@/lib/rich-text";

/**
 * Renders article JSON (lib/rich-text.ts) as semantic HTML via React — no
 * dangerouslySetInnerHTML. Only whitelisted nodes/marks render; unsafe links lose their
 * link, unsafe images are skipped, unknown nodes render their text children only.
 *
 * Heading levels: the article title is the page's H1, so an H1 inside the body is
 * rendered as H2 to keep a single H1 per page (H2–H4 render as written).
 */

interface Props {
  doc: RichNode | null | undefined;
  /** Admin preview may show local blob: image previews; the public site never does. */
  allowBlobImages?: boolean;
}

const alignStyle = (attrs?: Record<string, unknown>): CSSProperties | undefined => {
  const a = attrs?.textAlign;
  return typeof a === "string" && (ALIGNMENTS as readonly string[]).includes(a) && a !== "left" ? { textAlign: a as CSSProperties["textAlign"] } : undefined;
};

function applyMarks(text: ReactNode, marks: RichMark[] | undefined, key: string): ReactNode {
  if (!marks?.length) return text;
  return marks.reduce<ReactNode>((child, mark, i) => {
    const k = `${key}-m${i}`;
    switch (mark.type) {
      case "bold":
        return <strong key={k}>{child}</strong>;
      case "italic":
        return <em key={k}>{child}</em>;
      case "underline":
        return <u key={k}>{child}</u>;
      case "strike":
        return <s key={k}>{child}</s>;
      case "code":
        return <code key={k}>{child}</code>;
      case "link": {
        const href = mark.attrs?.href;
        if (!isSafeHref(href)) return child; // drop unsafe links, keep the text
        const external = isExternalHref(href);
        return (
          <a key={k} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
            {child}
            {external && <span className="sr-only"> (opens in a new tab)</span>}
          </a>
        );
      }
      default:
        return child;
    }
  }, text);
}

function renderNodes(nodes: RichNode[] | undefined, key: string, allowBlob: boolean): ReactNode[] {
  return (nodes ?? []).map((node, i) => renderNode(node, `${key}-${i}`, allowBlob));
}

function renderNode(node: RichNode, key: string, allowBlob: boolean): ReactNode {
  const children = () => renderNodes(node.content, key, allowBlob);
  switch (node.type) {
    case "text":
      return applyMarks(node.text ?? "", node.marks, key);
    case "hardBreak":
      return <br key={key} />;
    case "paragraph":
      return (
        <p key={key} style={alignStyle(node.attrs)}>
          {children()}
        </p>
      );
    case "heading": {
      const level = Number(node.attrs?.level);
      const style = alignStyle(node.attrs);
      if (level === 3) return <h3 key={key} style={style}>{children()}</h3>;
      if (level === 4) return <h4 key={key} style={style}>{children()}</h4>;
      return <h2 key={key} style={style}>{children()}</h2>; // 1 and 2 → h2 (single page H1)
    }
    case "bulletList":
      return <ul key={key}>{children()}</ul>;
    case "orderedList": {
      const start = Number(node.attrs?.start);
      return (
        <ol key={key} start={Number.isInteger(start) && start > 1 ? start : undefined}>
          {children()}
        </ol>
      );
    }
    case "listItem":
      return <li key={key}>{children()}</li>;
    case "blockquote":
      return <blockquote key={key}>{children()}</blockquote>;
    case "horizontalRule":
      return <hr key={key} />;
    case "image": {
      const src = node.attrs?.src;
      if (!isSafeImageSrc(src, allowBlob)) return null;
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      const caption = typeof node.attrs?.caption === "string" ? node.attrs.caption.trim() : "";
      const align = node.attrs?.align === "wide" ? "wide" : "center";
      return (
        <figure key={key} data-align={align}>
          {/* Plain <img>: article images come from editors (any size); dimensions are not known. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} loading="lazy" decoding="async" />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    }
    case "doc":
      return <>{children()}</>;
    default:
      // Unknown block: keep any text, drop the wrapper.
      return <span key={key}>{children()}</span>;
  }
}

export default function RichText({ doc, allowBlobImages = false }: Props) {
  if (!doc || doc.type !== "doc") return null;
  return <div className="cs-prose">{renderNodes(doc.content, "n", allowBlobImages)}</div>;
}
