import "server-only";

import { RATE_LIMITS, rateLimitKeys, rateLimitRetryAfter, recordRateLimitFailure } from "@/lib/auth/rate-limit";
import { RateLimitError } from "@/lib/server/errors";

/** Per-admin limit on subscriber writes (abuse / runaway-script guard). Every write counts. */
export async function assertSubscriberWriteAllowed(adminId: string) {
  const key = rateLimitKeys.subscriberWrite(adminId);
  const wait = await rateLimitRetryAfter(key, RATE_LIMITS.subscriberWrite);
  if (wait > 0) throw new RateLimitError(wait, "Too many changes in a short time. Please wait a moment and try again.");
  await recordRateLimitFailure(key, RATE_LIMITS.subscriberWrite);
}
