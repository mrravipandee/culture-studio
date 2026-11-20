import type { NextConfig } from "next";

/** Applied to every response. */
const securityHeaders = [
  // HTTPS only for two years (browsers ignore this header on plain HTTP, e.g. localhost).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Clickjacking: only this site may frame its pages (CSP for modern browsers, XFO for older ones).
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // The site uses none of these browser features.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
];

/**
 * Uploaded case study images (lib/media/cloudinary.ts) are served by Cloudinary. Only this
 * account's upload paths are allowed through the image optimiser, and only when
 * CLOUDINARY_CLOUD_NAME is set (read at build / dev-server start).
 */
const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> =
  cloudinaryCloud && /^[a-z0-9_-]{1,64}$/.test(cloudinaryCloud)
    ? [{ protocol: "https", hostname: "res.cloudinary.com", pathname: `/${cloudinaryCloud}/image/upload/**` }]
    : [];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { remotePatterns },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
