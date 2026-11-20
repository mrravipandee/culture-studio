/**
 * Newsletter subscribers — validation, normalisation, spam rules, the atomic sign-up pipeline
 * and record mapping. Run: npm run test:subscribers (no database).
 *
 * The pipeline test evaluates the exact $set stage the repository sends to MongoDB against a
 * tiny interpreter for the operators it uses ($ifNull, $cond, $eq, $add, $literal), so the
 * insert / repeat / reactivate behaviour is checked without a server.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { subscribeSchema, adminAddSubscriberSchema, subscriberBulkSchema, subscriberStatusUpdateSchema, isLikelySpamSignup } from "@/lib/validation/subscriber";
import { signupPipeline, toSubscriber } from "@/lib/subscribers/repository";
import { parseWith } from "@/lib/validation/common";
import { Types } from "mongoose";

type Doc = Record<string, unknown>;

/** Evaluates the aggregation expressions used by signupPipeline against `doc`. */
function evaluate(expr: unknown, doc: Doc): unknown {
  if (expr instanceof Date || expr === null || typeof expr !== "object") {
    if (typeof expr === "string" && expr.startsWith("$")) return doc[expr.slice(1)];
    return expr;
  }
  const [op, arg] = Object.entries(expr as Record<string, unknown>)[0];
  const args = arg as unknown[];
  switch (op) {
    case "$literal":
      return arg;
    case "$ifNull": {
      const v = evaluate(args[0], doc);
      return v === undefined || v === null ? evaluate(args[1], doc) : v;
    }
    case "$cond":
      return evaluate(args[0], doc) ? evaluate(args[1], doc) : evaluate(args[2], doc);
    case "$eq":
      return evaluate(args[0], doc) === evaluate(args[1], doc);
    case "$add":
      return (evaluate(args[0], doc) as number) + (evaluate(args[1], doc) as number);
    default:
      throw new Error(`Unsupported operator ${op}`);
  }
}

function applySignup(before: Doc | null, email: string, source: "WEBSITE" | "BLOG" | "CASE_STUDY", now: Date): Doc {
  const doc: Doc = before ? { ...before } : { email };
  const [{ $set }] = signupPipeline(email, source, now);
  const next: Doc = { ...doc };
  for (const [key, expr] of Object.entries($set)) {
    const value = evaluate(expr, doc); // every expression reads the document BEFORE the update
    if (value === undefined) delete next[key];
    else next[key] = value;
  }
  return next;
}

test("emails are normalised (trim + lowercase), so case/space variants are the same subscriber", () => {
  const a = parseWith(subscribeSchema, { email: "  Name@Example.COM ", source: "BLOG" });
  const b = parseWith(subscribeSchema, { email: "name@example.com", source: "BLOG" });
  assert.equal(a.ok && b.ok && a.data.email === b.data.email, true);
});

test("invalid emails and unknown fields are rejected", () => {
  for (const email of ["", "no-at", "a@b", "a..b@example.com", "x y@example.com", "a@exa\nmple.com", `${"a".repeat(250)}@example.com`]) {
    assert.equal(parseWith(subscribeSchema, { email, source: "BLOG" }).ok, false, JSON.stringify(email));
  }
  assert.equal(parseWith(subscribeSchema, { email: "a@example.com", source: "BLOG", status: "ACTIVE" }).ok, false);
  assert.equal(parseWith(subscribeSchema, { email: "a@example.com", source: "MANUAL" }).ok, false, "MANUAL is admin-only");
  assert.equal(parseWith(subscribeSchema, { email: { $ne: null }, source: "BLOG" }).ok, false, "operator objects never reach a query");
});

test("spam signals: honeypot or implausibly fast submit", () => {
  assert.equal(isLikelySpamSignup({ company_url: "http://spam" }), true);
  assert.equal(isLikelySpamSignup({ elapsedMs: 200 }), true);
  assert.equal(isLikelySpamSignup({ elapsedMs: 5000 }), false);
  assert.equal(isLikelySpamSignup({}), false);
});

test("sign-up pipeline: first sign-up creates an ACTIVE record", () => {
  const now = new Date("2026-11-20T10:00:00Z");
  const doc = applySignup(null, "a@example.com", "BLOG", now);
  assert.equal(doc.email, "a@example.com");
  assert.equal(doc.status, "ACTIVE");
  assert.equal(doc.source, "BLOG");
  assert.deepEqual(doc.subscribedAt, now);
  assert.equal(doc.submissionCount, 1);
  assert.equal("reactivatedAt" in doc, false);
});

test("sign-up pipeline: a repeat sign-up updates the same record (no duplicate, first data kept)", () => {
  const t1 = new Date("2026-11-20T10:00:00Z");
  const t2 = new Date("2026-11-21T10:00:00Z");
  const first = applySignup(null, "a@example.com", "BLOG", t1);
  const second = applySignup(first, "a@example.com", "WEBSITE", t2);
  assert.deepEqual(second.subscribedAt, t1, "first subscription date kept");
  assert.equal(second.source, "BLOG", "first source kept");
  assert.equal(second.submissionCount, 2);
  assert.deepEqual(second.lastSubmittedAt, t2);
  assert.equal("reactivatedAt" in second, false, "an active subscriber is not 'reactivated'");
});

test("sign-up pipeline: an unsubscribed person who signs up again is reactivated", () => {
  const t1 = new Date("2026-11-01T00:00:00Z");
  const t2 = new Date("2026-11-20T00:00:00Z");
  const unsubscribed = { ...applySignup(null, "a@example.com", "BLOG", t1), status: "UNSUBSCRIBED", unsubscribedAt: new Date("2026-11-10T00:00:00Z") };
  const back = applySignup(unsubscribed, "a@example.com", "BLOG", t2);
  assert.equal(back.status, "ACTIVE");
  assert.deepEqual(back.reactivatedAt, t2);
  assert.deepEqual(back.unsubscribedAt, unsubscribed.unsubscribedAt, "history kept");
  assert.deepEqual(back.subscribedAt, t1);
});

test("the pipeline stores the email as a literal (a value starting with $ can't become a field path)", () => {
  const [{ $set }] = signupPipeline("$weird@example.com", "BLOG", new Date());
  assert.deepEqual($set.email, { $literal: "$weird@example.com" });
});

test("admin schemas: add, status, bulk", () => {
  assert.equal(parseWith(adminAddSubscriberSchema, { email: "A@Example.com", name: "  Riya  ", source: "MANUAL", status: "ACTIVE" }).ok, true);
  assert.equal(parseWith(adminAddSubscriberSchema, { email: "a@example.com", source: "MANUAL", status: "ACTIVE", verifiedAt: "2026-01-01" }).ok, false);
  assert.equal(parseWith(subscriberStatusUpdateSchema, { status: "DELETED" }).ok, false);
  const id = new Types.ObjectId().toString();
  assert.equal(parseWith(subscriberBulkSchema, { action: "delete", ids: [id] }).ok, true);
  assert.equal(parseWith(subscriberBulkSchema, { action: "delete", ids: [id, id] }).ok, false, "duplicate ids");
  assert.equal(parseWith(subscriberBulkSchema, { action: "export", ids: [id] }).ok, false);
  assert.equal(parseWith(subscriberBulkSchema, { action: "delete", ids: [] }).ok, false);
});

test("record mapping exposes only the listed fields", () => {
  const _id = new Types.ObjectId();
  const at = new Date("2026-11-20T10:00:00Z");
  const s = toSubscriber({ _id, email: "a@example.com", status: "ACTIVE", source: "BLOG", subscribedAt: at, createdAt: at, updatedAt: at });
  assert.deepEqual(s, { id: _id.toString(), email: "a@example.com", status: "ACTIVE", source: "BLOG", subscribedAt: at.toISOString(), createdAt: at.toISOString(), updatedAt: at.toISOString() });
});
