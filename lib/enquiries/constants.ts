/**
 * Enquiry limits and helpers without Zod (safe for the public form bundle).
 * lib/validation/enquiry.ts builds the authoritative Zod schemas from these.
 */

export const NOT_SURE = "not-sure" as const;

export const NAME_MAX = 120;
export const COMPANY_MAX = 160;
export const WEBSITE_MAX = 300;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 5000;
/** Body size cap for POST /api/enquiries (bytes). */
export const ENQUIRY_BODY_MAX = 16 * 1024;

/** "company.com" or "https://company.com/path" → "https://company.com/path"; empty → undefined; invalid → null. */
export function normalizeWebsite(raw: string): string | undefined | null {
  const v = raw.trim();
  if (!v) return undefined;
  if (v.length > WEBSITE_MAX || /\s/.test(v)) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withScheme);
    if (!/^https?:$/.test(url.protocol) || !/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname)) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}
