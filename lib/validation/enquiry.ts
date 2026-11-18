/**
 * Enquiry schemas and constants (Zod). Client-safe.
 *
 * Used by POST /api/enquiries and the admin enquiry routes (authoritative), and by the
 * public InquiryForm / admin toolbar for instant feedback and option lists.
 * Service ids are exactly the form's checkbox values: the discipline ids from
 * lib/content/disciplines.ts plus "not-sure".
 */

import { z } from "zod";
import { disciplines } from "@/lib/content/disciplines";
import type { EnquirySource, EnquiryStatus, ServiceId } from "@/lib/admin/types";
import { CONTROL_CHARS, emailSchema, objectIdSchema } from "./common";

import { COMPANY_MAX, ENQUIRY_BODY_MAX, MESSAGE_MAX, MESSAGE_MIN, NAME_MAX, NOT_SURE, WEBSITE_MAX, normalizeWebsite } from "@/lib/enquiries/constants";

export { COMPANY_MAX, ENQUIRY_BODY_MAX, MESSAGE_MAX, MESSAGE_MIN, NAME_MAX, NOT_SURE, WEBSITE_MAX, normalizeWebsite };
const serviceIds: ServiceId[] = [...disciplines.map((d) => d.id), NOT_SURE];
/** Non-empty tuple type, as z.enum requires. */
export const ENQUIRY_SERVICE_IDS = serviceIds as [ServiceId, ...ServiceId[]];
export const ENQUIRY_STATUSES = ["NEW", "READ", "REPLIED", "CLOSED"] as const satisfies readonly EnquiryStatus[];
export const ENQUIRY_SOURCES = ["CONTACT_PAGE", "HOME", "ABOUT"] as const satisfies readonly EnquirySource[];

/** Valid status changes from each state (the server enforces these; the UI only offers them). */
export const nextStatuses: Record<EnquiryStatus, EnquiryStatus[]> = {
  NEW: ["READ", "REPLIED", "CLOSED"],
  READ: ["REPLIED", "CLOSED"],
  REPLIED: ["CLOSED"],
  CLOSED: [],
};
export const canTransition = (from: EnquiryStatus, to: EnquiryStatus) => nextStatuses[from].includes(to);

/* Public submission --------------------------------------------------------------------- */

const singleLine = (label: string, max: number) =>
  z
    .string()
    .refine((v) => !CONTROL_CHARS.test(v), `${label} contains characters that aren't allowed.`)
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(z.string().max(max, `Keep ${label.toLowerCase()} under ${max} characters.`));

export const enquirySubmissionSchema = z.strictObject({
  name: singleLine("Name", NAME_MAX).pipe(z.string().min(2, "Please enter your name.")),
  email: emailSchema({ required: "Please enter your email address.", invalid: "Please enter a valid email address, for example name@company.com." }),
  company: singleLine("Company", COMPANY_MAX).optional().transform((v) => v || undefined),
  website: z
    .string()
    .optional()
    .transform((v, ctx) => {
      const out = normalizeWebsite(v ?? "");
      if (out === null) {
        ctx.addIssue({ code: "custom", message: "Please enter a valid website, for example company.com." });
        return z.NEVER;
      }
      return out;
    }),
  services: z
    .array(z.enum(ENQUIRY_SERVICE_IDS, { error: "Choose services from the list." }), { error: "Choose at least one service, or select “Not sure yet”." })
    .min(1, "Choose at least one service, or select “Not sure yet”.")
    .max(ENQUIRY_SERVICE_IDS.length, "Choose services from the list.")
    .refine((list) => new Set(list).size === list.length, "Each service can only be chosen once.")
    .refine((list) => !(list.includes(NOT_SURE) && list.length > 1), "Choose specific services or “Not sure yet”, not both."),
  message: z
    .string({ error: "Please tell us what you're looking to achieve." })
    .transform((v) => v.replace(/\r\n?/g, "\n").trim())
    .pipe(
      z
        .string()
        .min(1, "Please tell us what you're looking to achieve.")
        .min(MESSAGE_MIN, `Please add a little more detail (at least ${MESSAGE_MIN} characters).`)
        .max(MESSAGE_MAX, `Please keep your message under ${MESSAGE_MAX} characters.`),
    ),
  source: z.enum(ENQUIRY_SOURCES, { error: "Invalid form source." }),
  /** Honeypot: hidden from people; anything typed here marks the submission as spam. */
  company_url: z.string().max(500).optional(),
  /** Milliseconds between the form appearing and submit (bots are near-instant). */
  elapsedMs: z.number().int().nonnegative().max(86_400_000).optional(),
});
export type EnquirySubmission = z.output<typeof enquirySubmissionSchema>;

/** Spam signals: honeypot filled, or submitted faster than a person could type. */
export const MIN_HUMAN_MS = 2500;
export const isLikelySpam = (s: Pick<EnquirySubmission, "company_url" | "elapsedMs">) => Boolean(s.company_url?.trim()) || (s.elapsedMs !== undefined && s.elapsedMs < MIN_HUMAN_MS);

/* Admin list query ------------------------------------------------------------------------ */

export const ENQUIRY_PAGE_SIZE = 6;
export const ENQUIRY_RANGES = ["all", "today", "7d", "30d", "month"] as const;
export type EnquiryRange = (typeof ENQUIRY_RANGES)[number];
export const enquiryRangeLabels: Record<EnquiryRange, string> = {
  all: "All Time",
  today: "Today",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  month: "This Month",
};

const intParam = (min: number, max: number, fallback: number, label: string) =>
  z
    .string()
    .regex(/^\d{1,4}$/, `${label} must be a whole number.`)
    .transform(Number)
    .pipe(z.number().int().min(min, `${label} must be at least ${min}.`).max(max, `${label} must be at most ${max}.`))
    .optional()
    .transform((v) => v ?? fallback);

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date.").refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Invalid date.");

export const enquiryListQuerySchema = z
  .strictObject({
    page: intParam(1, 10_000, 1, "page"),
    pageSize: intParam(1, 50, ENQUIRY_PAGE_SIZE, "pageSize"),
    search: z.string().max(100, "Search is too long.").optional().transform((v) => v?.trim() ?? ""),
    status: z.enum(["all", ...ENQUIRY_STATUSES]).optional().transform((v) => v ?? "all"),
    service: z.enum(["all", ...ENQUIRY_SERVICE_IDS]).optional().transform((v) => v ?? "all"),
    range: z.enum(ENQUIRY_RANGES).optional().transform((v) => v ?? "all"),
    /** Explicit India-time day range (inclusive); combined with `range` it narrows further. */
    from: isoDay.optional(),
    to: isoDay.optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, { path: ["to"], message: "`to` must be on or after `from`." });
export type EnquiryListQuery = z.output<typeof enquiryListQuerySchema>;

export const enquiryIdSchema = objectIdSchema;

export const enquiryStatusUpdateSchema = z.strictObject({
  status: z.enum(ENQUIRY_STATUSES, { error: "Choose a valid status." }),
});
