#!/usr/bin/env node
/**
 * End-to-end checks for admin auth + Settings against a running server
 * (default http://localhost:3000). Exit code 1 if any check fails.
 *
 *   npm run dev                                  # terminal 1
 *   npm run admin:test-auth                      # terminal 2: safe checks only
 *   npm run admin:test-auth -- --destructive     # + password/email change + rate limits
 *
 * SAFE mode never changes data except: one sign-in session (revoked again by logout) and
 * login-activity records.
 *
 * DESTRUCTIVE mode changes the admin's password and email (and restores them), and trips
 * the rate limits. It refuses to run unless the database named in MONGODB_URI looks like a
 * development database (its name contains dev / test / staging / local), so it can never
 * touch production. Afterwards run: npm run admin:account -- clear-rate-limits --confirm
 *
 * The admin email is read from AUTH_TEST_EMAIL (or ADMIN_EMAIL). The password is asked at a
 * hidden prompt; nothing is printed or stored.
 */

import { hiddenPrompt as prompt } from "./lib/hidden-prompt.mjs";

const BASE = process.env.AUTH_TEST_BASE_URL ?? "http://localhost:3000";
const EMAIL = (process.env.AUTH_TEST_EMAIL ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const DESTRUCTIVE = process.argv.includes("--destructive");
const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass: Boolean(pass), detail });

const headers = (cookie, extra = {}) => ({ "Content-Type": "application/json", Origin: BASE, ...(cookie ? { Cookie: cookie } : {}), ...extra });
const call = async (method, path, { cookie, body, extra } = {}) => {
  const r = await fetch(`${BASE}${path}`, { method, redirect: "manual", headers: headers(cookie, extra), body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body) });
  let json = null;
  try {
    json = await r.clone().json();
  } catch {}
  return { r, json };
};
const login = (email, password, extra) => call("POST", "/api/admin/login", { body: { email, password }, extra });
const cookieOf = (r) => (r.headers.get("set-cookie") ?? "").split(";")[0];
const envelope = (j) => j && typeof j.success === "boolean" && (j.success ? "data" in j : typeof j.error?.code === "string" && typeof j.error?.message === "string");

if (!EMAIL) {
  console.error("Set AUTH_TEST_EMAIL (or ADMIN_EMAIL) to the admin's sign-in email.");
  process.exit(1);
}
if (DESTRUCTIVE) {
  const db = (process.env.MONGODB_URI ?? "").split("?")[0].split("/").pop() ?? "";
  if (!/(dev|test|staging|local)/i.test(db)) {
    console.error(`Refusing --destructive: database "${db || "(unknown)"}" doesn't look like a development database.`);
    process.exit(1);
  }
}
const password = await prompt(`Password for the admin account (hidden): `);
if (DESTRUCTIVE && (password.length < 8 || password.length > 128 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password))) {
  // The test restores this password at the end; the server would reject it, leaving the temporary one.
  console.error("Refusing --destructive: the current password doesn't meet the password rules, so it couldn't be restored afterwards.");
  process.exit(1);
}

// 1. Signed-out protection
for (const path of ["/admin/dashboard", "/admin/enquiries", "/admin/settings", "/admin/blogs/new", "/admin"]) {
  const r = await fetch(`${BASE}${path}`, { redirect: "manual" });
  check(`signed out: ${path} redirects to /admin/login`, [307, 308].includes(r.status) && r.headers.get("location")?.endsWith("/admin/login"), `${r.status}`);
}
for (const path of ["/api/admin/settings/profile", "/api/admin/settings/login-activity", "/api/admin/anything"]) {
  const { r, json } = await call("GET", path);
  check(`signed out: GET ${path} → 401 envelope`, r.status === 401 && envelope(json) && json.error.code === "UNAUTHENTICATED", `${r.status}`);
}

// 2. Request validation and CSRF (all in the shared envelope)
{
  const { r, json } = await call("POST", "/api/admin/login", { body: { email: EMAIL, password }, extra: { Origin: "https://evil.example" } });
  check("login: cross-site Origin → 403 FORBIDDEN", r.status === 403 && json?.error?.code === "FORBIDDEN", `${r.status}`);
}
{
  const r = await fetch(`${BASE}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: BASE }, body: "email=a&password=b" });
  check("login: non-JSON → 415", r.status === 415, `${r.status}`);
}
{
  const { r, json } = await call("POST", "/api/admin/login", { body: "{bad json" });
  check("login: malformed JSON → 400 INVALID_JSON", r.status === 400 && json?.error?.code === "INVALID_JSON", `${r.status}`);
}
{
  const { r, json } = await call("POST", "/api/admin/login", { body: { email: "x".repeat(300) + "@a.co", password: "x" } });
  check("login: invalid email → 400 envelope", r.status === 400 && envelope(json), `${r.status}`);
}

// 3. Invalid credentials: identical generic answer
{
  const a = await login(EMAIL, password + "-wrong");
  const b = await login("nobody@example.com", password);
  check("wrong password → 401 INVALID_CREDENTIALS", a.r.status === 401 && a.json?.error?.code === "INVALID_CREDENTIALS", `${a.r.status}`);
  check("unknown email → identical response", b.r.status === 401 && b.json?.error?.message === a.json?.error?.message, `${b.r.status}`);
  check("no session cookie on failure", !a.r.headers.get("set-cookie") && !b.r.headers.get("set-cookie"));
}

// 4. Valid login + cookie attributes
const ok = await login(EMAIL, password);
const setCookie = ok.r.headers.get("set-cookie") ?? "";
check("valid login → 200 { success, data.redirect }", ok.r.status === 200 && ok.json?.success === true && ok.json?.data?.redirect === "/admin/dashboard", `${ok.r.status}`);
check("cookie HttpOnly + SameSite=Lax + Path=/ + expiry", /HttpOnly/i.test(setCookie) && /SameSite=Lax/i.test(setCookie) && /Path=\//i.test(setCookie) && /(Max-Age|Expires)=/i.test(setCookie));
if (BASE.startsWith("https")) check("cookie Secure + __Host- prefix", /Secure/i.test(setCookie) && setCookie.startsWith("__Host-"));
let cookie = cookieOf(ok.r);
if (!cookie) {
  console.error("Sign-in failed; cannot continue. Check the password and that the dev server is running.");
  process.exit(1);
}

// 5. Signed-in behaviour + Settings (read-only)
{
  const d = await fetch(`${BASE}/admin/dashboard`, { redirect: "manual", headers: { Cookie: cookie } });
  check("signed in: dashboard 200", d.status === 200, `${d.status}`);
  const p = await call("GET", "/api/admin/settings/profile", { cookie });
  check("profile GET → 200 with email, no secrets", p.r.status === 200 && p.json?.data?.email === EMAIL && !/passwordHash|sessionVersion|argon2/.test(JSON.stringify(p.json)), `${p.r.status}`);
  const a = await call("GET", "/api/admin/settings/login-activity?limit=5", { cookie });
  const recent = a.json?.data?.recent ?? [];
  check("activity GET → 200, ≤5 items, newest first", a.r.status === 200 && recent.length <= 5 && recent.every((x, i) => i === 0 || recent[i - 1].loggedInAt >= x.loggedInAt), `${a.r.status}`);
  check("activity hides IP / user agent", !/ipAddress|userAgent/.test(JSON.stringify(a.json)));
  const bad = await call("GET", "/api/admin/settings/login-activity?limit=999", { cookie });
  check("activity invalid limit → 400 INVALID_QUERY", bad.r.status === 400 && bad.json?.error?.code === "INVALID_QUERY", `${bad.r.status}`);
  const xs = await call("PATCH", "/api/admin/settings/profile", { cookie, body: { name: "X Y", email: EMAIL, updatedAt: p.json?.data?.updatedAt }, extra: { Origin: "https://evil.example" } });
  check("profile PATCH cross-site → 403", xs.r.status === 403, `${xs.r.status}`);
  const v = await call("PATCH", "/api/admin/settings/profile", { cookie, body: { name: "", email: "not-an-email", updatedAt: p.json?.data?.updatedAt } });
  check("profile PATCH invalid → 422 with field errors", v.r.status === 422 && v.json?.error?.fields?.name && v.json?.error?.fields?.email, `${v.r.status}`);
  const extra = await call("PATCH", "/api/admin/settings/profile", { cookie, body: { name: "X Y", email: EMAIL, updatedAt: p.json?.data?.updatedAt, passwordHash: "x" } });
  check("profile PATCH unknown field → 422", extra.r.status === 422, `${extra.r.status}`);
  const weak = await call("PATCH", "/api/admin/settings/password", { cookie, body: { currentPassword: "whatever", newPassword: "short", confirmPassword: "short" } });
  check("password PATCH weak → 422 (newPassword)", weak.r.status === 422 && weak.json?.error?.fields?.newPassword, `${weak.r.status}`);
  const mismatch = await call("PATCH", "/api/admin/settings/password", { cookie, body: { currentPassword: "whatever", newPassword: "Abcdefg1x", confirmPassword: "Abcdefg1y" } });
  check("password PATCH mismatch → 422 (confirmPassword)", mismatch.r.status === 422 && mismatch.json?.error?.fields?.confirmPassword, `${mismatch.r.status}`);
}

// 6. DESTRUCTIVE (dev database only)
if (DESTRUCTIVE) {
  const original = (await call("GET", "/api/admin/settings/profile", { cookie })).json.data;
  // Name update + restore
  const renamed = await call("PATCH", "/api/admin/settings/profile", { cookie, body: { name: "Auth Test Name", email: original.email, updatedAt: original.updatedAt } });
  check("name update → 200", renamed.r.status === 200 && renamed.json?.data?.name === "Auth Test Name", `${renamed.r.status}`);
  const stale = await call("PATCH", "/api/admin/settings/profile", { cookie, body: { name: "Stale Write", email: original.email, updatedAt: original.updatedAt } });
  check("stale updatedAt → 409 CONFLICT", stale.r.status === 409 && stale.json?.error?.code === "CONFLICT", `${stale.r.status}`);
  // Email change needs the password
  const tempEmail = `auth-test-${Date.now()}@example.test`;
  const noPw = await call("PATCH", "/api/admin/settings/profile", { cookie, body: { name: original.name, email: tempEmail, updatedAt: renamed.json.data.updatedAt } });
  check("email change without password → 422 PASSWORD_REQUIRED", noPw.r.status === 422 && noPw.json?.error?.code === "PASSWORD_REQUIRED", `${noPw.r.status}`);
  const emailed = await call("PATCH", "/api/admin/settings/profile", { cookie, body: { name: original.name, email: tempEmail, currentPassword: password, updatedAt: renamed.json.data.updatedAt } });
  check("email change with password → 200, session still valid", emailed.r.status === 200 && (await call("GET", "/api/admin/settings/profile", { cookie })).r.status === 200, `${emailed.r.status}`);
  const back = await call("PATCH", "/api/admin/settings/profile", { cookie, body: { name: original.name, email: original.email, currentPassword: password, updatedAt: emailed.json.data.updatedAt } });
  check("email + name restored", back.r.status === 200 && back.json?.data?.email === original.email && back.json?.data?.name === original.name, `${back.r.status}`);

  // Password change: second session must be revoked, this one rotated
  const other = cookieOf((await login(EMAIL, password)).r);
  const tempPassword = `Tmp${Math.random().toString(36).slice(2, 10)}A9`;
  const wrongCurrent = await call("PATCH", "/api/admin/settings/password", { cookie, body: { currentPassword: password + "x", newPassword: tempPassword, confirmPassword: tempPassword } });
  check("password change with wrong current → 422 INVALID_CURRENT_PASSWORD", wrongCurrent.r.status === 422 && wrongCurrent.json?.error?.code === "INVALID_CURRENT_PASSWORD", `${wrongCurrent.r.status}`);
  const same = await call("PATCH", "/api/admin/settings/password", { cookie, body: { currentPassword: password, newPassword: password, confirmPassword: password } });
  check("same password → 422", same.r.status === 422, `${same.r.status}`);
  const changed = await call("PATCH", "/api/admin/settings/password", { cookie, body: { currentPassword: password, newPassword: tempPassword, confirmPassword: tempPassword } });
  const rotated = cookieOf(changed.r);
  check("password change → 200, current session kept", changed.r.status === 200 && changed.json?.data?.currentSessionKept === true && !!rotated, `${changed.r.status}`);
  check("old cookie of THIS browser revoked", (await call("GET", "/api/admin/settings/profile", { cookie })).r.status === 401);
  check("other session revoked", (await call("GET", "/api/admin/settings/profile", { cookie: other })).r.status === 401);
  check("rotated cookie works", (await call("GET", "/api/admin/settings/profile", { cookie: rotated })).r.status === 200);
  check("old password rejected", (await login(EMAIL, password)).r.status === 401);
  const fresh = await login(EMAIL, tempPassword);
  check("new password accepted", fresh.r.status === 200);
  // Restore the original password
  const restore = await call("PATCH", "/api/admin/settings/password", { cookie: rotated, body: { currentPassword: tempPassword, newPassword: password, confirmPassword: password } });
  check("original password restored", restore.r.status === 200 && (await login(EMAIL, password)).r.status === 200, `${restore.r.status}`);
  cookie = cookieOf(restore.r) || cookie;

  // Rate limits: wrong current password 5× → 429 on the 6th
  let last = 0;
  for (let i = 0; i < 6; i++) last = (await call("PATCH", "/api/admin/settings/password", { cookie, body: { currentPassword: "definitely-wrong-1A", newPassword: "Another1A", confirmPassword: "Another1A" } })).r.status;
  check("password-check limit → 429 after 5 failures", last === 429);
  // Login account limit: 20 wrong passwords → 429 even with the right password
  for (let i = 0; i < 20; i++) await login(EMAIL, "definitely-wrong-1A");
  const blocked = await login(EMAIL, password);
  check("login account limit → 429 + Retry-After", blocked.r.status === 429 && !!blocked.r.headers.get("retry-after"), `${blocked.r.status}`);
  console.log("\nRate limits are now tripped. Clear them with: npm run admin:account -- clear-rate-limits --confirm");
}

// 7. Logout revokes the session server-side
{
  const copy = cookie;
  const x = await call("POST", "/api/admin/logout", { cookie, extra: { Origin: "https://evil.example" } });
  check("cross-site logout → 403", x.r.status === 403, `${x.r.status}`);
  const out = await call("POST", "/api/admin/logout", { cookie });
  check("logout → 200, revoked, cookie cleared", out.r.status === 200 && out.json?.data?.revoked === true && /(Max-Age=0|Expires=Thu, 01 Jan 1970)/i.test(out.r.headers.get("set-cookie") ?? ""), `${out.r.status}`);
  const replay = await call("GET", "/api/admin/settings/profile", { cookie: copy });
  check("copied pre-logout cookie → 401 (revoked)", replay.r.status === 401, `${replay.r.status}`);
}

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} passed${DESTRUCTIVE ? " (destructive mode)" : ""}`);
process.exit(failed ? 1 : 0);
