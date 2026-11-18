"use client";

import { useCallback, useState } from "react";

/**
 * Secure sign-out: POST /api/admin/logout clears the sealed session cookie on the server,
 * then a full page load replaces the history entry with /admin/login. A full load (rather
 * than a client transition) discards the signed-in sidebar and every cached admin page.
 */
export function useAdminLogout() {
  const [pending, setPending] = useState(false);

  const logout = useCallback(async () => {
    setPending(true);
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      window.location.replace("/admin/login");
    }
  }, []);

  return { logout, pending };
}
