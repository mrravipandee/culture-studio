import { after, type NextRequest } from "next/server";
import { AuthConfigError } from "@/lib/auth/config";
import { verifyAdminCredentials } from "@/lib/auth/credentials";
import { loginRetryAfter, recordLoginFailure, recordLoginSuccess } from "@/lib/auth/rate-limit";
import { clientIp, isSameOrigin, json } from "@/lib/auth/request";
import { getAdminSession } from "@/lib/auth/session";
import { recordAdminLogin } from "@/lib/auth/login-log";

const GENERIC_ERROR = "Invalid email or password.";
const MAX_BODY_BYTES = 2048;
const MAX_EMAIL = 254;
const MAX_PASSWORD = 256; // bounds Argon2 work per request
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginBody {
  email: string;
  password: string;
}

function parseBody(raw: string): LoginBody | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const { email, password } = data as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string") return null;
  if (!email.trim() || email.length > MAX_EMAIL || !EMAIL_PATTERN.test(email.trim())) return null;
  if (!password || password.length > MAX_PASSWORD) return null;
  return { email, password };
}

/**
 * POST /api/admin/login — single-admin sign-in.
 * 200 { ok, redirect } · 400 invalid body · 401 generic failure · 403 cross-site ·
 * 413 too large · 415 not JSON · 429 rate limited · 500 server not configured.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Unsupported request." }, 415);
  }

  const ip = clientIp(request);
  const retryAfter = loginRetryAfter(ip);
  if (retryAfter > 0) {
    return json({ error: "Too many sign-in attempts. Please try again later." }, 429, { "Retry-After": String(retryAfter) });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json({ error: "Request too large." }, 413);
  const body = parseBody(raw);
  if (!body) return json({ error: "Enter a valid email address and password." }, 400);

  let valid: boolean;
  try {
    valid = await verifyAdminCredentials(body.email, body.password);
  } catch (error) {
    if (error instanceof AuthConfigError) {
      // Names the variable only; never logs credentials or hashes.
      console.error(`[admin-auth] Configuration error: ${error.message}`);
      return json({ error: "Admin sign-in is not configured on the server." }, 500);
    }
    console.error("[admin-auth] Unexpected error during sign-in.");
    return json({ error: "Something went wrong. Please try again." }, 500);
  }

  if (!valid) {
    recordLoginFailure(ip);
    return json({ error: GENERIC_ERROR }, 401);
  }

  recordLoginSuccess(ip);
  const email = body.email.trim().toLowerCase();
  const session = await getAdminSession();
  session.email = email;
  session.issuedAt = Date.now();
  await session.save();

  // Log the sign-in time in MongoDB after the response is sent (never delays or blocks login).
  const userAgent = request.headers.get("user-agent") ?? "";
  after(() => recordAdminLogin({ email, ip, userAgent }));

  return json({ ok: true, redirect: "/admin/dashboard" }, 200);
}
