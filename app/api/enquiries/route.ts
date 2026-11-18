import { randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { RATE_LIMITS, rateLimitKeys, rateLimitRetryAfter, recordRateLimitFailure, type RateLimitPolicy } from "@/lib/auth/rate-limit";
import { trustedClientIp } from "@/lib/auth/request";
import { createEnquiry } from "@/lib/enquiries/repository";
import { RateLimitError, ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { ENQUIRY_BODY_MAX, enquirySubmissionSchema, isLikelySpam } from "@/lib/validation/enquiry";

/**
 * POST /api/enquiries — public enquiry form submission.
 *
 * 201 { success, data: { received, reference } } stored · 200 same response for a duplicate
 * of a recent identical submission (stored once) · 400 bad JSON · 403 cross-site ·
 * 413 too large · 415 not JSON · 422 invalid fields (field messages) · 429 rate limited ·
 * 503 database unavailable.
 *
 * Spam (honeypot filled or submitted implausibly fast) gets the same success response but
 * is not stored, so bots learn nothing. No email is sent; nothing claims one was.
 * Message text and personal details are never logged.
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await readJsonMutation(request, ENQUIRY_BODY_MAX);
  const parsed = parseWith(enquirySubmissionSchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields, "Please check the highlighted fields.");
  const submission = parsed.data;

  // Every submission counts (spam included). Per trusted IP, and per email so the limit
  // also applies where the IP can't be trusted.
  const ip = trustedClientIp(request);
  const buckets: [string, RateLimitPolicy][] = [[rateLimitKeys.enquiryEmail(submission.email), RATE_LIMITS.enquiryEmail]];
  if (ip) buckets.push([rateLimitKeys.enquiryIp(ip), RATE_LIMITS.enquiryIp]);
  const waits = await Promise.all(buckets.map(([key, policy]) => rateLimitRetryAfter(key, policy)));
  const wait = Math.max(0, ...waits);
  if (wait > 0) throw new RateLimitError(wait, "You've sent several enquiries in a short time. Please try again a little later.");
  await Promise.all(buckets.map(([key, policy]) => recordRateLimitFailure(key, policy)));

  if (isLikelySpam(submission)) {
    console.warn("[enquiries] Submission discarded by the spam filter.");
    return apiOk({ received: true, reference: randomBytes(3).toString("hex").toUpperCase() }, { status: 201 });
  }

  const { reference, duplicate } = await createEnquiry(submission);
  return apiOk({ received: true, reference }, { status: duplicate ? 200 : 201 });
}, "enquiries");
