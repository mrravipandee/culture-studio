"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { emptyDoc, isRichDoc, type RichNode } from "@/lib/rich-text";
import type { LibraryImage } from "../ImagePicker";
import { articleExtensions } from "./extensions";
import LinkDialog from "./LinkDialog";
import ImageDialog, { type ArticleImageAttrs } from "./ImageDialog";

interface Props {
  initialContent: RichNode;
  /** Debounced; the parent also reads the latest JSON via `editorRef` when saving. */
  onChange: (doc: RichNode) => void;
  editorRef: React.MutableRefObject<Editor | null>;
  library: LibraryImage[];
  onPreviewUrl: (url: string) => void;
  invalid?: boolean;
  describedBy?: string;
}

function ToolButton({ label, shortcut, active, disabled, onClick, children }: { label: string; shortcut?: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  const tip = shortcut ? `${label} (${shortcut})` : label;
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep the text selection
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      title={tip}
      className={`grid size-9 shrink-0 place-items-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-30 ${
        active ? "bg-[#5a0c14] text-white" : "text-ink hover:bg-black/[0.06]"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-black/10" />;

/** Active formatting for the toolbar. */
function toolbarState(e: Editor) {
  const level = [1, 2, 3, 4].find((l) => e.isActive("heading", { level: l })) ?? 0;
  const sel = e.state.selection;
  return {
    level,
    bold: e.isActive("bold"),
    italic: e.isActive("italic"),
    underline: e.isActive("underline"),
    strike: e.isActive("strike"),
    code: e.isActive("code"),
    link: e.isActive("link"),
    bullet: e.isActive("bulletList"),
    ordered: e.isActive("orderedList"),
    quote: e.isActive("blockquote"),
    center: e.isActive({ textAlign: "center" }),
    right: e.isActive({ textAlign: "right" }),
    image: sel instanceof NodeSelection && sel.node.type.name === "image",
    canUndo: e.can().undo(),
    canRedo: e.can().redo(),
  };
}

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** WYSIWYG editor (TipTap). Content in/out as JSON (lib/rich-text.ts). */
export default function RichTextEditor({ initialContent, onChange, editorRef, library, onPreviewUrl, invalid, describedBy }: Props) {
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState<{ edit: ArticleImageAttrs | null } | null>(null);
  /**
   * Bumped when TipTap creates (or re-creates) the editor. With immediatelyRender: false the
   * instance is created in an effect; under React Strict Mode's double effects the store
   * notification can be missed, so this guarantees a re-render that picks the editor up.
   */
  const [, setEditorVersion] = useState(0);
  const mod = isMac() ? "⌘" : "Ctrl";

  const editor = useEditor({
    extensions: articleExtensions(),
    content: isRichDoc(initialContent) ? initialContent : emptyDoc(),
    immediatelyRender: false, // avoids SSR/hydration mismatches in Next.js
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: "cs-prose cs-editor min-h-[26rem] px-5 py-6 outline-none sm:px-8 sm:py-8",
        "aria-label": "Article body",
        "aria-multiline": "true",
        role: "textbox",
        ...(invalid ? { "aria-invalid": "true" } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      },
    },
    onCreate: () => setEditorVersion((v) => v + 1),
    onUpdate: ({ editor: ed }) => {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => onChange(ed.getJSON() as RichNode), 250);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [editor, editorRef]);

  const live = useEditorState({ editor, selector: ({ editor: e }) => (e ? toolbarState(e) : null) });
  // useEditorState keeps its first (null) snapshot until the first transaction; read the
  // editor directly until then so the toolbar renders immediately.
  const state = live ?? (editor ? toolbarState(editor) : null);

  if (!editor || !state) {
    return <div className="min-h-[30rem] animate-pulse rounded-xl border border-black/10 bg-white/60" aria-hidden="true" />;
  }

  const chain = () => editor.chain().focus();
  const setBlock = (value: string) => {
    if (value === "p") chain().setParagraph().run();
    else chain().setHeading({ level: Number(value) as 1 | 2 | 3 | 4 }).run();
  };
  const align = (a: "left" | "center" | "right") => chain().setTextAlign(a).run();

  const openImage = () => {
    const sel = editor.state.selection;
    if (sel instanceof NodeSelection && sel.node.type.name === "image") {
      const a = sel.node.attrs as Record<string, unknown>;
      setImageOpen({ edit: { src: String(a.src ?? ""), alt: String(a.alt ?? ""), caption: String(a.caption ?? ""), align: a.align === "wide" ? "wide" : "center" } });
    } else setImageOpen({ edit: null });
  };

  const selectionText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, " ");

  return (
    <div className={`overflow-hidden rounded-xl border bg-white ${invalid ? "border-[#a3242f]" : "border-black/10"}`}>
      {/* Toolbar */}
      <div role="toolbar" aria-label="Formatting" className="sticky top-0 z-10 flex items-center gap-0.5 overflow-x-auto sm:flex-wrap sm:gap-y-1 sm:overflow-visible border-b border-black/10 bg-white/95 px-2 py-1.5 backdrop-blur-sm [scrollbar-width:thin]">
        <label className="sr-only" htmlFor="editor-block-type">
          Text style
        </label>
        <select
          id="editor-block-type"
          value={state.level ? String(state.level) : "p"}
          onChange={(e) => setBlock(e.target.value)}
          className="h-9 shrink-0 rounded-md border border-black/15 bg-white pl-2.5 pr-7 text-sm text-ink focus-visible:outline-2 focus-visible:outline-burgundy"
          title="Text style"
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>
        <Divider />
        <ToolButton label="Bold" shortcut={`${mod}+B`} active={state.bold} onClick={() => chain().toggleBold().run()}>
          <Bold aria-hidden="true" size={17} />
        </ToolButton>
        <ToolButton label="Italic" shortcut={`${mod}+I`} active={state.italic} onClick={() => chain().toggleItalic().run()}>
          <Italic aria-hidden="true" size={17} />
        </ToolButton>
        <ToolButton label="Underline" shortcut={`${mod}+U`} active={state.underline} onClick={() => chain().toggleUnderline().run()}>
          <Underline aria-hidden="true" size={17} />
        </ToolButton>
        <ToolButton label="Strikethrough" shortcut={`${mod}+Shift+S`} active={state.strike} onClick={() => chain().toggleStrike().run()}>
          <Strikethrough aria-hidden="true" size={17} />
        </ToolButton>
        <ToolButton label="Inline code" shortcut={`${mod}+E`} active={state.code} onClick={() => chain().toggleCode().run()}>
          <Code aria-hidden="true" size={17} />
        </ToolButton>
        <Divider />
        <ToolButton label="Align left" active={!state.center && !state.right} onClick={() => align("left")}>
          <AlignLeft aria-hidden="true" size={17} />
        </ToolButton>
        <ToolButton label="Align centre" active={state.center} onClick={() => align("center")}>
          <AlignCenter aria-hidden="true" size={17} />
        </ToolButton>
        <ToolButton label="Align right" active={state.right} onClick={() => align("right")}>
          <AlignRight aria-hidden="true" size={17} />
        </ToolButton>
        <Divider />
        <ToolButton label="Bullet list" shortcut={`${mod}+Shift+8`} active={state.bullet} onClick={() => chain().toggleBulletList().run()}>
          <List aria-hidden="true" size={17} />
        </ToolButton>
        <ToolButton label="Numbered list" shortcut={`${mod}+Shift+7`} active={state.ordered} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrdered aria-hidden="true" size={17} />
        </ToolButton>
        <Divider />
        <ToolButton label={state.link ? "Edit link" : "Add link"} shortcut={`${mod}+K`} active={state.link} onClick={() => setLinkOpen(true)}>
          <Link2 aria-hidden="true" size={17} />
        </ToolButton>
        <ToolButton label={state.image ? "Edit image" : "Insert image"} active={state.image} onClick={openImage}>
          <ImageIcon aria-hidden="true" size={17} />
        </ToolButton>
        <ToolButton label="Quote" shortcut={`${mod}+Shift+B`} active={state.quote} onClick={() => chain().toggleBlockquote().run()}>
          <Quote aria-hidden="true" size={17} />
        </ToolButton>
        <ToolButton label="Divider" onClick={() => chain().setHorizontalRule().run()}>
          <Minus aria-hidden="true" size={17} />
        </ToolButton>
        <Divider />
        <ToolButton label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()}>
          <RemoveFormatting aria-hidden="true" size={17} />
        </ToolButton>
        <ToolButton label="Undo" shortcut={`${mod}+Z`} disabled={!state.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 aria-hidden="true" size={17} />
        </ToolButton>
        <ToolButton label="Redo" shortcut={`${mod}+Shift+Z`} disabled={!state.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 aria-hidden="true" size={17} />
        </ToolButton>
      </div>

      <div
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            setLinkOpen(true);
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>

      <LinkDialog
        key={linkOpen ? "open" : "closed"}
        open={linkOpen}
        initialHref={String(editor.getAttributes("link").href ?? "")}
        selectionText={selectionText}
        onClose={() => {
          setLinkOpen(false);
          editor.commands.focus();
        }}
        onRemove={() => {
          chain().extendMarkRange("link").unsetLink().run();
          setLinkOpen(false);
        }}
        onApply={(href) => {
          if (editor.state.selection.empty && !editor.isActive("link")) {
            chain().insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
          } else {
            chain().extendMarkRange("link").setLink({ href }).run();
          }
          setLinkOpen(false);
        }}
      />
      <ImageDialog
        key={imageOpen ? `img-${imageOpen.edit?.src ?? "new"}` : "img-closed"}
        open={imageOpen !== null}
        initial={imageOpen?.edit ?? null}
        library={library}
        onPreviewUrl={onPreviewUrl}
        onClose={() => {
          setImageOpen(null);
          editor.commands.focus();
        }}
        onRemove={() => {
          chain().deleteSelection().run();
          setImageOpen(null);
        }}
        onApply={(attrs) => {
          if (imageOpen?.edit) chain().updateAttributes("image", attrs).run();
          else chain().insertContent({ type: "image", attrs }).run();
          setImageOpen(null);
        }}
      />
    </div>
  );
}
