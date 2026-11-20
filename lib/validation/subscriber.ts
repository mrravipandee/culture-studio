/**
 * Newsletter subscriber schemas (Zod). Client-safe.
 *
 * Public sign-up (POST /api/subscribers) and admin routes (/api/admin/subscribers) validate
 * with these; every object is strict, so unknown fields are rejected. Emails go through the
 * shared emailSchema (trim + lowercase), which is what makes the unique index catch
 * duplicates like " Name@Example.com " vs "name@example.com".
 */

import { z } from "zod";
import { CONTROL_CHARS, emailSchema, objectIdSchema } from "./common";

export const SUBSCRIBER_STATUSES = ["ACTIVE", "UNSUBSCRIBED"] as const;
export const SUBSCRIBER_SOURCES = ["WEBSITE", "BLOG", "CASE_STUDY", "MANUAL"] as const;
/** Sources a public form may report (MANUAL is admin-only). */
export const PUBLIC_SUBSCRIBER_SOURCES = ["WEBSITE", "BLOG", "CASE_STUDY"] as const;

export const SUBSCRIBER_NAME_MAX = 80;
export const SUBSCRIBE_BODY_MAX = 1024;
export const SUBSCRIBER_BULK_MAX = 500;
/** The admin list is loaded in one request; more than this is reported as truncated. */
export const SUBSCRIBER_LIST_MAX = 10_000;

const nameSchema = z
  .string()
  .refine((v) => !CONTROL_CHARS.test(v), "The name contains characters that aren't allowed.")
  .transform((v) => v.replace(/\s+/g, " ").trim())
  .pipe(z.string().max(SUBSCRIBER_NAME_MAX, `Keep the name under ${SUBSCRIBER_NAME_MAX} characters.`))
  .optional()
  .transform((v) => v || undefined);

const subscriberEmail = emailSchema({ required: "Please enter your email address.", invalid: "Please enter a valid email address, for example name@company.com." });

/** Public newsletter sign-up. */
export const subscribeSchema = z.strictObject({
  email: subscriberEmail,
  source: z.enum(PUBLIC_SUBSCRIBER_SOURCES, { error: "Invalid form source." }),
  /** Honeypot: hidden from people; anything typed here marks the request as spam. */
  company_url: z.string().max(500).optional(),
  /** Milliseconds between the form appearing and submit (bots are near-instant). */
  elapsedMs: z.number().int().nonnegative().max(86_400_000).optional(),
});
export type SubscribeInput = z.output<typeof subscribeSchema>;

export const MIN_HUMAN_MS = 1500;
export const isLikelySpamSignup = (s: Pick<SubscribeInput, "company_url" | "elapsedMs">) => Boolean(s.company_url?.trim()) || (s.elapsedMs !== undefined && s.elapsedMs < MIN_HUMAN_MS);

/* Admin ------------------------------------------------------------------------------------ */

export const subscriberIdSchema = objectIdSchema;

export const adminAddSubscriberSchema = z.strictObject({
  email: subscriberEmail,
  name: nameSchema,
  source: z.enum(SUBSCRIBER_SOURCES, { error: "Choose a source from the list." }),
  status: z.enum(SUBSCRIBER_STATUSES, { error: "Choose a status." }),
});
export type AdminAddSubscriberInput = z.output<typeof adminAddSubscriberSchema>;

export const subscriberStatusUpdateSchema = z.strictObject({
  status: z.enum(SUBSCRIBER_STATUSES, { error: "Choose a valid status." }),
});

export const subscriberBulkSchema = z.strictObject({
  action: z.enum(["unsubscribe", "delete"], { error: "Choose a valid action." }),
  ids: z
    .array(subscriberIdSchema)
    .min(1, "Select at least one subscriber.")
    .max(SUBSCRIBER_BULK_MAX, `Select at most ${SUBSCRIBER_BULK_MAX} subscribers at a time.`)
    .refine((ids) => new Set(ids).size === ids.length, "Each subscriber can only be selected once."),
});
export type SubscriberBulkInput = z.output<typeof subscriberBulkSchema>;
