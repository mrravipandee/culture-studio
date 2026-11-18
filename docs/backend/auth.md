# Admin authentication & backend foundation

How admin sign-in, sessions, rate limits, the admin account and MongoDB indexes work, and
how to operate them safely. Code paths are relative to the project root.

## Overview

| Concern | Where | Notes |
|---|---|---|
| MongoDB connection | `lib/db/mongoose.ts` | One cached connection per process; `MONGODB_MAX_POOL_SIZE` (default 10); 503 on failure |
| Models | `lib/db/models/*` (registry: `index.ts`) | `admins`, `admin_login_activity`, `admin_sessions`, `rate_limits` |
| Errors → HTTP | `lib/server/errors.ts`, `lib/server/http.ts` | Typed errors, one response envelope, no driver messages |
| Validation | `lib/validation/*` (Zod) | Shared by Route Handlers (authoritative) and forms |
| Cookie session | `lib/auth/session.ts` | iron-session, HttpOnly, Secure in production, SameSite=Lax, `__Host-` prefix |
| Server sessions | `lib/auth/sessions.ts` | `admin_sessions`, token hash only |
| Guards | `lib/auth/require-admin.ts`, `proxy.ts` | Proxy: cheap seal check. Pages/APIs: MongoDB check |
| Rate limits | `lib/auth/rate-limit.ts` | MongoDB, atomic, shared across instances |
| Admin account ops | `scripts/admin-account.mjs` | Bootstrap, recovery, revoke sessions |
| Indexes | `scripts/db-indexes.mjs` | Explicit, check-then-apply, never drops |

Every module that touches the database, sessions or secrets starts with `import "server-only"`;
Next.js fails the build if a client component imports one.

## API response format

Every JSON route returns `{ success: true, data }` or
`{ success: false, error: { code, message, fields? } }` (`lib/api/response.ts`).
`message` is always safe to show a user.

| Error class | Status | Typical code |
|---|---|---|
| `BadRequestError` | 400 / 413 / 415 | `INVALID_JSON`, `INVALID_QUERY`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE` |
| `ValidationError` | 422 | `VALIDATION_ERROR`, `INVALID_CURRENT_PASSWORD`, `PASSWORD_REQUIRED`, `PASSWORD_REUSED` |
| `UnauthorizedError` | 401 | `UNAUTHENTICATED`, `INVALID_CREDENTIALS` |
| `ForbiddenError` | 403 | `FORBIDDEN` (cross-site request) |
| `NotFoundError` | 404 | `NOT_FOUND`, `ADMIN_NOT_FOUND` |
| `ConflictError` | 409 | `CONFLICT`, `EMAIL_IN_USE` |
| `RateLimitError` | 429 (+ `Retry-After`) | `RATE_LIMITED` |
| `DatabaseUnavailableError` | 503 | `DATABASE_UNAVAILABLE` |
| `ConfigurationError` | 500 | `NOT_CONFIGURED` |

Wrap handlers with `apiHandler(...)`; mutations call `readJsonMutation(request)` (same-origin,
JSON, size cap). Unknown errors become a generic 500 and are logged by error name only.

## Sessions

1. **Sign-in** (`POST /api/admin/login`) creates a random 256-bit token. MongoDB stores only its
   SHA-256 hash in `admin_sessions` with `expiresAt = sign-in + 8h`. The token is sealed into
   the cookie with `adminId`, `sessionVersion`, `issuedAt` and `loginId`.
2. **Every protected page/API** requires: the cookie unseals, the session record for the token's
   hash is not revoked and not expired, and the admin exists with the same `sessionVersion`.
3. **Logout** revokes the session record, then clears the cookie. A copied cookie stops working
   immediately. (If MongoDB is down at that moment the cookie is still cleared and the record
   expires on its own; the response says `revoked: false`.)
4. **Password change** revokes every session of the admin and gives the current browser a fresh
   token with the **same** 8-hour deadline (lifetime is absolute, never extended).
5. Expired records are removed by a TTL index; queries also check `expiresAt`.

Cookies issued before server-side sessions existed have no token and are rejected: after deploying
this change the admin signs in once more.

## Rate limits

Fixed 15-minute windows, counted atomically in `rate_limits` (one `findOneAndUpdate` pipeline
upsert per failure), shared by every server instance:

| Bucket | Limit | Counts | Notes |
|---|---|---|---|
| `login:ip:<sha256>` | 5 | failed sign-ins from one IP | Only when the IP is trusted (Vercel, or `TRUST_PROXY_HEADERS=true`) |
| `login:account:<adminId>` | 20 | wrong passwords for the real admin email | Unknown emails never count |
| `password-check:<adminId>` | 5 | wrong current password in Settings | Signed-in only |

A successful sign-in clears that IP's and the account's buckets. The old instance-wide lockout
(30 failures from anyone locked everyone out) was removed.

**Residual risk:** someone who knows the admin email could keep sign-in locked by failing 20 times
every 15 minutes. If that happens: `npm run admin:account -- clear-rate-limits --confirm`, and
consider changing the admin email in Settings. Raw IPs are never stored in `rate_limits` (hashed).

## Admin account: bootstrap & recovery

The running app **never creates or resets the admin**. (Previously, an empty `admins` collection
was silently re-created from `.env` on the next sign-in, restoring the old password.)

```bash
npm run admin:account -- status                         # read-only
npm run admin:account -- bootstrap --confirm            # first admin only (refuses if one exists)
npm run admin:account -- reset-password --confirm       # lost password: hidden prompt, revokes sessions
npm run admin:account -- revoke-sessions --confirm      # sign out everywhere
npm run admin:account -- clear-rate-limits --confirm    # unlock after a lockout
```

- `bootstrap` reads `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` (`npm run admin:hash`), refuses if an admin
  exists, and refuses again (unless `--recreate`) if an admin was bootstrapped before and later
  deleted. It never overwrites a password hash.
- **Recovery** (forgotten password): someone with database access runs `reset-password --confirm`
  on a trusted machine. It hashes the new password with Argon2id, bumps `sessionVersion` and
  revokes every session. Nothing is printed or written to `.env`.
- Once the admin exists, `ADMIN_PASSWORD_HASH` can be removed from every environment.

## Indexes

Indexes are defined on the Mongoose models and managed explicitly:

```bash
npm run db:indexes             # check (no changes)
npm run db:indexes -- --apply  # create missing indexes only
```

- Never drops or rebuilds. Conflicts (same keys, different options) and extra indexes are
  reported for a human to handle; exit code 2 means "review needed".
- Production does not build indexes at request time (`autoIndex` is off in production); run
  `--apply` once after deploying a change that adds indexes (this release adds `admin_sessions`
  and `rate_limits`). Development builds them automatically.
- Requires Node.js ≥ 22.6 (type stripping is used to read the TypeScript models).

## Testing

```bash
npm run dev
npm run admin:test-auth                    # safe checks (any database)
npm run admin:test-auth -- --destructive   # dev database ONLY (name must contain dev/test/staging/local)
```

Destructive mode changes and restores the admin's name, email and password, verifies session
revocation and trips the rate limits (clear them afterwards). Never run it against production;
the script refuses unless the database name looks like a development database.

A safe way to get a development database: point `MONGODB_URI` at e.g. `/culture_dev`, then
`npm run admin:hash` (a test password) and `npm run admin:account -- bootstrap --confirm`.
