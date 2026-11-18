"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  /** Opens a link instead (e.g. the public page). */
  href?: string;
  external?: boolean;
  danger?: boolean;
}

/** Small "…" menu. Closes on outside click, Escape or after choosing an item. */
export default function ActionMenu({ label, items }: { label: string; items: ActionMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey, true);
    root.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const itemClass = (danger?: boolean) =>
    `flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-burgundy ${
      danger ? "text-[#a3242f] hover:bg-[#a3242f]/5" : "text-ink hover:bg-black/[0.04]"
    }`;

  return (
    <div ref={root} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-burgundy"
      >
        <MoreHorizontal aria-hidden="true" size={18} />
      </button>
      <div
        id={menuId}
        role="menu"
        hidden={!open}
        className="admin-pop absolute right-0 bottom-full z-30 mb-1 w-48 rounded-lg border border-black/10 bg-white p-1.5 shadow-[0_8px_24px_rgba(36,12,14,0.12)]"
      >
        {items.map((item) =>
          item.href ? (
            <a
              key={item.label}
              role="menuitem"
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              onClick={() => setOpen(false)}
              className={itemClass(item.danger)}
            >
              {item.icon}
              {item.label}
            </a>
          ) : (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onSelect?.();
              }}
              className={itemClass(item.danger)}
            >
              {item.icon}
              {item.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
