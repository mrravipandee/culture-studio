/**
 * Blog CMS — sanitiser, validation, service rules (in-memory repository), public resolution,
 * migration and form ↔ API mapping. Run: npm run test:blog (no database, no network).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeRichDoc } from "@/lib/blog/content";
import { blogCreateSchema, blogUpdateSchema, blogBulkSchema, istToday } from "@/lib/blog/validation";
import { createBlogService, BlogError, type BlogAuditEvent } from "@/lib/blog/service";
import { blogPublishIssues, resolveArticlePage, toPublicArticle, type BlogRecord } from "@/lib/blog/rules";
import { buildBlogMigrationRecords, planBlogMigration, summarize } from "@/lib/blog/migration";
import { featuredArticle, blogArticles } from "@/lib/content/blog";
import { diffBlogChanges, emptyBlogForm, toBlogInput } from "@/lib/admin/blog-utils";
import { parseWith } from "@/lib/validation/common";
import { createMemoryBlogRepository } from "./memory-repository";

const ADMIN = "bbbbbbbbbbbbbbbbbbbbbbbb";
const p = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });
const doc = (...content: unknown[]) => ({ type: "doc", content });
const COVER = { url: "/images/blog/article-creative-tools.jpg", alt: "A camera on a desk", caption: "" };

/* Sanitiser ------------------------------------------------------------------------------------- */

test("sanitiser keeps the whitelist and strips unknown attributes", () => {
  const { doc: out, errors } = sanitizeRichDoc(
    doc(
      { type: "heading", attrs: { level: 2, textAlign: "center", onclick: "x" }, content: [{ type: "text", text: "Hi", marks: [{ type: "bold", attrs: { evil: 1 } }] }] },
      { type: "paragraph", attrs: { textAlign: null, style: "x" }, content: [{ type: "text", text: "Body" }] },
    ),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(out, doc({ type: "heading", attrs: { level: 2, textAlign: "center" }, content: [{ type: "text", text: "Hi", marks: [{ type: "bold" }] }] }, p("Body")));
});

test("sanitiser rejects unsafe links, unknown blocks, foreign / blob / data images", () => {
  for (const bad of [
    doc({ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] }] }),
    doc({ type: "codeBlock", content: [{ type: "text", text: "x" }] }),
    doc({ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "highlight" }] }] }),
    doc({ type: "image", attrs: { src: "https://evil.example/x.jpg", alt: "a" } }),
    doc({ type: "image", attrs: { src: "blob:http://localhost/1", alt: "a" } }),
    doc({ type: "image", attrs: { src: "data:image/png;base64,AA", alt: "a" } }),
    { type: "paragraph" },
    "<p>html</p>",
  ]) {
    assert.ok(sanitizeRichDoc(bad).errors.length > 0, JSON.stringify(bad).slice(0, 60));
  }
});

test("sanitiser accepts site and Cloudinary images and reports them", () => {
  const cloud = "https://res.cloudinary.com/demo/image/upload/v1/culture-studio/blog/abc.webp";
  const r = sanitizeRichDoc(doc({ type: "image", attrs: { src: "/images/blog/a.jpg", alt: "a", align: "wide" } }, { type: "image", attrs: { src: cloud, alt: "b" } }));
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.images, ["/images/blog/a.jpg", cloud]);
});

test("sanitiser caps size and depth", () => {
  const huge = doc(...Array.from({ length: 3000 }, () => p("x".repeat(100))));
  assert.ok(sanitizeRichDoc(huge).errors.some((e) => /too large/.test(e)));
  let nested: unknown = p("deep");
  for (let i = 0; i < 20; i++) nested = { type: "bulletList", content: [{ type: "listItem", content: [nested] }] };
  assert.ok(sanitizeRichDoc(doc(nested)).errors.some((e) => /nested too deeply/.test(e)));
});

/* Validation ------------------------------------------------------------------------------------- */

test("create: minimal draft is valid; status / ids / unknown fields are rejected", () => {
  assert.equal(parseWith(blogCreateSchema, { title: "Hello", category: "Marketing" }).ok, true);
  for (const extra of [{ status: "PUBLISHED" }, { publishedAt: "2020-01-01T00:00:00Z" }, { createdBy: ADMIN }, { wordCount: 5 }]) {
    assert.equal(parseWith(blogCreateSchema, { title: "Hello", ...extra }).ok, false, JSON.stringify(extra));
  }
});

test("validation: slug, category, tags, cover, future date", () => {
  assert.equal(parseWith(blogCreateSchema, { title: "T", slug: "Bad Slug" }).ok, false);
  assert.equal(parseWith(blogCreateSchema, { title: "T", category: "Sports" }).ok, false);
  assert.equal(parseWith(blogCreateSchema, { title: "T", tags: ["a", "A"] }).ok, false, "duplicate tags (case-insensitive)");
  assert.equal(parseWith(blogCreateSchema, { title: "T", coverImage: { url: "blob:x", alt: "a" } }).ok, false);
  const cloud = "https://res.cloudinary.com/demo/image/upload/culture-studio/blog/x.jpg";
  assert.equal(parseWith(blogCreateSchema, { title: "T", coverImage: { url: cloud, alt: "a" } }).ok, false, "uploaded cover needs its id");
  assert.equal(parseWith(blogCreateSchema, { title: "T", coverImage: { url: cloud, publicId: "culture-studio/blog/x", alt: "a" } }).ok, true);
  const tomorrow = new Date(Date.parse(`${istToday()}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
  assert.equal(parseWith(blogCreateSchema, { title: "T", displayDate: tomorrow }).ok, false, "no scheduling");
  assert.equal(parseWith(blogCreateSchema, { title: "T", displayDate: "2026-02-30" }).ok, false, "impossible date");
  assert.equal(parseWith(blogCreateSchema, { title: "T", displayDate: "2026-01-15" }).ok, true);
});

test("update and bulk schemas are strict", () => {
  const at = new Date().toISOString();
  assert.equal(parseWith(blogUpdateSchema, { expectedUpdatedAt: at, changes: { title: "x" } }).ok, true);
  assert.equal(parseWith(blogUpdateSchema, { expectedUpdatedAt: at, changes: {} }).ok, false);
  assert.equal(parseWith(blogUpdateSchema, { expectedUpdatedAt: at, changes: { status: "PUBLISHED" } }).ok, false);
  assert.equal(parseWith(blogBulkSchema, { action: "delete", ids: ["a"] }).ok, false);
});

/* Service ------------------------------------------------------------------------------------------- */

function setup() {
  let now = Date.parse("2026-11-20T10:00:00Z");
  const clock = () => new Date((now += 1000));
  const repo = createMemoryBlogRepository(clock);
  const audits: BlogAuditEvent[] = [];
  let revalidations = 0;
  const service = createBlogService({ repo, audit: async (e) => void audits.push(e), revalidatePublic: () => void revalidations++, now: clock });
  return { service, repo, audits, revalidations: () => revalidations };
}

const create = (s: ReturnType<typeof setup>, extra: Record<string, unknown> = {}) => {
  const r = parseWith(blogCreateSchema, { title: "Brand Basics", excerpt: "A short summary.", category: "Content", content: doc(p("Hello world body text.")), coverImage: COVER, ...extra });
  if (!r.ok) throw new Error(JSON.stringify(r.fields));
  return s.service.create(r.data, ADMIN);
};
const fails = (promise: Promise<unknown>, kind: BlogError["kind"]) => assert.rejects(promise, (e: unknown) => e instanceof BlogError && e.kind === kind);

test("create → DRAFT with generated slug, word count, audit; drafts don't touch the public cache", async () => {
  const s = setup();
  const post = await create(s);
  assert.equal(post.status, "DRAFT");
  assert.equal(post.slug, "brand-basics");
  assert.equal(post.wordCount, 4);
  assert.equal(post.publicSlug, null);
  assert.equal(s.audits[0].action, "created");
  assert.equal(s.revalidations(), 0);
});

test("duplicate slug → SLUG_TAKEN with a suggestion; never overwritten", async () => {
  const s = setup();
  await create(s);
  await assert.rejects(create(s), (e: unknown) => e instanceof BlogError && e.kind === "SLUG_TAKEN" && e.suggestion === "brand-basics-2");
});

test("update keeps unchanged fields, recomputes words, rejects stale tokens", async () => {
  const s = setup();
  const post = await create(s, { tags: ["one"] });
  const parsed = parseWith(blogUpdateSchema, { expectedUpdatedAt: post.updatedAt, changes: { content: doc(p("One two three four five six")) } });
  assert.ok(parsed.ok);
  const updated = await s.service.update(post.id, post.updatedAt, parsed.ok ? parsed.data.changes : {}, ADMIN);
  assert.equal(updated.wordCount, 6);
  assert.deepEqual(updated.tags, ["one"]);
  await fails(s.service.update(post.id, post.updatedAt, { title: "x" }, ADMIN), "STALE_RECORD");
});

test("publish validation: incomplete drafts can't go live; complete ones can", async () => {
  const s = setup();
  const parsedBare = blogCreateSchema.parse({ title: "Bare" });
  const bare = await s.service.create(parsedBare, ADMIN);
  await assert.rejects(s.service.publish(bare.id, ADMIN), (e: unknown) => e instanceof BlogError && e.kind === "PUBLISH_VALIDATION" && Boolean(e.fields?.excerpt && e.fields?.content && e.fields?.coverImage && e.fields?.category));
  const post = await create(s, { slug: "complete" });
  const live = await s.service.publish(post.id, ADMIN, post.updatedAt);
  assert.equal(live.status, "PUBLISHED");
  assert.equal(live.publicSlug, "complete");
  assert.ok(live.publishedAt && live.firstPublishedAt);
  assert.equal(s.revalidations(), 1);
});

test("published rules: H1 in body and images without alt block publishing", () => {
  const base = { title: "T", slug: "t", excerpt: "E", category: "Content" as const, tags: [], author: "CULT.URE", coverImage: COVER, displayDate: null, seo: {} };
  assert.ok(blogPublishIssues({ ...base, content: doc({ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "H1" }] }) as never }).content);
  assert.ok(blogPublishIssues({ ...base, content: doc({ type: "image", attrs: { src: "/images/a.jpg", alt: "" } }) as never }).content);
  assert.ok(blogPublishIssues({ ...base, coverImage: { ...COVER, alt: "" }, content: doc(p("x")) as never }).coverImageAlt);
});

test("unpublish / republish keep firstPublishedAt; invalid transitions rejected; concurrent publishes: one wins", async () => {
  const s = setup();
  const post = await create(s);
  const [a, b] = await Promise.allSettled([s.service.publish(post.id, ADMIN), s.service.publish(post.id, ADMIN)]);
  assert.equal([a, b].filter((r) => r.status === "fulfilled").length, 1);
  const first = (await s.service.get(post.id)).firstPublishedAt;
  await fails(s.service.publish(post.id, ADMIN), "INVALID_TRANSITION");
  const draft = await s.service.unpublish(post.id, ADMIN);
  assert.equal(draft.publishedAt, null);
  await fails(s.service.unpublish(post.id, ADMIN), "INVALID_TRANSITION");
  const again = await s.service.publish(post.id, ADMIN);
  assert.equal(again.firstPublishedAt, first);
});

test("a live article can't be edited into an unpublishable state; slug change keeps a redirect", async () => {
  const s = setup();
  const post = await create(s, { slug: "first" });
  const live = await s.service.publish(post.id, ADMIN);
  await fails(s.service.update(post.id, live.updatedAt, { coverImage: null }, ADMIN), "PUBLISH_VALIDATION");
  const moved = await s.service.update(post.id, live.updatedAt, { slug: "second" }, ADMIN);
  assert.deepEqual(moved.previousSlugs, ["first"]);
});

test("soft delete hides the post and frees its slug; bulk skips missing ids", async () => {
  const s = setup();
  const a = await create(s);
  const b = await create(s, { slug: "other" });
  const deleted = await s.service.removeMany([a.id, b.id, "ffffffffffffffffffffffff"], ADMIN);
  assert.deepEqual(deleted, [a.id, b.id]);
  await fails(s.service.get(a.id), "NOT_FOUND");
  assert.equal((await create(s)).slug, "brand-basics", "slug reusable after delete");
  assert.equal((await s.service.list()).items.length, 1);
});

/* Public ------------------------------------------------------------------------------------------- */

const rec = (over: Partial<BlogRecord>): BlogRecord => ({
  id: "x",
  title: "T",
  slug: "t",
  excerpt: "E",
  content: doc(p("Hello")) as never,
  category: "Marketing",
  tags: [],
  author: "CULT.URE",
  coverImage: COVER,
  displayDate: null,
  seo: {},
  status: "PUBLISHED",
  publishedAt: new Date("2026-11-10T05:00:00Z"),
  firstPublishedAt: new Date("2026-11-10T05:00:00Z"),
  previousSlugs: [],
  wordCount: 1,
  createdAt: new Date("2026-11-01"),
  updatedAt: new Date("2026-11-10"),
  deletedAt: null,
  migration: null,
  ...over,
});

test("public mapping: topic, shown date, SEO fallbacks", () => {
  const a = toPublicArticle(rec({ displayDate: "2026-11-03", title: "Hello" }));
  assert.equal(a.topic, "marketing");
  assert.equal(a.date, "2026-11-03");
  assert.equal(a.seo.title, "Hello");
  assert.equal(a.seo.description, "E");
  assert.equal(toPublicArticle(rec({})).date, "2026-11-10", "no display date → publish date (IST)");
});

test("public resolution: current slug wins; old slug redirects once; others 404", () => {
  const all = [toPublicArticle(rec({ slug: "a" })), toPublicArticle(rec({ slug: "b" }))];
  assert.equal(resolveArticlePage(all, "a", null).kind, "found");
  assert.deepEqual(resolveArticlePage(all, "old", "b"), { kind: "redirect", slug: "b" });
  assert.deepEqual(resolveArticlePage(all, "old", "gone"), { kind: "missing" });
  assert.deepEqual(resolveArticlePage(all, "x", "x"), { kind: "missing" });
});

/* Migration + form mapping ------------------------------------------------------------------------- */

test("migration: the four launch articles, exact text, valid and publishable; re-run is a no-op", () => {
  const records = buildBlogMigrationRecords();
  const source = [featuredArticle, ...blogArticles];
  assert.equal(records.length, 4);
  records.forEach((r, i) => {
    assert.equal(r.content.title, source[i].title);
    assert.equal(r.content.excerpt, source[i].description);
    assert.equal(r.content.displayDate, source[i].date);
    assert.deepEqual(r.sanitizeErrors, []);
    assert.deepEqual(blogPublishIssues(r.content), {});
    assert.equal(r.status, "PUBLISHED");
  });
  const at = new Date();
  const existing = new Map(records.map((r, i) => [r.key, { id: String(i), hash: r.hash, appliedAt: at, updatedAt: at, deleted: false }]));
  assert.equal(summarize(planBlogMigration(records, existing, new Set())).skipUnchanged, 4);
});

test("form mapping: create body and PATCH diff send only what changed", () => {
  const base = { ...emptyBlogForm(), title: "T", slug: "t", category: "Marketing" };
  const input = toBlogInput(base);
  assert.equal(input.coverImage, null);
  assert.equal(input.displayDate, null);
  assert.deepEqual(diffBlogChanges(base, { ...base }), {});
  assert.deepEqual(diffBlogChanges(base, { ...base, title: "New" }), { title: "New" });
  assert.deepEqual(diffBlogChanges(base, { ...base, category: "" }), { category: null });
});
