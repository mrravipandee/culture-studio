#!/usr/bin/env node
/**
 * End-to-end checks for admin auth against a running server (default http://localhost:3000).
 *
 *   npm run dev                       # in one terminal
 *   npm run admin:test-auth           # in another (loads .env)
 *
 * Prompts for the admin password at a hidden prompt; nothing is printed or stored.
 * Uses spoofed X-Forwarded-For addresses so the rate-limit test does not lock you out.
 * Exit code 1 if any check fails.
 */

import { hiddenPrompt as prompt } from "./lib/hidden-prompt.mjs";

const BASE = process.env.AUTH_TEST_BASE_URL ?? "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass, detail });

const ip = (n) => ({ "X-Forwarded-For": `203.0.113.${n}` });
const login = (body, headers = {}) =>
  fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/json", Origin: BASE, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
const get = (path, cookie) => fetch(`${BASE}${path}`, { redirect: "manual", headers: cookie ? { Cookie: cookie } : {} });

if (!ADMIN_EMAIL) {
  console.error("ADMIN_EMAIL is not set. Run with: node --env-file=.env scripts/test-admin-auth.mjs");
  process.exit(1);
}
const password = await prompt(`Password for ${ADMIN_EMAIL} (hidden): `);

// 1. Signed-out protection
for (const path of ["/admin/dashboard", "/admin/enquiries", "/admin/blogs", "/admin/blogs/new", "/admin/blogs/123/edit", "/admin"]) {
  const r = await get(path);
  check(`signed out: ${path} redirects to /admin/login`, [307, 308].includes(r.status) && r.headers.get("location")?.endsWith("/admin/login"), `${r.status} ${r.headers.get("location") ?? ""}`);
}
{
  const r = await get("/api/admin/anything");
  check("signed out: admin API returns 401", r.status === 401, String(r.status));
}
{
  const r = await get("/admin/login");
  check("login page loads (200, noindex header)", r.status === 200 && /noindex/.test(r.headers.get("x-robots-tag") ?? ""), String(r.status));
}

// 2. Request validation and CSRF
{
  const r = await login({ email: ADMIN_EMAIL, password }, { Origin: "https://evil.example", ...ip(10) });
  check("cross-site Origin rejected (403)", r.status === 403, String(r.status));
}
{
  const r = await fetch(`${BASE}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: BASE, ...ip(11) }, body: "email=a&password=b" });
  check("non-JSON body rejected (415)", r.status === 415, String(r.status));
}
{
  const r = await login("{bad json", ip(12));
  check("malformed body rejected (400)", r.status === 400, String(r.status));
}

// 3. Invalid credentials: same generic message
{
  const a = await login({ email: ADMIN_EMAIL, password: password + "-wrong" }, ip(13));
  const b = await login({ email: "nobody@example.com", password }, ip(14));
  const [ja, jb] = [await a.json(), await b.json()];
  check("wrong password → 401 generic", a.status === 401 && ja.error === "Invalid email or password.", `${a.status} ${ja.error}`);
  check("wrong email → 401 identical message", b.status === 401 && jb.error === ja.error, `${b.status} ${jb.error}`);
  check("no session cookie on failure", !a.headers.get("set-cookie") && !b.headers.get("set-cookie"));
}

// 4. Valid login + cookie attributes
const ok = await login({ email: ADMIN_EMAIL, password }, ip(20));
const okBody = await ok.json().catch(() => ({}));
const setCookie = ok.headers.get("set-cookie") ?? "";
check("valid credentials → 200 + redirect", ok.status === 200 && okBody.redirect === "/admin/dashboard", `${ok.status}`);
check("cookie is HttpOnly", /HttpOnly/i.test(setCookie));
check("cookie is SameSite=Lax", /SameSite=Lax/i.test(setCookie));
check("cookie has Path=/ and expiry", /Path=\//i.test(setCookie) && /(Max-Age|Expires)=/i.test(setCookie));
check(
  BASE.startsWith("https") ? "cookie is Secure (__Host-)" : "cookie Secure flag (only expected in production)",
  BASE.startsWith("https") ? /Secure/i.test(setCookie) && setCookie.startsWith("__Host-") : true,
);
const cookie = setCookie.split(";")[0];

// 5. Signed-in behaviour
{
  const r = await get("/admin/dashboard", cookie);
  check("signed in: dashboard 200", r.status === 200, String(r.status));
  const l = await get("/admin/login", cookie);
  check("signed in: /admin/login redirects to dashboard", [307, 308].includes(l.status) && l.headers.get("location")?.endsWith("/admin/dashboard"), `${l.status}`);
}

// 6. Logout
{
  const r = await fetch(`${BASE}/api/admin/logout`, { method: "POST", headers: { Origin: BASE, Cookie: cookie } });
  const cleared = r.headers.get("set-cookie") ?? "";
  check("logout clears the cookie", r.status === 200 && /(Max-Age=0|Expires=Thu, 01 Jan 1970)/i.test(cleared), `${r.status}`);
  const x = await fetch(`${BASE}/api/admin/logout`, { method: "POST", headers: { Origin: "https://evil.example", Cookie: cookie } });
  check("cross-site logout rejected (403)", x.status === 403, String(x.status));
  const after = await get("/admin/dashboard", cookie);
  // Stateless sealed cookies stay cryptographically valid until expiry if someone kept a copy.
  console.log(`  note: a copied pre-logout cookie returns ${after.status} (stateless session; see report)`);
}

// 7. Rate limiting (own fake IP)
{
  let last = 0;
  for (let i = 0; i < 6; i++) last = (await login({ email: ADMIN_EMAIL, password: "definitely-wrong" }, ip(99))).status;
  const blocked = await login({ email: ADMIN_EMAIL, password }, ip(99));
  check("6th attempt rate-limited (429 + Retry-After), even with the right password", last === 429 && blocked.status === 429 && !!blocked.headers.get("retry-after"), `${last}/${blocked.status}`);
}

// 8. No secrets in browser JavaScript
{
  const html = await (await get("/admin/login")).text();
  const scripts = [...html.matchAll(/src="(\/_next\/[^"]+\.js)"/g)].map((m) => m[1]);
  const secrets = [process.env.SESSION_SECRET, process.env.ADMIN_PASSWORD_HASH, "$argon2id$"].filter(Boolean);
  let leaks = 0;
  for (const src of scripts) {
    const js = await (await fetch(BASE + src)).text();
    for (const s of secrets) if (js.includes(s) || html.includes(s)) leaks++;
  }
  check(`no secrets in HTML or ${scripts.length} JS files`, leaks === 0, `${leaks} hits`);
}

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
