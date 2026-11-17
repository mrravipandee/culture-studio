#!/usr/bin/env node
/**
 * Generates the Argon2id hash for ADMIN_PASSWORD_HASH.
 *
 *   npm run admin:hash              print the hash
 *   npm run admin:hash -- --write   also save it into .env (replaces ADMIN_PASSWORD_HASH)
 *
 * The password is typed at a hidden prompt (never passed as an argument, so it does not
 * end up in shell history) and is never written anywhere. Prints:
 *   1. the raw hash, for the Vercel dashboard (Settings → Environment Variables)
 *   2. the same hash with every $ escaped, for a local .env.local file
 *      (Next.js expands $NAME inside .env files, which would corrupt an unescaped hash)
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { hash } from "@node-rs/argon2";
import { hiddenPrompt as prompt } from "./lib/hidden-prompt.mjs";

const password = await prompt("Admin password (hidden): ");
const confirm = await prompt("Repeat password: ");

if (password !== confirm) {
  console.error("Passwords do not match.");
  process.exit(1);
}
if (password.length < 12) {
  console.error("Use at least 12 characters.");
  process.exit(1);
}

// Argon2id (algorithm 2) with OWASP-recommended parameters: 19 MiB memory, 2 iterations.
const result = await hash(password, { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 });

const envLine = "ADMIN_PASSWORD_HASH=" + result.replaceAll("$", "\\$");
console.log("\nVercel dashboard value (ADMIN_PASSWORD_HASH):\n" + result);

if (process.argv.includes("--write")) {
  const file = ".env";
  const current = existsSync(file) ? readFileSync(file, "utf8") : "";
  const lines = current.split("\n").filter((line, i, all) => !(i === all.length - 1 && line === ""));
  const index = lines.findIndex((line) => line.startsWith("ADMIN_PASSWORD_HASH="));
  if (index === -1) lines.push(envLine);
  else lines[index] = envLine;
  writeFileSync(file, lines.join("\n") + "\n", { mode: 0o600 });
  console.log("\nSaved to .env (escaped form). Restart `npm run dev` to load it.");
} else {
  console.log("\n.env line:\n" + envLine);
}
