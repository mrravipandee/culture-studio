"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Live admin counts shared by the sidebar badge and the header bell.
 *
 * The admin layout can't query MongoDB itself (it renders outside the pages' Suspense
 * boundaries), so every page computes the NEW-enquiry count on the server (MongoDB) and
 * renders <SyncNewEnquiries count={…} /> to publish it here. The Enquiries page also updates
 * it after status changes and deletions, so the badge stays correct without a reload.
 */

interface AdminCounts {
  /** null until a page has reported the count. */
  newEnquiries: number | null;
  setNewEnquiries: (count: number) => void;
}

const AdminCountsContext = createContext<AdminCounts | null>(null);

export function AdminCountsProvider({ children }: { children: ReactNode }) {
  const [newEnquiries, setNewEnquiries] = useState<number | null>(null);
  const value = useMemo(() => ({ newEnquiries, setNewEnquiries }), [newEnquiries]);
  return <AdminCountsContext.Provider value={value}>{children}</AdminCountsContext.Provider>;
}

const noop = () => {};

export function useAdminCounts(): AdminCounts {
  return useContext(AdminCountsContext) ?? { newEnquiries: null, setNewEnquiries: noop };
}

/** Publishes a server-computed NEW-enquiry count to the shared context. Renders nothing. */
export function SyncNewEnquiries({ count }: { count: number }) {
  const { setNewEnquiries } = useAdminCounts();
  useEffect(() => {
    setNewEnquiries(count);
  }, [count, setNewEnquiries]);
  return null;
}
