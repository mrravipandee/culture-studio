/**
 * Email primitives without Zod (safe for public client bundles). lib/validation/common.ts
 * builds the Zod schema from these, so there is one definition.
 */

export const EMAIL_MAX = 254;

/** Practical address check: local@domain.tld, no spaces. */
export const EMAIL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i;

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

/** Same rule as the Zod emailSchema: normalised, ≤254 chars, pattern, no consecutive dots. */
export function isValidEmail(value: string) {
  const v = normalizeEmail(value);
  return v.length > 0 && v.length <= EMAIL_MAX && EMAIL_PATTERN.test(v) && !v.includes("..");
}
