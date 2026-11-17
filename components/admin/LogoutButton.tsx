"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

/** Signs out via POST /api/admin/logout, then replaces the route with the login page (the proxy re-checks the cookie). */
export default function LogoutButton() {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const signOut = async () => {
    setPending(true);
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="inline-flex h-12 items-center gap-2 rounded-[3px] border border-black/20 px-5 text-sm font-medium text-ink transition-colors hover:border-burgundy hover:text-burgundy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:opacity-60"
    >
      <LogOut aria-hidden="true" size={16} strokeWidth={1.75} />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
