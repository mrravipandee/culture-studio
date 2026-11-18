"use client";

import { RotateCcw } from "lucide-react";

/**
 * Admin error boundary. Shown when a protected page can't load (most often because the
 * database is unreachable while checking the session). Never shows technical details.
 */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-xl place-items-center px-6 py-16 text-center">
      <div>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-burgundy">Admin</p>
        <h1 className="mt-3 text-2xl font-semibold text-[#1a0a0c]">This page couldn&rsquo;t load</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">The admin service may be briefly unavailable (for example, the database couldn&rsquo;t be reached). Please try again in a moment.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#5a0c14] px-5 text-sm font-medium text-white hover:bg-[#6b111b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
        >
          <RotateCcw aria-hidden="true" size={16} /> Try again
        </button>
      </div>
    </main>
  );
}
