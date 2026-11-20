# Newsletter subscribers

Blog newsletter form → MongoDB (`subscribers`) → Admin → Subscribers and the dashboard.

## Data and duplicates

- One record per email. Emails are normalised (trim + lowercase) by `lib/validation/subscriber.ts`;
  the unique index `email_unique` enforces it. The index is ensured lazily once per server
  process and by `npm run db:indexes -- --apply`.
- Public sign-up (`lib/subscribers/repository.ts → subscribe`) is ONE atomic upsert (update
  pipeline): new email → inserted ACTIVE; known ACTIVE email → same record updated
  (`lastSubmittedAt`, `submissionCount`); UNSUBSCRIBED email → reactivated (`reactivatedAt`).
  `subscribedAt` and `source` keep their first values. Concurrent duplicates hit the unique
  index and are retried as updates.
- No email is sent and nothing is verified: `verifiedAt` is never set by the app.

## API

| Route | Who | Notes |
| --- | --- | --- |
| `POST /api/subscribers` | public | `{ email, source, company_url?, elapsedMs? }` → always `{ subscribed: true }` (no enumeration). Rate limits: 6 / 15 min per IP, 3 per email. Honeypot / too-fast submits are accepted but not stored. |
| `GET /api/admin/subscribers` | admin | all records, newest first (`truncated` beyond 10,000) |
| `POST /api/admin/subscribers` | admin | manual add; 409 `EMAIL_IN_USE` if the email exists |
| `PATCH /api/admin/subscribers/[id]` | admin | `{ status }`, idempotent |
| `DELETE /api/admin/subscribers/[id]` | admin | permanent delete |
| `POST /api/admin/subscribers/bulk` | admin | `{ action: unsubscribe \| delete, ids ≤ 500 }` |

Admin writes are same-origin, rate-limited (120 / 15 min) and recorded in `audit_logs`
(admin id, action, subscriber id, time; no email addresses).

## Tests

- `npm run test:subscribers` — validation, normalisation, spam rules, the sign-up pipeline
  (evaluated without a database), record mapping.
- `npm run test:subscribers:db` — dev database only: 10 concurrent sign-ups → 1 record,
  unique index present, unsubscribe → re-sign-up reactivates, admin duplicate → 409, delete.
