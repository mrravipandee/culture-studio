"use client";

import { useSyncExternalStore } from "react";

/** Used during prerender; the browser swaps in the live year after hydration. */
const BUILD_YEAR = 2026;
const subscribe = () => () => {};

/**
 * Copyright year without reading the clock during prerender
 * (cacheComponents forbids `new Date()` there).
 */
export default function CurrentYear() {
  const year = useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => BUILD_YEAR);
  return <>{year}</>;
}
