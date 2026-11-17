/**
 * Login rate limiting (in memory). SERVER-ONLY.
 *
 * - Per client IP: 5 failed attempts in 15 minutes locks that IP for 15 minutes.
 * - Per server instance: 30 failed attempts in 15 minutes locks login for everyone on
 *   that instance for 15 minutes (slows distributed guessing).
 *
 * Limitation: memory is per serverless instance on Vercel, so an attacker spread across
 * many cold instances gets more attempts. For a hard global limit, move these counters to
 * a shared store (e.g. Upstash Redis or MongoDB) behind the same functions.
 */

const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_GLOBAL = 30;
const MAX_TRACKED_IPS = 5000;

interface Counter {
  failures: number;
  windowStart: number;
  lockedUntil: number;
}

const byIp = new Map<string, Counter>();
const global: Counter = { failures: 0, windowStart: 0, lockedUntil: 0 };

function fresh(counter: Counter, now: number) {
  if (now - counter.windowStart > WINDOW_MS) {
    counter.failures = 0;
    counter.windowStart = now;
  }
}

function prune(now: number) {
  if (byIp.size < MAX_TRACKED_IPS) return;
  for (const [ip, c] of byIp) {
    if (c.lockedUntil < now && now - c.windowStart > WINDOW_MS) byIp.delete(ip);
  }
}

/** Seconds until this IP may try again, or 0 when allowed. */
export function loginRetryAfter(ip: string, now = Date.now()): number {
  const locked = Math.max(byIp.get(ip)?.lockedUntil ?? 0, global.lockedUntil);
  return locked > now ? Math.ceil((locked - now) / 1000) : 0;
}

export function recordLoginFailure(ip: string, now = Date.now()) {
  prune(now);
  const counter = byIp.get(ip) ?? { failures: 0, windowStart: now, lockedUntil: 0 };
  fresh(counter, now);
  counter.failures += 1;
  if (counter.failures >= MAX_PER_IP) counter.lockedUntil = now + LOCK_MS;
  byIp.set(ip, counter);

  fresh(global, now);
  global.failures += 1;
  if (global.failures >= MAX_GLOBAL) global.lockedUntil = now + LOCK_MS;
}

export function recordLoginSuccess(ip: string) {
  byIp.delete(ip);
}
