/**
 * Cloudinary integration — signing, URL rules, server verification (fetch stubbed) and the
 * shared validation. Run: npm run test:case-studies (no network, no real credentials).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { cloudinaryConfig, createUploadSignature, publicIdFromUrl, signParams, verifyCloudinaryImage } from "@/lib/media/cloudinary";
import { isAllowedImageUrl, IMAGE_URL_PATTERN, MEDIA_UPLOAD } from "@/lib/case-studies/constants";
import { caseStudyCreateSchema } from "@/lib/case-studies/validation";
import { parseNestedWith } from "@/lib/validation/common";

const CONFIG = { cloudName: "demo-cloud", apiKey: "123456789012345", apiSecret: "test-secret-value" };
const URL_OK = `https://res.cloudinary.com/demo-cloud/image/upload/v1700000000/${MEDIA_UPLOAD.folder}/abc123.jpg`;
const ID_OK = `${MEDIA_UPLOAD.folder}/abc123`;

test("signature matches Cloudinary's documented example", () => {
  // https://cloudinary.com/documentation/authentication_signatures (manual signature example)
  const params = { eager: "w_400,h_300,c_pad|w_260,h_200,c_crop", public_id: "sample_image", timestamp: 1315060510 };
  assert.equal(signParams(params, "abcd"), "bfd09f95f331f558cbd1320e67aa8d488770583e");
});

test("signature excludes file / api_key / cloud_name / resource_type and sorts keys", () => {
  const a = signParams({ timestamp: 1, folder: "f", api_key: "x", file: "y" }, "s");
  const b = signParams({ folder: "f", timestamp: 1 }, "s");
  assert.equal(a, b);
});

test("upload signature: fixed folder, formats, timestamp; secret not returned", () => {
  const sig = createUploadSignature(CONFIG, 1_700_000_000_000);
  assert.deepEqual(sig.params, { folder: MEDIA_UPLOAD.folder, timestamp: 1_700_000_000, allowed_formats: "jpg,png,webp" });
  assert.equal(sig.signature, signParams(sig.params, CONFIG.apiSecret));
  assert.equal(JSON.stringify(sig).includes(CONFIG.apiSecret), false);
  assert.equal(sig.uploadUrl, "https://api.cloudinary.com/v1_1/demo-cloud/image/upload");
});

test("config: missing or malformed variables disable uploads", () => {
  assert.equal(cloudinaryConfig({} as unknown as NodeJS.ProcessEnv), null);
  assert.equal(cloudinaryConfig({ CLOUDINARY_CLOUD_NAME: "x", CLOUDINARY_API_KEY: "123456", CLOUDINARY_API_SECRET: "" } as unknown as NodeJS.ProcessEnv), null);
  assert.equal(cloudinaryConfig({ CLOUDINARY_CLOUD_NAME: "Bad Name!", CLOUDINARY_API_KEY: "123456", CLOUDINARY_API_SECRET: "secret-123456" } as unknown as NodeJS.ProcessEnv), null);
  assert.deepEqual(cloudinaryConfig({ CLOUDINARY_CLOUD_NAME: " demo-cloud ", CLOUDINARY_API_KEY: "123456789012345", CLOUDINARY_API_SECRET: "test-secret-value" } as unknown as NodeJS.ProcessEnv), CONFIG);
});

test("image URL rules: site paths and Cloudinary uploads only", () => {
  for (const ok of ["/images/case-studies/x.jpg", URL_OK, "https://res.cloudinary.com/demo-cloud/image/upload/culture-studio/case-studies/a.webp"]) {
    assert.equal(isAllowedImageUrl(ok), true, ok);
    assert.equal(IMAGE_URL_PATTERN.test(ok), true, ok);
  }
  for (const bad of ["blob:x", "data:image/png;base64,AA", "https://evil.example/x.jpg", "http://res.cloudinary.com/demo-cloud/image/upload/a.jpg", "https://res.cloudinary.com/demo-cloud/video/upload/a.mp4", "https://res.cloudinary.com/demo-cloud/image/upload/../a.jpg", "https://res.cloudinary.com/demo-cloud/image/upload/a.gif"]) {
    assert.equal(isAllowedImageUrl(bad), false, bad);
  }
});

test("publicIdFromUrl: same cloud and folder only, no transformations", () => {
  assert.equal(publicIdFromUrl(URL_OK, "demo-cloud"), ID_OK);
  assert.equal(publicIdFromUrl(URL_OK, "other-cloud"), null);
  assert.equal(publicIdFromUrl("https://res.cloudinary.com/demo-cloud/image/upload/elsewhere/abc.jpg", "demo-cloud"), null);
  assert.equal(publicIdFromUrl(`https://res.cloudinary.com/demo-cloud/image/upload/w_100/${ID_OK}.jpg`, "demo-cloud"), null);
});

test("validation: an uploaded image needs its public id; a site image must not have one", () => {
  const base = { title: "T", projectHighlight: "H", overview: "O" };
  assert.equal(parseNestedWith(caseStudyCreateSchema, { ...base, coverImage: { kind: "IMAGE", url: URL_OK, alt: "a" } }).ok, false);
  assert.equal(parseNestedWith(caseStudyCreateSchema, { ...base, coverImage: { kind: "IMAGE", url: URL_OK, publicId: ID_OK, alt: "a" } }).ok, true);
  assert.equal(parseNestedWith(caseStudyCreateSchema, { ...base, coverImage: { kind: "IMAGE", url: "/images/case-studies/x.jpg", publicId: ID_OK, alt: "a" } }).ok, false);
  assert.equal(parseNestedWith(caseStudyCreateSchema, { ...base, gallery: [{ url: URL_OK, alt: "a" }] }).ok, false);
});

/* Server verification with a stubbed Cloudinary Admin API ----------------------------------------- */

function withFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>, run: () => Promise<void>) {
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => handler(String(input), init)) as typeof fetch;
  return run().finally(() => {
    globalThis.fetch = original;
  });
}

test("verify: accepts an existing JPG under the size limit, with Basic auth", async () => {
  await withFetch(
    (url, init) => {
      assert.equal(url, `https://api.cloudinary.com/v1_1/demo-cloud/resources/image/upload/culture-studio/case-studies/abc123`);
      assert.match(String((init?.headers as Record<string, string>).Authorization), /^Basic /);
      return Response.json({ format: "jpg", bytes: 120_000 });
    },
    async () => assert.deepEqual(await verifyCloudinaryImage(URL_OK, ID_OK, CONFIG), { ok: true }),
  );
});

test("verify: rejects missing, oversized, wrong-format, mismatched and foreign images", async () => {
  await withFetch(() => new Response("{}", { status: 404 }), async () => assert.equal((await verifyCloudinaryImage(URL_OK, ID_OK, CONFIG)).ok, false));
  await withFetch(() => Response.json({ format: "jpg", bytes: MEDIA_UPLOAD.maxBytes + 1 }), async () => assert.equal((await verifyCloudinaryImage(URL_OK, ID_OK, CONFIG)).ok, false));
  await withFetch(() => Response.json({ format: "gif", bytes: 10 }), async () => assert.equal((await verifyCloudinaryImage(URL_OK, ID_OK, CONFIG)).ok, false));
  assert.equal((await verifyCloudinaryImage(URL_OK, `${MEDIA_UPLOAD.folder}/other`, CONFIG)).ok, false);
  assert.equal((await verifyCloudinaryImage(URL_OK.replace("demo-cloud", "someone-else"), ID_OK, CONFIG)).ok, false);
  assert.equal((await verifyCloudinaryImage(URL_OK, ID_OK, null)).ok, false, "not configured");
});

test("verify: network failure is reported as unavailable (not as a bad image)", async () => {
  await withFetch(
    () => {
      throw new TypeError("network down");
    },
    async () => {
      const r = await verifyCloudinaryImage(URL_OK, ID_OK, CONFIG);
      assert.equal(r.ok, false);
      assert.equal(!r.ok && r.unavailable, true);
    },
  );
});
