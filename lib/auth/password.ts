/**
 * Password hashing. SERVER-ONLY.
 *
 * Argon2id via @node-rs/argon2 with the same parameters as scripts/hash-admin-password.mjs
 * (OWASP-recommended minimum: 19 MiB memory, 2 iterations, 1 lane). `verify` is constant
 * time with respect to the hash and never throws to callers.
 */

import { hash, verify } from "@node-rs/argon2";

const ARGON2ID = 2; // Algorithm.Argon2id (const enum; numeric value used to stay isolatedModules-safe)

export const hashPassword = (password: string) => hash(password, { algorithm: ARGON2ID, memoryCost: 19456, timeCost: 2, parallelism: 1 });

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/** $argon2id$v=19$m=…,t=…,p=…$<salt>$<hash> */
export const ARGON2ID_PATTERN = /^\$argon2id\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/;
