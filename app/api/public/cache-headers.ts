/**
 * Public read APIs: data is cached server-side with `'use cache'` (invalidated immediately
 * on unpublish), so responses are not held by browsers or CDNs: an unpublished project
 * can't linger in an intermediate cache. Overrides the API default (no-store).
 */
export const PUBLIC_CACHE_HEADERS = { "Cache-Control": "public, max-age=0, must-revalidate" } as const;
