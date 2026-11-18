import { after, type NextRequest } from "next/server";
import { Types } from "mongoose";
import { findAdminCredentials } from "@/lib/auth/admin-store";
import { checkCredentials } from "@/lib/auth/credentials";
import { recordLoginActivity } from "@/lib/auth/login-log";
import { RATE_LIMITS, rateLimitKeys, rateLimitRetryAfter, recordRateLimitFailure, resetRateLimit } from "@/lib/auth/rate-limit";
import { trustedClientIp, trustedLocation } from "@/lib/auth/request";
import { SESSION_TTL_SECONDS, getAdminSession } from "@/lib/auth/session";
import { createSession, newSessionToken } from "@/lib/auth/sessions";
import { BadRequestError, RateLimitError, UnauthorizedError } from "@/lib/server/errors";
import { apiHandler, apiOk, readJsonMutation } from "@/lib/server/http";
import { parseWith } from "@/lib/validation/common";
import { loginSchema } from "@/lib/validation/auth";

const GENERIC_ERROR = "Invalid email or password.";
const TOO_MANY = "Too many sign-in attempts. Please try again later.";

/**
 * POST /api/admin/login — single-admin sign-in against the `admins` collection.
 *
 * 200 { success, data: { redirect } } · 400 invalid body · 401 generic failure ·
 * 403 cross-site · 413 too large · 415 not JSON · 429 rate limited · 500 not configured ·
 * 503 database unavailable.
 *
 * On success a server-side session (admin_sessions, token hash only) is created and its
 * random token sealed into the HTTP-only cookie together with adminId/sessionVersion.
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await readJsonMutation(request, 2048);
  const parsed = parseWith(loginSchema, body);
  if (!parsed.ok) throw new BadRequestError("VALIDATION_ERROR", "Enter a valid email address and password.");
  const { email, password } = parsed.data;

  // Per-IP bucket only when the IP comes from a trusted proxy header.
  const ip = trustedClientIp(request);
  const ipKey = ip ? rateLimitKeys.loginIp(ip) : null;
  if (ipKey) {
    const wait = await rateLimitRetryAfter(ipKey, RATE_LIMITS.loginIp);
    if (wait > 0) throw new RateLimitError(wait, TOO_MANY);
  }

  const admin = await findAdminCredentials();
  const adminId = admin ? admin._id.toString() : null;
  if (!admin) console.warn("[admin-auth] Sign-in attempted but no admin account exists. See docs/backend/auth.md (bootstrap).");
  const accountKey = adminId ? rateLimitKeys.loginAccount(adminId) : null;
  if (accountKey) {
    const wait = await rateLimitRetryAfter(accountKey, RATE_LIMITS.loginAccount);
    if (wait > 0) throw new RateLimitError(wait, TOO_MANY);
  }

  const result = await checkCredentials(admin, email, password);
  const context = { userAgent: request.headers.get("user-agent") ?? "", ipAddress: ip, location: trustedLocation(request) };

  if (!result.ok) {
    await Promise.all([
      ipKey ? recordRateLimitFailure(ipKey, RATE_LIMITS.loginIp) : null,
      // Only wrong passwords for the real admin email count against the account.
      accountKey && result.emailMatched ? recordRateLimitFailure(accountKey, RATE_LIMITS.loginAccount) : null,
    ]);
    if (adminId && result.emailMatched) after(() => recordLoginActivity({ adminId, status: "FAILED", ...context }));
    throw new UnauthorizedError(GENERIC_ERROR, "INVALID_CREDENTIALS");
  }

  // Success (admin is non-null here).
  const id = adminId as string;
  await Promise.all([ipKey ? resetRateLimit(ipKey) : null, accountKey ? resetRateLimit(accountKey) : null]);

  const loginId = new Types.ObjectId();
  const token = newSessionToken();
  const issuedAt = Date.now();
  await createSession({ adminId: id, token, loginId, issuedAt, ttlSeconds: SESSION_TTL_SECONDS });

  const session = await getAdminSession();
  session.adminId = id;
  session.sessionVersion = admin!.sessionVersion;
  session.issuedAt = issuedAt;
  session.loginId = loginId.toString();
  session.sid = token;
  await session.save();

  // Record the sign-in after the response is sent (never delays or blocks login).
  after(() => recordLoginActivity({ id: loginId, adminId: id, status: "SUCCESS", ...context }));

  return apiOk({ redirect: "/admin/dashboard" });
}, "admin-auth");
