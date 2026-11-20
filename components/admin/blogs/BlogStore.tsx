"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { BlogSummary } from "@/lib/admin/types";
import { fetchBlogList } from "./blog-api";

/**
 * Blog admin list store, shared by /admin/blogs, /new and /[id]/edit (it lives in their
 * layout). Holds the article list from MongoDB (GET /api/admin/blogs, no bodies) plus the
 * toast. Pages call the API through ./blog-api and then `upsert` / `drop` / `reload`, so the
 * list always reflects what is stored.
 */

interface BlogStore {
  items: BlogSummary[];
  status: "loading" | "ready" | "error";
  error: string | null;
  truncated: boolean;
  reload: () => Promise<void>;
  /** Insert or replace one record (after a save). */
  upsert: (post: BlogSummary) => void;
  /** Remove records (after a delete). */
  drop: (ids: string[]) => void;
  toast: { text: string; tone: "ok" | "error" } | null;
  notify: (text: string, tone?: "ok" | "error") => void;
}

const Ctx = createContext<BlogStore | null>(null);

export function useBlogStore() {
  const store = useContext(Ctx);
  if (!store) throw new Error("useBlogStore must be used inside <BlogStoreProvider>.");
  return store;
}

/** Strips the body if a full record is passed in, so the list stays small. */
const summary = (post: BlogSummary & { content?: unknown }): BlogSummary => {
  const { content: _content, ...rest } = post;
  void _content;
  return rest;
};

export default function BlogStoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BlogSummary[]>([]);
  const [status, setStatus] = useState<BlogStore["status"]>("loading");
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [toast, setToast] = useState<BlogStore["toast"]>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reload = useCallback(async () => {
    const result = await fetchBlogList();
    if (result.ok) {
      setItems(result.data.items);
      setTruncated(result.data.truncated);
      setError(null);
      setStatus("ready");
    } else {
      setError(result.error.message);
      setStatus((s) => (s === "ready" ? "ready" : "error"));
    }
  }, []);

  useEffect(() => {
    let alive = true;
    void fetchBlogList().then((result) => {
      if (!alive) return;
      if (result.ok) {
        setItems(result.data.items);
        setTruncated(result.data.truncated);
        setStatus("ready");
      } else {
        setError(result.error.message);
        setStatus("error");
      }
    });
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const notify = useCallback((text: string, tone: "ok" | "error" = "ok") => {
    setToast({ text, tone });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  const upsert = useCallback((post: BlogSummary) => {
    const next = summary(post);
    setItems((list) => [next, ...list.filter((b) => b.id !== next.id)]);
  }, []);

  const drop = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setItems((list) => list.filter((b) => !set.has(b.id)));
  }, []);

  const value = useMemo(() => ({ items, status, error, truncated, reload, upsert, drop, toast, notify }), [items, status, error, truncated, reload, upsert, drop, toast, notify]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[90] flex justify-center px-4">
        {toast && <p className={`admin-pop max-w-lg rounded-lg px-4 py-2.5 text-center text-sm shadow-lg ${toast.tone === "error" ? "bg-[#7a1f2b] text-white" : "bg-[#240C0E] text-[#F8F5F0]"}`}>{toast.text}</p>}
      </div>
    </Ctx.Provider>
  );
}
