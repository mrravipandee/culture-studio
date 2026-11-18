/**
 * Blog publishing switch: the ONLY source of truth for which articles are public at
 * /blog/<slug>. Kept data-free (slugs only) so it can be imported anywhere.
 *
 * The four launch articles have bodies (lib/content/blog-bodies.ts) and are listed here.
 * Their copy is still in review: BLOG_COPY_IN_REVIEW in lib/content/blog.ts keeps them
 * noindex and out of the sitemap. To add another article, write its `content` in
 * lib/content/blog.ts and add its slug here (or replace this with the database later). The admin's Publish button is a local preview and
 * never changes this list.
 */
export const publishedBlogSlugs: readonly string[] = [
  "how-to-build-a-brand-people-remember",
  "brand-positioning-foundation-for-scalable-growth",
  "performance-marketing-vs-brand-marketing",
  "content-that-converts-a-practical-playbook",
];

export const isBlogPublished = (slug: string) => publishedBlogSlugs.includes(slug);
