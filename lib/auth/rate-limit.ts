/**
 * Attempt rate limiting (in memory). SERVER-ONLY.
 *
 * Login:
 * - Per client IP: 5 failed attempts in 15 minutes locks that IP for 15 minutes.
 * - Per server instance: 30 failed attempts in 15 minutes locks login for everyone on
 *   that instance for 15 minutes (slows distributed guessing).
 *
 * Current-password checks in Settings (password change, email change):
 * - Per admin: 5 wrong current passwords in 15 minutes locks those checks for 15 minutes,
 *   so a hijacked session can't be used to brute-force the password.
 *
 * Limitation: memory is per serverless instance on Vercel, so an attacker spread across
 * many cold instances gets more attempts. For a hard global limit, move these counters to
 * a shared store (e.g. Upstash Redis or MongoDB) behind the same functions.
 */

const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_TRACKED_KEYS = 5000;

interface Counter {
  failures: number;
  windowStart: number;
  lockedUntil: number;
}

class AttemptLimiter {
  private readonly counters = new Map<string, Counter>();
  constructor(private readonly maxFailures: number) {}

  private fresh(counter: Counter, now: number) {
    if (now - counter.windowStart > WINDOW_MS) {
      counter.failures = 0;
      counter.windowStart = now;
    }
  }

  private prune(now: number) {
    if (this.counters.size < MAX_TRACKED_KEYS) return;
    for (const [key, c] of this.counters) {
      if (c.lockedUntil < now && now - c.windowStart > WINDOW_MS) this.counters.delete(key);
    }
  }

  /** Epoch ms until which `key` is locked (0 when not locked). */
  lockedUntil(key: string) {
    return this.counters.get(key)?.lockedUntil ?? 0;
  }

  fail(key: string, now = Date.now()) {
    this.prune(now);
    const counter = this.counters.get(key) ?? { failures: 0, windowStart: now, lockedUntil: 0 };
    this.fresh(counter, now);
    counter.failures += 1;
    if (counter.failures >= this.maxFailures) counter.lockedUntil = now + LOCK_MS;
    this.counters.set(key, counter);
  }

  reset(key: string) {
    this.counters.delete(key);
  }
}

const seconds = (until: number, now: number) => (until > now ? Math.ceil((until - now) / 1000) : 0);

/* Login ------------------------------------------------------------------------------- */

const loginByIp = new AttemptLimiter(5);
const loginGlobal = new AttemptLimiter(30);
const GLOBAL = "*";

/** Seconds until this IP may try again, or 0 when allowed. */
export function loginRetryAfter(ip: string, now = Date.now()): number {
  return seconds(Math.max(loginByIp.lockedUntil(ip), loginGlobal.lockedUntil(GLOBAL)), now);
}

export function recordLoginFailure(ip: string, now = Date.now()) {
  loginByIp.fail(ip, now);
  loginGlobal.fail(GLOBAL, now);
}

export function recordLoginSuccess(ip: string) {
  loginByIp.reset(ip);
}

/* Current-password checks (Settings) --------------------------------------------------- */

const passwordChecks = new AttemptLimiter(5);

export const passwordCheckRetryAfter = (adminId: string, now = Date.now()) => seconds(passwordChecks.lockedUntil(adminId), now);
export const recordPasswordCheckFailure = (adminId: string, now = Date.now()) => passwordChecks.fail(adminId, now);
export const recordPasswordCheckSuccess = (adminId: string) => passwordChecks.reset(adminId);
