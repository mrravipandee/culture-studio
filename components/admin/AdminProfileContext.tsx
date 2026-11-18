"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Signed-in admin's display identity (name + email), shared across the admin panel.
 *
 * Pages render the header with the name/email read from MongoDB on the server. When the
 * profile is edited in Settings, `updateProfile` stores the saved values here, so the
 * header (and anything else using `useAdminIdentity`) updates immediately, without a reload.
 * Holds display data only: no IDs, tokens or secrets.
 */

export interface AdminIdentity {
  name: string;
  email: string;
}

interface AdminProfileContextValue {
  /** Latest values saved in this tab, or null when nothing was edited yet. */
  override: AdminIdentity | null;
  updateProfile: (identity: AdminIdentity) => void;
}

const AdminProfileContext = createContext<AdminProfileContextValue | null>(null);

export function AdminProfileProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<AdminIdentity | null>(null);
  const updateProfile = useCallback((identity: AdminIdentity) => setOverride({ name: identity.name, email: identity.email }), []);
  const value = useMemo(() => ({ override, updateProfile }), [override, updateProfile]);
  return <AdminProfileContext.Provider value={value}>{children}</AdminProfileContext.Provider>;
}

/** Setter for components that change the profile (Settings). Safe outside the provider (no-op). */
export function useUpdateAdminProfile() {
  return useContext(AdminProfileContext)?.updateProfile ?? noop;
}

/**
 * Identity to display: values saved in this tab win over the server-rendered ones (they are
 * newer); otherwise the server values are used.
 */
export function useAdminIdentity(server: AdminIdentity): AdminIdentity {
  const override = useContext(AdminProfileContext)?.override;
  return override ?? server;
}

const noop = () => {};
