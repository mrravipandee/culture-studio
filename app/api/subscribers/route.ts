import type { NextRequest } from "next/server";
import { RATE_LIMITS, rateLimitKeys, rateLimitRetryAfter, recordRateLimitFailure, type RateLimitPolicy } from "@/lib/auth/rate-limit";
import { trustedClientIp } from "@/lib/auth/request";
import { subscribe } from "@/lib/subscribers/repository";
import { RateLimitError, ValidationError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { SUBSCRIBE_BODY_MAX, isLikelySpamSignup, subscribeSchema } from "@/lib/validation/subscriber";

/**
 * POST /api/subscribers — public newsletter sign-up. Body: { email, source, company_url?, elapsedMs? }.
 *
 * 200 { subscribed: true } for a new address, an address already on the list and a
 * reactivated one alike, so the response never reveals whether an email was already stored.
 * One record per email (unique index + atomic upsert); repeats update that record.
 * 400 bad JSON · 403 cross-site · 413 too large · 415 not JSON · 422 invalid email ·
 * 429 rate limited · 503 database unavailable.
 * Spam (honeypot filled / implausibly fast) gets the same success response but is not stored.
 * No email is sent and no mailing-list service is involved. Emails are never logged.
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await readJsonMutation(request, SUBSCRIBE_BODY_MAX);
  const parsed = parseWith(subscribeSchema, body);
  if (!parsed.ok) throw new ValidationError(parsed.fields, "Please check your email address.");
  const input = parsed.data;

  const ip = trustedClientIp(request);
  const buckets: [string, RateLimitPolicy][] = [[rateLimitKeys.subscribeEmail(input.email), RATE_LIMITS.subscribeEmail]];
  if (ip) buckets.push([rateLimitKeys.subscribeIp(ip), RATE_LIMITS.subscribeIp]);
  const wait = Math.max(0, ...(await Promise.all(buckets.map(([key, policy]) => rateLimitRetryAfter(key, policy)))));
  if (wait > 0) throw new RateLimitError(wait, "You've tried several times in a short while. Please try again a little later.");
  await Promise.all(buckets.map(([key, policy]) => recordRateLimitFailure(key, policy)));

  if (isLikelySpamSignup(input)) {
    console.warn("[subscribers] Sign-up discarded by the spam filter.");
    return apiOk({ subscribed: true });
  }

  await subscribe(input.email, input.source);
  return apiOk({ subscribed: true });
}, "subscribers");
