"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

/**
 * Sign-out with confirmation, shared by every logout button in the admin panel (sidebar,
 * mobile drawer, header profile menu). One dialog lives in the admin layout.
 *
 * Secure sign-out: POST /api/admin/logout clears the sealed session cookie on the server,
 * then a full page load replaces the history entry with /admin/login. A full load (rather
 * than a client transition) discards the signed-in sidebar and every cached admin page.
 */

interface AdminLogoutContextValue {
  /** Opens the confirmation dialog. */
  requestLogout: () => void;
  pending: boolean;
}

const AdminLogoutContext = createContext<AdminLogoutContextValue | null>(null);

async function signOut() {
  try {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
  } finally {
    window.location.replace("/admin/login");
  }
}

export function AdminLogoutProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const lock = useRef(false);

  const requestLogout = useCallback(() => {
    if (!lock.current) setOpen(true);
  }, []);

  const confirm = () => {
    if (lock.current) return; // ignore double clicks
    lock.current = true;
    setPending(true);
    void signOut();
  };

  const value = useMemo(() => ({ requestLogout, pending }), [requestLogout, pending]);

  return (
    <AdminLogoutContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={open}
        title="Log out of the admin portal?"
        description="You'll need to sign in again to manage enquiries, case studies, blogs and subscribers."
        confirmLabel={pending ? "Logging out…" : "Log out"}
        cancelLabel="Stay signed in"
        tone="danger"
        icon={<LogOut size={20} />}
        busy={pending}
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      />
    </AdminLogoutContext.Provider>
  );
}

/**
 * Logout for buttons: `logout()` asks for confirmation first.
 * Outside the provider (shouldn't happen) it falls back to the browser's confirm().
 */
export function useAdminLogout() {
  const ctx = useContext(AdminLogoutContext);
  const [fallbackPending, setFallbackPending] = useState(false);
  const fallback = useCallback(() => {
    if (!window.confirm("Log out of the admin portal?")) return;
    setFallbackPending(true);
    void signOut();
  }, []);
  return ctx ? { logout: ctx.requestLogout, pending: ctx.pending } : { logout: fallback, pending: fallbackPending };
}
