"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ArrowLeft, ArrowUp, Check, Link2, Minus, Plus } from "lucide-react";
import type { HeadingAnchor } from "@/lib/rich-text";
import { EASE } from "@/lib/motion";

/**
 * Reading mode for a published article:
 *  - progress bar across the top (article progress, not page progress)
 *  - floating reader bar: back to blog, text size, minutes left, copy link, back to top
 *  - "Contents" sidebar on wide screens with the current section highlighted
 * The text-size choice is a per-browser convenience kept in localStorage (optional).
 */

const SCALES = [0.9, 1, 1.12, 1.25] as const;
const DEFAULT_INDEX = 1;
const STORAGE_KEY = "cs-reading-scale";
const STORAGE_EVENT = "cs-reading-scale-change";

/* Text size preference: an external store (localStorage), so no setState-in-effect. */
const readScaleIndex = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null || !/^\d$/.test(raw)) return DEFAULT_INDEX; // Number(null) would be 0
    const v = Number(raw);
    return v < SCALES.length ? v : DEFAULT_INDEX;
  } catch {
    return DEFAULT_INDEX;
  }
};
const writeScaleIndex = (requested: number) => {
  const index = Math.min(SCALES.length - 1, Math.max(0, requested));
  try {
    window.localStorage.setItem(STORAGE_KEY, String(index));
  } catch {
    // storage unavailable (private mode): the size still applies until reload
  }
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: index }));
};
let memoryIndex: number | null = null;
const subscribeScale = (cb: () => void) => {
  const onCustom = (e: Event) => {
    memoryIndex = (e as CustomEvent<number>).detail;
    cb();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    memoryIndex = null; // another tab changed it: read the stored value
    cb();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(STORAGE_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STORAGE_EVENT, onCustom);
  };
};
const getScaleSnapshot = () => memoryIndex ?? readScaleIndex();

interface Props {
  children: ReactNode;
  headings: HeadingAnchor[];
  minutes: number;
  title: string;
}

export default function ReadingMode({ children, headings: allHeadings, minutes, title }: Props) {
  // Contents lists the main sections only (sub-headings would crowd the narrow column).
  const headings = useMemo(() => allHeadings.filter((h) => h.level === 2), [allHeadings]);
  const articleRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const scaleIndex = useSyncExternalStore(subscribeScale, getScaleSnapshot, () => DEFAULT_INDEX);

  // Progress through the article body (0 at its top, 1 when its end reaches the viewport bottom).
  const { scrollYProgress } = useScroll({ target: articleRef, offset: ["start 0.25", "end end"] });
  const bar = useSpring(scrollYProgress, { stiffness: 180, damping: 32, restDelta: 0.001 });
  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setProgress(Math.min(1, Math.max(0, v))));

  const left = Math.max(0, Math.ceil(minutes * (1 - progress)));
  const showBar = progress > 0.01;
  const finished = progress >= 0.98;

  /* Contents: highlight the section being read. */
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id); // highlight the target now; the observer takes over once scrolling settles
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };

  /* Copy link */
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);
  const share = useCallback(async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      // share sheet dismissed or clipboard blocked: nothing to do
    }
  }, [title]);

  const iconButton =
    "grid size-10 shrink-0 place-items-center rounded-full text-[#F8F5F0]/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-35";

  return (
    <>
      {/* Progress */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: reduce ? scrollYProgress : bar }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-[#7a1f2b]"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,48rem)_minmax(0,1fr)] xl:gap-10">
        {/* Contents (wide screens) */}
        <aside className="hidden xl:block" aria-label="Article contents">
          {headings.length > 1 && (
            <nav className="sticky top-32 ml-auto max-w-[15rem]">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-burgundy">Contents</p>
              <ol className="mt-4 space-y-1 border-l border-black/10">
                {headings.map((h) => {
                  const active = h.id === activeId;
                  return (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          jump(h.id);
                        }}
                        aria-current={active ? "location" : undefined}
                        className={`-ml-px block border-l py-1.5 pl-4 text-[0.8125rem] leading-snug transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-burgundy ${active ? "border-[#7a1f2b] font-medium text-[#5a0c14]" : "border-transparent text-ink-2 hover:text-ink"}`}
                      >
                        {h.text}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
        </aside>

        <div ref={articleRef} className="cs-reading min-w-0" style={{ "--reading-scale": SCALES[scaleIndex] } as CSSProperties}>
          {children}
        </div>
        <div className="hidden xl:block" aria-hidden="true" />
      </div>

      {/* Floating reader bar */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            role="toolbar"
            aria-label="Reading controls"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-3 sm:bottom-6"
          >
            <div className="flex items-center gap-0.5 rounded-full bg-[#240C0E]/95 p-1.5 text-[#F8F5F0] shadow-[0_18px_40px_-18px_rgba(36,12,14,0.65)] backdrop-blur-md sm:gap-1">
              <Link href="/blog" aria-label="Back to all articles" className={iconButton}>
                <ArrowLeft aria-hidden="true" size={18} />
              </Link>
              <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/15" />
              <button type="button" onClick={() => writeScaleIndex(getScaleSnapshot() - 1)} disabled={scaleIndex === 0} aria-label="Smaller text" className={iconButton}>
                <Minus aria-hidden="true" size={16} />
              </button>
              <span className="w-9 select-none text-center text-[0.8125rem] font-medium tabular-nums" aria-hidden="true">
                Aa
              </span>
              <button
                type="button"
                onClick={() => writeScaleIndex(getScaleSnapshot() + 1)}
                disabled={scaleIndex === SCALES.length - 1}
                aria-label="Larger text"
                className={iconButton}
              >
                <Plus aria-hidden="true" size={16} />
              </button>
              <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/15" />
              <p className="min-w-[4.75rem] px-1.5 text-center text-[0.8125rem] tabular-nums text-[#F8F5F0]/90" aria-live="off">
                {finished ? "Finished" : `${Math.max(1, left)} min left`}
              </p>
              <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/15" />
              <button type="button" onClick={share} aria-label={copied ? "Link copied" : "Copy link to this article"} className={iconButton}>
                {copied ? <Check aria-hidden="true" size={17} /> : <Link2 aria-hidden="true" size={17} />}
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
                aria-label="Back to top"
                className={`${iconButton} hidden min-[400px]:grid`}
              >
                <ArrowUp aria-hidden="true" size={17} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="sr-only" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </p>
    </>
  );
}
