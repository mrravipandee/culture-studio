/**
 * Blog publishing switch: the ONLY source of truth for which articles are public at
 * /blog/<slug>. Kept data-free (slugs only) so it can be imported anywhere.
 *
 * Empty for now: the four articles are sample content without a body. To publish one,
 * write its `content` in lib/content/blog.ts and add its slug here (or replace this with
 * the database once the backend exists). The admin's Publish button is a local preview and
 * never changes this list.
 */
export const publishedBlogSlugs: readonly string[] = [];

export const isBlogPublished = (slug: string) => publishedBlogSlugs.includes(slug);
