/**
 * The launch articles approved for publication. Since the Blog CMS this list is read only by
 * the migration (lib/blog/migration.ts → PUBLISHED); the live site follows MongoDB, and
 * changing this list does not change the site any more.
 */
export const publishedBlogSlugs: readonly string[] = [
  "how-to-build-a-brand-people-remember",
  "brand-positioning-foundation-for-scalable-growth",
  "performance-marketing-vs-brand-marketing",
  "content-that-converts-a-practical-playbook",
];

