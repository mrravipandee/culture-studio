"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useAdminLogout } from "../useAdminLogout";
import { editorialSerif } from "@/lib/fonts";

/** Admin avatar + email with a small menu (sign out uses the secure server logout). */
export default function ProfileMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const { logout, pending } = useAdminLogout();
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 text-left transition-colors hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-burgundy"
      >
        <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-full bg-[#4a121a] ${editorialSerif.className} text-lg text-[#F8F5F0]`}>
          {email.charAt(0).toUpperCase() || "A"}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block text-sm font-semibold text-[#1a0a0c]">Admin</span>
          <span className="block max-w-[11rem] truncate text-xs text-ink-2">{email}</span>
        </span>
        <ChevronDown aria-hidden="true" size={16} className={`text-ink-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        <span className="sr-only">Account menu</span>
      </button>

      <div
        id={menuId}
        role="menu"
        hidden={!open}
        className="admin-pop absolute right-0 z-30 mt-2 w-56 rounded-lg border border-black/10 bg-white p-1.5 shadow-[0_8px_24px_rgba(36,12,14,0.08)]"
      >
        <p className="truncate px-3 pt-2 pb-2 text-xs text-ink-3">{email}</p>
        <button
          type="button"
          role="menuitem"
          onClick={logout}
          disabled={pending}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink transition-colors hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-60"
        >
          <LogOut aria-hidden="true" size={16} strokeWidth={1.75} />
          {pending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
