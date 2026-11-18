/**
 * Shared validation primitives (Zod). Client-safe: used by Route Handlers (authoritative)
 * and by forms for instant feedback. The server never trusts client-side validation.
 *
 * normalizeEmail / emailSchema are the ONE place emails are normalised (trim + lowercase).
 */

import { z } from "zod";

import { EMAIL_MAX, EMAIL_PATTERN, normalizeEmail } from "./email";

export { EMAIL_MAX, EMAIL_PATTERN, normalizeEmail };
export { isValidEmail } from "./email";

/** Normalised email (trimmed, lowercased) that passes the address check. */
export const emailSchema = (messages: { required?: string; invalid?: string } = {}) => {
  const required = messages.required ?? "Enter your email address.";
  const invalid = messages.invalid ?? "Enter a valid email address, e.g. name@studioculture.in.";
  return z
    .string({ error: required })
    .transform(normalizeEmail)
    .pipe(
      z
        .string()
        .min(1, required)
        .max(EMAIL_MAX, invalid)
        .regex(EMAIL_PATTERN, invalid)
        .refine((v) => !v.includes(".."), invalid),
    );
};


/** 24-char hex MongoDB ObjectId. */
export const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/, "Invalid id.");

export const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export type FieldErrors = Record<string, string>;
export type ParseResult<T> = { ok: true; data: T } | { ok: false; fields: FieldErrors };

/**
 * Runs a schema and flattens issues to { field: firstMessage }. Root-level issues
 * (wrong body type, unknown keys) are reported under "form".
 */
export function parseWith<S extends z.ZodType>(schema: S, input: unknown): ParseResult<z.output<S>> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const fields: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.code === "unrecognized_keys" ? "form" : typeof issue.path[0] === "string" ? issue.path[0] : "form";
    if (!fields[key]) fields[key] = issue.code === "unrecognized_keys" ? "The request contains fields that can't be changed." : issue.message;
  }
  return { ok: false, fields };
}
