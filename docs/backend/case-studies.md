# Case Studies CMS

MongoDB-backed case studies: admin CRUD and publishing workflow, public listing and detail
pages, sitemap, Home "Selected work", and a one-time migration of the nine approved projects.

## Layout

| Concern | File |
| --- | --- |
| Constants (statuses, transitions, limits, image rules, cache tag) | `lib/case-studies/constants.ts` |
| DTO types | `lib/case-studies/types.ts` |
| Request validation (Zod, strict) | `lib/case-studies/validation.ts` |
| Domain rules (publishing readiness, SEO fallback, slugs, redirects, public mapping) | `lib/case-studies/rules.ts` |
| Business service (DB-agnostic, injected deps) | `lib/case-studies/service.ts` |
| MongoDB repository | `lib/case-studies/repository.ts` |
| Production wiring, error mapping, rate limit | `lib/case-studies/server.ts`, `lib/case-studies/routes.ts` |
| Public cached reads | `lib/case-studies/public.ts` |
| Migration planning | `lib/case-studies/migration.ts`, `scripts/migrate-case-studies.mjs` |
| Models | `lib/db/models/CaseStudy.ts`, `lib/db/models/AuditLog.ts` |
| Audit writer | `lib/audit/log.ts` |

## Workflow

| Action | From → To | Notes |
| --- | --- | --- |
| create | — → DRAFT | status never accepted from the client |
| publish | DRAFT / ARCHIVED → PUBLISHED | full publishing validation; sets `publishedAt`, `firstPublishedAt` once |
| unpublish | PUBLISHED → DRAFT | `publishedAt` cleared, `firstPublishedAt` kept |
| archive | PUBLISHED → ARCHIVED | not public, content kept |
| restore | ARCHIVED → DRAFT, or soft-deleted (any) → DRAFT | deleted records need a free slug (`{ slug }` if taken) |
| delete | any active → soft-deleted | `deletedAt` set, slug freed, restorable |

Every transition is one conditional update on (`status`, `updatedAt`, `deletedAt`), so two
concurrent actions can't both apply. Content PATCHes require `expectedUpdatedAt` (409
`STALE_RECORD` otherwise). A PUBLISHED record must stay publishable after an edit.

**Publishing requires:** title, valid unique slug, project highlight, overview, category, ≥1
service, a cover (image with alt text, or the typographic cover), gallery alt text, SEO lengths
(title ≤ 70, description ≤ 160; empty fields fall back to "Title — Case Study" and the
highlight). Results are optional.

## Slugs and redirects

- Lowercase, hyphenated, ≤ 80 chars, reserved words blocked; generated from the title when omitted.
- Unique among active records: `activeSlug` (unset on soft delete) has a unique partial index.
  Conflicts return 409 `SLUG_TAKEN` with `fields.slugSuggestion`.
- Changing the slug of a record that was ever public stores the old one in `previousSlugs`;
  `/case-studies/<old>` answers **308** to the current slug (one hop, never to itself, only to a
  currently published record). A current slug always wins over an old one.

## API

Admin (signed-in, same-origin JSON for writes, 120 writes / 15 min per admin):

- `GET /api/admin/case-studies` — `page, pageSize, search, status (all|DRAFT|PUBLISHED|ARCHIVED|deleted), featured, category, service, from, to, sort`
- `POST /api/admin/case-studies` — create draft
- `GET | PATCH | DELETE /api/admin/case-studies/[id]`
- `POST /api/admin/case-studies/[id]/(publish|unpublish|archive|restore)` — body `{}` or `{ expectedUpdatedAt }` (restore: `+ slug`)

Public (published only, no admin fields):

- `GET /api/public/case-studies` — `page, pageSize, search, category, filter, service, featured, sort (order|newest)`
- `GET /api/public/case-studies/[slug]` — `{ project }`, `{ redirect }` or 404

## Caching

Public reads use `'use cache'` with tag `case-studies` (`cacheLife("hours")`). Any admin change
that affects the public site calls `revalidateTag("case-studies", { expire: 0 })`, so an
unpublished page is never served from cache again. The detail page is
`ensureStatic = "navigation"`: unknown / draft / archived / deleted slugs get a real 404 and old
slugs a real 308, decided before HTML is sent.

## Migration (nine approved projects)

```
npm run cs:migrate                 # dry run: prints the plan, writes nothing
npm run cs:migrate -- --apply      # writes (createdBy = the only admin, or --admin=<email>)
```

Idempotent: stable keys `approved-2026-11:<slug>`, content hashes; never overwrites records an
admin edited or deleted; slug conflicts are reported and skipped. All nine are created
PUBLISHED because they are on the client's approval list
(`lib/content/case-studies-publishing.ts`); Home "featured" follows `lib/content/selected-work.ts`.
The four projects without a photograph get the typographic cover (as on the site today).

**Deployment order:** `npm run db:indexes -- --apply` → `npm run cs:migrate -- --apply` → deploy.
The build prerenders case study pages from the database; with an empty collection the section
returns 404.

## Tests

- `npm run test:case-studies` — 38 unit tests (validation, CRUD, publishing, concurrency,
  public resolution, migration) with an in-memory repository. No database.
- `npm run test:case-studies:db` — integration checks against a **development** database only
  (refuses other names); cleans up its own records.

## Images (Cloudinary)

Two kinds of image reference are accepted: existing site images (`/images/…`) and images uploaded
to Cloudinary from the admin. Blob/data URIs and other hosts are rejected.

Setup (server env only, never `NEXT_PUBLIC_`; restart `npm run dev` / redeploy after changing):

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Without all three, the Upload buttons are hidden and a note explains that uploads are off.

Flow (`lib/media/cloudinary.ts`):
1. `POST /api/admin/media/cloudinary-signature` (admin, same-origin, 60 / 15 min) returns a
   signature for folder `culture-studio/case-studies`, formats jpg/png/webp, and a timestamp
   (Cloudinary accepts it for one hour). The API secret never leaves the server.
2. The browser uploads straight to Cloudinary (`components/admin/media/`), with progress.
3. On create / update, every Cloudinary image is checked on the server: same cloud and folder,
   public id matches the URL, and the Cloudinary Admin API confirms it exists, is JPG/PNG/WebP
   and ≤ 5 MB. Unreachable Cloudinary → 503, the record isn't saved.
4. MongoDB stores only `url` + `publicId`.
5. `next.config.ts` allows only `res.cloudinary.com/<CLOUDINARY_CLOUD_NAME>/image/upload/**`
   through the image optimiser.

Not done (by design for now): uploaded images that are never saved, or images removed from a
record, stay in Cloudinary (no automatic deletion). The Blog admin is still a local preview and
does not upload.
