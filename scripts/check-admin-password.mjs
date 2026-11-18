#!/usr/bin/env node
/**
 * Checks a password against ADMIN_PASSWORD_HASH in .env (the BOOTSTRAP value).
 *
 * Note: the running app signs in against MongoDB, not .env. This only tells you whether a
 * password matches the hash that `npm run admin:account -- bootstrap` would use; to check
 * the live account, sign in. To recover a lost password: npm run admin:account -- reset-password --confirm
 *
 *   npm run admin:check
 *
 * Loads .env the same way Next.js does, asks for the password at a hidden prompt and
 * prints MATCH or NO MATCH. Never prints the password or the hash.
 */
import nextEnv from "@next/env";
import { verify } from "@node-rs/argon2";
import { hiddenPrompt } from "./lib/hidden-prompt.mjs";

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const hash = (process.env.ADMIN_PASSWORD_HASH ?? "").trim();
const email = process.env.ADMIN_EMAIL ?? "(missing)";

if (!hash.startsWith("$argon2id$")) {
  console.error("ADMIN_PASSWORD_HASH is not an Argon2id hash as Next.js reads it. Run: npm run admin:hash -- --write");
  process.exit(1);
}

const password = await hiddenPrompt(`Password for ${email} (hidden): `);
const ok = await verify(hash, password).catch(() => false);
console.log(ok ? "MATCH: this password will sign in." : "NO MATCH: run `npm run admin:hash -- --write` and set the password again (type it, then restart npm run dev).");
process.exit(ok ? 0 : 1);
