import "server-only";

/**
 * MongoDB connection via Mongoose. SERVER-ONLY: never import from a client component.
 *
 * - Reads MONGODB_URI (server-side env, never NEXT_PUBLIC_). The database name comes from
 *   the URI path (e.g. …/culture).
 * - One connection per server process: cached on globalThis together with the pending
 *   connect promise, so dev hot reloads, concurrent first requests and warm serverless
 *   invocations all reuse it. A failed connect clears the promise so the next call retries.
 * - Pool: MONGODB_MAX_POOL_SIZE (default 10). Small pools suit serverless, where many
 *   instances each hold their own pool against the Atlas connection limit.
 * - Indexes: built automatically in development only. In production they are managed
 *   explicitly with `npm run db:indexes` (scripts/db-indexes.mjs), never at request time.
 * - Failures surface as DatabaseUnavailableError (HTTP 503); the cause is never exposed.
 */

import mongoose from "mongoose";
import { ConfigurationError, DatabaseUnavailableError } from "@/lib/server/errors";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = globalThis as typeof globalThis & { __mongoose?: MongooseCache };
const cache: MongooseCache = globalForMongoose.__mongoose ?? { conn: null, promise: null };
globalForMongoose.__mongoose = cache;

const DEFAULT_POOL = 10;

/** MONGODB_MAX_POOL_SIZE as an integer 1–100, else the default. */
export function maxPoolSize(raw = process.env.MONGODB_MAX_POOL_SIZE): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 100 ? n : DEFAULT_POOL;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("[db] MONGODB_URI is not set.");
    throw new ConfigurationError();
  }

  cache.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: maxPoolSize(),
    maxIdleTimeMS: 60_000,
    autoIndex: process.env.NODE_ENV !== "production",
  });

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null; // allow a retry on the next request
    cache.conn = null;
    console.error(`[db] Could not connect to MongoDB (${error instanceof Error ? error.name : "error"}).`);
    throw new DatabaseUnavailableError();
  }
  return cache.conn;
}

/**
 * Runs a query after connecting; any driver error becomes DatabaseUnavailableError.
 * AppErrors thrown inside `run` pass through unchanged.
 */
export async function withDb<T>(run: () => Promise<T>): Promise<T> {
  await connectToDatabase();
  try {
    return await run();
  } catch (error) {
    if (error instanceof Error && "status" in error) throw error; // AppError
    console.error(`[db] Query failed (${error instanceof Error ? error.name : "error"}).`);
    throw new DatabaseUnavailableError();
  }
}
