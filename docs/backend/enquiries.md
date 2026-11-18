# Enquiries backend

Real enquiries from the website form are stored in MongoDB (`enquiries`) and managed in
Admin → Enquiries. No email is sent on submission (email integration is postponed).

## Flow

```
InquiryForm (Contact page / About page)
  → POST /api/enquiries  (same-origin JSON ≤16 KB → Zod → rate limit → spam check → dedupe → store)
Admin → Enquiries
  → GET /api/admin/enquiries, GET/PATCH/DELETE /api/admin/enquiries/[id]
Dashboard / sidebar badge / header bell
  → lib/enquiries/repository.ts (getEnquiryDashboard, countNewEnquiries)
```

## Files

| Concern | File |
|---|---|
| Model + indexes | `lib/db/models/Enquiry.ts` |
| Validation (Zod) | `lib/validation/enquiry.ts` (limits/helpers without Zod: `lib/enquiries/constants.ts`) |
| Repository | `lib/enquiries/repository.ts` (server-only) |
| Date definitions (IST) | `lib/enquiries/dates.ts` |
| Public API | `app/api/enquiries/route.ts` |
| Admin API | `app/api/admin/enquiries/route.ts`, `app/api/admin/enquiries/[id]/route.ts` |
| Admin UI | `components/admin/enquiries/*` |
| Badge / bell | `components/admin/AdminCountsContext.tsx`, `components/admin/dashboard/NewEnquiriesBell.tsx` |
| Dev seed | `scripts/seed-dev-enquiries.mjs` |

## Record

`name, email (lowercased), company?, website? (normalised to https://…), services[]`
(form values: the four discipline ids or `not-sure`), `message` (10–5000 chars),
`status` NEW|READ|REPLIED|CLOSED, `source` CONTACT_PAGE|HOME|ABOUT, `statusHistory[{from,to,at}]`,
`deletedAt` (soft delete), `dedupeKey`, `seed` (dev only), `createdAt`, `updatedAt`.
There is no phone field because the form has none.

Status changes allowed: NEW → READ/REPLIED/CLOSED, READ → REPLIED/CLOSED, REPLIED → CLOSED.
Each change is applied atomically and appended to `statusHistory`.

## Spam & abuse

- **Honeypot** `company_url` (hidden from people and assistive tech) and a **timing check**
  (submitted < 2.5 s after the form appeared). Spam gets the normal success response but is not stored.
- **Rate limits** (MongoDB, shared across instances): 5 per 15 min per trusted IP, 3 per 15 min per
  email. Every submission counts, spam included.
- **Duplicates**: same email + services + message within a 10-minute window is stored once
  (unique `dedupeKey`); the second request gets the same reference.
- Same-origin only, strict schema (unknown fields rejected), message/body size caps.
- Message text and personal details are never logged.

## Definitions (India time)

Today = since 00:00 IST. Last 7 / 30 days = today plus the previous 6 / 29 calendar days.
This month = since the 1st (IST). The dashboard chart shows the last 90 IST days, zero-filled.
Soft-deleted enquiries are excluded from every list, count and chart.
"Enquiries by service" counts service selections (an enquiry may select several).

## Operations

```bash
npm run db:indexes -- --apply                   # once per environment: creates the enquiry indexes
npm run seed:dev-enquiries                      # DEV database only (name must contain dev/test/staging/local)
npm run seed:dev-enquiries -- --reset           # replace seed records (deletes only seed: true)
npm run admin:account -- clear-rate-limits --confirm   # clears login/password buckets (not enquiry buckets)
```

The fictional demo enquiries that used to live in `lib/admin/data.ts` were removed from the app;
they exist only in the dev seed script and are never written to a production database.
Soft-deleted records can be restored by clearing `deletedAt` in MongoDB (no UI yet).
