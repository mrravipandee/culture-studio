import "server-only";

/**
 * Re-authentication with the current password (email change, password change). SERVER-ONLY.
 * Rate limited per admin (lib/auth/rate-limit.ts) so a hijacked session can't brute-force it.
 */

import { findPasswordHash } from "./admin-store";
import { verifyPassword } from "./password";
import { RATE_LIMITS, rateLimitKeys, rateLimitRetryAfter, recordRateLimitFailure, resetRateLimit } from "./rate-limit";
import { NotFoundError, RateLimitError, ValidationError } from "@/lib/server/errors";

/** Verifies the admin's current password and returns the stored hash; throws a typed AppError otherwise. */
export async function assertCurrentPassword(adminId: string, password: string): Promise<string> {
  const key = rateLimitKeys.passwordCheck(adminId);
  const wait = await rateLimitRetryAfter(key, RATE_LIMITS.passwordCheck);
  if (wait > 0) throw new RateLimitError(wait, "Too many incorrect password attempts. Please wait 15 minutes and try again.");

  const hash = await findPasswordHash(adminId);
  if (!hash) throw new NotFoundError("Your admin account could not be found.", "ADMIN_NOT_FOUND");

  if (!(await verifyPassword(hash, password))) {
    await recordRateLimitFailure(key, RATE_LIMITS.passwordCheck);
    throw new ValidationError({ currentPassword: "Current password is incorrect." }, "Your current password is incorrect.", "INVALID_CURRENT_PASSWORD");
  }
  await resetRateLimit(key);
  return hash;
}
