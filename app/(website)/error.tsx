"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Error boundary for the website route group. */
export default function WebsiteError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container-content flex min-h-svh flex-col justify-center py-24">
      <p className="font-mono text-xs uppercase tracking-eyebrow text-brand-burgundy">
        Something went wrong
      </p>
      <h1 className="mt-6 max-w-2xl text-4xl leading-tight text-black sm:text-5xl">
        This page didn&apos;t load as expected.
      </h1>
      <p className="mt-4 max-w-md text-ink-2">
        Please try again. If the problem continues, return to the homepage.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => retry()}
          className="min-h-12 rounded-full bg-black px-7 text-xs uppercase tracking-eyebrow text-white transition-colors hover:bg-brand-burgundy"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-full border border-black px-7 text-xs uppercase tracking-eyebrow text-black transition-colors hover:bg-black hover:text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
