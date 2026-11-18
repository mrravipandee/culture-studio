"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { BlogPost, BlogStatus } from "@/lib/admin/types";
import { normaliseBlogForm, type BlogFormValues } from "@/lib/admin/blog-utils";

/**
 * Blog admin store, shared by /admin/blogs, /new and /[id]/edit (it lives in their layout,
 * so it survives navigation between them).
 *
 * LOCAL ONLY: every change is kept in this browser tab and resets on reload. Nothing is
 * persisted, uploaded or published to the public website (that is controlled by
 * lib/content/blog-publishing.ts). Swap these functions for API calls later.
 */

interface BlogStore {
  items: BlogPost[];
  find: (id: string) => BlogPost | undefined;
  create: (values: BlogFormValues, status: BlogStatus) => BlogPost;
  update: (id: string, values: BlogFormValues, status: BlogStatus) => BlogPost | null;
  setStatus: (id: string, status: BlogStatus) => boolean;
  remove: (ids: string[]) => number;
  /** Register a local preview (blob:) URL so it can be released later. */
  trackPreview: (url: string) => void;
  toast: string | null;
  notify: (message: string) => void;
}

const Ctx = createContext<BlogStore | null>(null);

export function useBlogStore() {
  const store = useContext(Ctx);
  if (!store) throw new Error("useBlogStore must be used inside <BlogStoreProvider>.");
  return store;
}

const publishedAtFor = (values: BlogFormValues, status: BlogStatus, previous: string | null, now: string) => {
  if (status !== "PUBLISHED") return previous && values.publishDate ? previous : null;
  if (values.publishDate) {
    const keepsTime = previous && previous.slice(0, 10) === values.publishDate;
    return keepsTime ? previous : `${values.publishDate}T10:00:00+05:30`;
  }
  return previous ?? now;
};

export default function BlogStoreProvider({ initial, children }: { initial: BlogPost[]; children: ReactNode }) {
  const [items, setItems] = useState<BlogPost[]>(initial);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previews = useRef<Set<string>>(new Set());
  const counter = useRef(0);
  // Mirror for synchronous reads inside callbacks (prevents acting on stale state).
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const urls = previews.current;
    return () => {
      if (timer.current) clearTimeout(timer.current);
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  const find = useCallback((id: string) => itemsRef.current.find((b) => b.id === id), []);

  const create = useCallback((raw: BlogFormValues, status: BlogStatus) => {
    const v = normaliseBlogForm(raw);
    const now = new Date().toISOString();
    counter.current += 1;
    const post: BlogPost = {
      ...v,
      id: `local-${Date.now().toString(36)}-${counter.current}`,
      status,
      publishedAt: publishedAtFor(v, status, null, now),
      createdAt: now,
      updatedAt: now,
      publicSlug: null,
      isLocal: true,
    };
    itemsRef.current = [post, ...itemsRef.current];
    setItems(itemsRef.current);
    return post;
  }, []);

  const update = useCallback((id: string, raw: BlogFormValues, status: BlogStatus) => {
    const current = itemsRef.current.find((b) => b.id === id);
    if (!current) return null;
    const v = normaliseBlogForm(raw);
    const now = new Date().toISOString();
    const next: BlogPost = { ...current, ...v, status, publishedAt: publishedAtFor(v, status, current.publishedAt, now), updatedAt: now };
    itemsRef.current = itemsRef.current.map((b) => (b.id === id ? next : b));
    setItems(itemsRef.current);
    return next;
  }, []);

  const setStatus = useCallback((id: string, status: BlogStatus) => {
    const current = itemsRef.current.find((b) => b.id === id);
    if (!current || current.status === status) return false;
    const now = new Date().toISOString();
    itemsRef.current = itemsRef.current.map((b) =>
      b.id === id ? { ...b, status, publishedAt: status === "PUBLISHED" ? b.publishedAt ?? now : b.publishedAt, updatedAt: now } : b,
    );
    setItems(itemsRef.current);
    return true;
  }, []);

  const remove = useCallback((ids: string[]) => {
    const set = new Set(ids);
    const before = itemsRef.current.length;
    itemsRef.current = itemsRef.current.filter((b) => !set.has(b.id));
    setItems(itemsRef.current);
    return before - itemsRef.current.length;
  }, []);

  const trackPreview = useCallback((url: string) => {
    previews.current.add(url);
  }, []);

  const value = useMemo(() => ({ items, find, create, update, setStatus, remove, trackPreview, toast, notify }), [items, find, create, update, setStatus, remove, trackPreview, toast, notify]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[90] flex justify-center px-4">
        {toast && <p className="admin-pop max-w-lg rounded-lg bg-[#240C0E] px-4 py-2.5 text-center text-sm text-[#F8F5F0] shadow-lg">{toast}</p>}
      </div>
    </Ctx.Provider>
  );
}
