# Blog CMS

MongoDB-backed articles (`blog_posts`): admin list + editor, public listing and article pages,
sitemap, dashboard, Cloudinary images, and a migration for the four launch articles.

## Layout

| Concern | File |
| --- | --- |
| Constants (statuses, categories ↔ topics, limits, cache tag) | `lib/blog/constants.ts` |
| Body sanitiser (whitelist rebuild of the TipTap JSON) | `lib/blog/content.ts` |
| Request validation (Zod, strict) | `lib/blog/validation.ts` |
| Rules (publishing readiness, SEO fallback, public mapping, slug resolution) | `lib/blog/rules.ts` |
| Service (DB-agnostic) / MongoDB repository | `lib/blog/service.ts`, `lib/blog/repository.ts` |
| Wiring, error mapping, image verification, rate limit | `lib/blog/server.ts`, `lib/blog/routes.ts` |
| Public cached reads | `lib/blog/public.ts` |
| Migration | `lib/blog/migration.ts`, `scripts/migrate-blog.mjs` |
| Model | `lib/db/models/BlogPost.ts` |

## Workflow

- **Create** → DRAFT (status never accepted from the client). Slug from the title if omitted.
- **Save** (PATCH) sends only changed fields with `expectedUpdatedAt`; a stale token → 409.
  A published article must stay publishable after an edit.
- **Publish** (DRAFT → PUBLISHED) runs the full check: title, slug, excerpt, category, body with
  text or images, alt text on every image, no H1 in the body, cover image with alt text.
  Sets `publishedAt`; `firstPublishedAt` is kept for good.
- **Unpublish** (PUBLISHED → DRAFT) removes it from the site immediately.
- **Delete** is a soft delete (`deletedAt`, slug freed). Bulk delete ≤ 100.
- **Shown date**: `displayDate` (YYYY-MM-DD, today or earlier; no scheduling), else the publish date.
- Changing a once-public slug keeps the old one as a **308** redirect.

## Content safety

The body is never trusted: `sanitizeRichDoc` rebuilds it from a whitelist of nodes, marks and
typed attributes, rejects unsafe links (`javascript:` …), images other than site paths or the
site's Cloudinary uploads (no blob/data/other hosts), and caps size (200 KB), depth, nodes and
image count. The public renderer applies the same whitelist again.

## Images

Cover and inline images: upload to Cloudinary (folder `culture-studio/blog`, signed via
`POST /api/admin/media/cloudinary-signature { purpose: "blog" }`) or pick a site image. On save
the server verifies every Cloudinary image (cloud, folder, exists, format, ≤ 5 MB).

## API

Admin (signed in, same-origin JSON writes, 200 writes / 15 min per admin, audited):
`GET|POST /api/admin/blogs`, `GET|PATCH|DELETE /api/admin/blogs/[id]`,
`POST /api/admin/blogs/[id]/publish|unpublish`, `POST /api/admin/blogs/bulk`.

## Public pages and cache

`/blog` and `/blog/[slug]` read PUBLISHED posts through `'use cache'` (tag `blog`, hourly
safety refresh). Every change that affects the site expires the tag immediately. The article
page is `ensureStatic = "navigation"`: unknown / draft / deleted → real 404, old slug → 308.
`BLOG_COPY_IN_REVIEW` (lib/content/blog.ts) keeps blog pages noindex and out of the sitemap
until the launch copy is approved.

## Migration

```
npm run blog:migrate              # dry run
npm run blog:migrate -- --apply   # writes the 4 launch articles (PUBLISHED)
```

Idempotent (stable keys + hashes); never overwrites admin edits or deletions.
**Deployment order:** `npm run db:indexes -- --apply` → `npm run blog:migrate -- --apply` → deploy.

## Tests

`npm run test:blog` — 19 tests: sanitiser, validation, service rules (in-memory repository,
concurrency, transitions, soft delete), public mapping / resolution, migration, form mapping.
