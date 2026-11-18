import "server-only";

/**
 * CULT.URE Admin — DEMO DATA. SERVER-ONLY (imported by the dashboard Server Component).
 *
 * Subscribers here are fictional sample data for the admin UI (emails use example.com /
 * .test) until the Subscribers backend exists. Enquiries are NOT here any more: they are
 * real records in MongoDB (lib/enquiries/repository.ts).
 *
 * Replace each collection with a MongoDB/API query later; the dashboard reads only the
 * exported collections through lib/admin/dashboard-utils.ts.
 *
 * Case studies are NOT demo data and are not duplicated here: `caseStudies` maps the real,
 * approved projects (lib/content/case-studies.ts) and reads their public visibility from the
 * publishing allowlist (lib/content/case-studies-publishing.ts), which stays the only source
 * of truth for the public website.
 */

import { caseStudies as approvedCaseStudies, caseStudyCategory } from "@/lib/content/case-studies";
import { disciplines } from "@/lib/content/disciplines";
import { isCaseStudyPublished } from "@/lib/content/case-studies-publishing";
import { blogArticles, featuredArticle } from "@/lib/content/blog";

export const IS_DEMO_DATA = true;


/* ---------------------------------------------------------------
   Types
---------------------------------------------------------------- */

import { BLOG_DEFAULT_AUTHOR, type AdminCaseStudy, type BlogPost, type Subscriber } from "./types";
import { emptyDoc } from "@/lib/rich-text";
import { isBlogPublished } from "@/lib/content/blog-publishing";
export type { AdminCaseStudy, BlogPost, BlogStatus, Subscriber, SubscriberSource, SubscriberStatus } from "./types";

/** Dashboard name for blog records (same type as the Blog admin). */
export type AdminBlog = BlogPost;




/* Enquiries: no longer here. Real enquiries live in MongoDB (lib/enquiries/repository.ts);
   the fictional demo set moved to the dev-only seed script scripts/seed-dev-enquiries.mjs. */

/* ---------------------------------------------------------------
   Case studies (real, approved projects; not duplicated)
---------------------------------------------------------------- */

export const caseStudies: AdminCaseStudy[] = approvedCaseStudies.map((project) => {
  const lines = project.figures.map((f) => `${f.value} ${f.label}`);
  const isPublic = isCaseStudyPublished(project.slug);
  return {
    id: `cs-${project.slug}`,
    slug: project.slug,
    number: project.number,
    title: project.title,
    highlight: project.highlight,
    overview: project.overview,
    services: [...project.services],
    category: caseStudyCategory(project),
    coverImage: project.image.src,
    coverAlt: project.image.alt,
    coverIsTemporary: project.image.temporary === true,
    status: isPublic ? "PUBLISHED" : "DRAFT",
    figuresLabel: project.figuresLabel,
    scope: project.figuresLabel === "Project Scope" ? lines : [],
    results: project.figuresLabel === "Results" ? lines : [],
    createdAt: null,
    updatedAt: null,
    publicSlug: isPublic ? project.slug : null,
    isLocal: false,
  };
});

/** Options for the admin case study form: the four disciplines, and every service name in
 *  the CULT.URE taxonomy plus the labels already used by approved projects. */
export const caseStudyCategoryOptions = disciplines.map((d) => d.name);
export const caseStudyServiceOptions = [
  ...new Set([...disciplines.flatMap((d) => d.services.map((s) => s.name)), ...approvedCaseStudies.flatMap((p) => p.services)]),
].sort((a, b) => a.localeCompare(b));

/* ---------------------------------------------------------------
   Blogs (the Blog page sample articles; DRAFT unless on the blog publishing list with a body)
---------------------------------------------------------------- */

const topicLabel: Record<string, string> = {
  "brand-strategy": "Brand Strategy",
  marketing: "Marketing",
  content: "Content",
  growth: "Growth",
  design: "Design",
};

export const blogs: BlogPost[] = [featuredArticle, ...blogArticles].map((article) => {
  const isPublic = isBlogPublished(article.slug) && article.content !== null;
  return {
    id: `blog-${article.slug}`,
    title: article.title,
    slug: article.slug,
    excerpt: article.description,
    content: article.content ?? emptyDoc(),
    coverImage: article.image.src,
    coverImageAlt: article.image.alt,
    coverCaption: "",
    category: topicLabel[article.topic] ?? article.topic,
    tags: [...article.tags],
    author: BLOG_DEFAULT_AUTHOR,
    status: isPublic ? "PUBLISHED" : "DRAFT",
    seoTitle: "",
    seoDescription: "",
    publishedAt: isPublic ? `${article.date}T10:00:00+05:30` : null,
    createdAt: `${article.date}T10:00:00+05:30`,
    updatedAt: `${article.date}T16:00:00+05:30`,
    publicSlug: isPublic ? article.slug : null,
    isLocal: false,
  };
});

/** Site images offered by the blog image pickers (existing local assets; replace with a media library later). */
export const blogImageLibrary = [
  ...new Map(
    [featuredArticle, ...blogArticles, { image: { src: "/images/blog/hero-burgundy-architecture.jpg", alt: "Burgundy-toned architecture" } }].map((a) => [a.image.src, { src: a.image.src, alt: a.image.alt }]),
  ).values(),
];

/* ---------------------------------------------------------------
   Subscribers (fictional; reserved example domains)
---------------------------------------------------------------- */

/** DEMO DATA: fictional people on reserved example domains. Not real sign-ups. */
export const subscribers: Subscriber[] = [
  { id: "sub-01", name: "Aisha Khan", email: "aisha.khan@example.com", status: "ACTIVE", source: "WEBSITE", subscribedAt: "2026-08-18T09:12:00+05:30", verifiedAt: "2026-08-18T09:15:00+05:30", createdAt: "2026-08-18T09:12:00+05:30", updatedAt: "2026-08-18T09:15:00+05:30" },
  { id: "sub-02", email: "reader.two@example.org", status: "ACTIVE", source: "BLOG", subscribedAt: "2026-08-27T21:40:00+05:30", createdAt: "2026-08-27T21:40:00+05:30", updatedAt: "2026-08-27T21:40:00+05:30" },
  { id: "sub-03", name: "Harsh Vardhan", email: "harsh.vardhan@example.net", status: "UNSUBSCRIBED", source: "WEBSITE", subscribedAt: "2026-09-04T11:05:00+05:30", verifiedAt: "2026-09-04T11:09:00+05:30", unsubscribedAt: "2026-10-21T08:30:00+05:30", createdAt: "2026-09-04T11:05:00+05:30", updatedAt: "2026-10-21T08:30:00+05:30" },
  { id: "sub-04", name: "Meghna Iyer", email: "meghna.iyer@example.com", status: "ACTIVE", source: "CASE_STUDY", subscribedAt: "2026-09-16T16:20:00+05:30", verifiedAt: "2026-09-16T16:26:00+05:30", createdAt: "2026-09-16T16:20:00+05:30", updatedAt: "2026-09-16T16:26:00+05:30" },
  { id: "sub-05", name: "Tushar Gokhale", email: "tushar.gokhale@example.com", status: "ACTIVE", source: "WEBSITE", subscribedAt: "2026-09-29T10:45:00+05:30", unsubscribedAt: "2026-10-05T19:00:00+05:30", reactivatedAt: "2026-10-28T12:10:00+05:30", createdAt: "2026-09-29T10:45:00+05:30", updatedAt: "2026-10-28T12:10:00+05:30" },
  { id: "sub-06", email: "studio.lead@example.test", status: "ACTIVE", source: "MANUAL", subscribedAt: "2026-10-03T14:00:00+05:30", createdAt: "2026-10-03T14:00:00+05:30", updatedAt: "2026-10-03T14:00:00+05:30" },
  { id: "sub-07", name: "Nandini Rao", email: "nandini.rao@example.org", status: "ACTIVE", source: "BLOG", subscribedAt: "2026-10-09T08:55:00+05:30", verifiedAt: "2026-10-09T09:01:00+05:30", createdAt: "2026-10-09T08:55:00+05:30", updatedAt: "2026-10-09T09:01:00+05:30" },
  { id: "sub-08", name: "Kunal Sethi", email: "kunal.sethi@example.com", status: "UNSUBSCRIBED", source: "BLOG", subscribedAt: "2026-10-14T20:30:00+05:30", unsubscribedAt: "2026-11-02T10:15:00+05:30", createdAt: "2026-10-14T20:30:00+05:30", updatedAt: "2026-11-02T10:15:00+05:30" },
  { id: "sub-09", name: "Ritika Ahuja", email: "ritika.ahuja@example.net", status: "ACTIVE", source: "WEBSITE", subscribedAt: "2026-10-19T12:12:00+05:30", verifiedAt: "2026-10-19T12:20:00+05:30", createdAt: "2026-10-19T12:12:00+05:30", updatedAt: "2026-10-19T12:20:00+05:30" },
  { id: "sub-10", name: "Sahil Chandra", email: "sahil.chandra@example.com", status: "ACTIVE", source: "CASE_STUDY", subscribedAt: "2026-10-24T17:48:00+05:30", createdAt: "2026-10-24T17:48:00+05:30", updatedAt: "2026-10-24T17:48:00+05:30" },
  { id: "sub-11", name: "Pallavi Menon", email: "pallavi.menon@example.org", status: "ACTIVE", source: "WEBSITE", subscribedAt: "2026-10-30T09:30:00+05:30", verifiedAt: "2026-10-30T09:33:00+05:30", createdAt: "2026-10-30T09:30:00+05:30", updatedAt: "2026-10-30T09:33:00+05:30" },
  { id: "sub-12", name: "Gaurav Bhatia", email: "gaurav.bhatia@example.com", status: "UNSUBSCRIBED", source: "WEBSITE", subscribedAt: "2026-11-03T13:05:00+05:30", verifiedAt: "2026-11-03T13:09:00+05:30", unsubscribedAt: "2026-11-12T18:40:00+05:30", createdAt: "2026-11-03T13:05:00+05:30", updatedAt: "2026-11-12T18:40:00+05:30" },
  { id: "sub-13", name: "Shreya Kulkarni", email: "shreya.kulkarni@example.com", status: "ACTIVE", source: "BLOG", subscribedAt: "2026-11-06T11:25:00+05:30", verifiedAt: "2026-11-06T11:31:00+05:30", createdAt: "2026-11-06T11:25:00+05:30", updatedAt: "2026-11-06T11:31:00+05:30" },
  { id: "sub-14", email: "marketing.team@example.net", status: "ACTIVE", source: "WEBSITE", subscribedAt: "2026-11-09T15:50:00+05:30", createdAt: "2026-11-09T15:50:00+05:30", updatedAt: "2026-11-09T15:50:00+05:30" },
  { id: "sub-15", name: "Arnav Saxena", email: "arnav.saxena@example.com", status: "ACTIVE", source: "CASE_STUDY", subscribedAt: "2026-11-11T10:05:00+05:30", verifiedAt: "2026-11-11T10:11:00+05:30", createdAt: "2026-11-11T10:05:00+05:30", updatedAt: "2026-11-11T10:11:00+05:30" },
  { id: "sub-16", name: "Ishaan Mehra", email: "ishaan.mehra@example.org", status: "ACTIVE", source: "MANUAL", subscribedAt: "2026-11-13T16:40:00+05:30", createdAt: "2026-11-13T16:40:00+05:30", updatedAt: "2026-11-13T16:40:00+05:30" },
  { id: "sub-17", name: "Tanya D’Souza", email: "tanya.dsouza@example.com", status: "ACTIVE", source: "WEBSITE", subscribedAt: "2026-11-14T10:24:00+05:30", verifiedAt: "2026-11-14T10:25:00+05:30", createdAt: "2026-11-14T10:24:00+05:30", updatedAt: "2026-11-14T10:25:00+05:30" },
  { id: "sub-18", name: "Varun Pillai", email: "varun.pillai@example.com", status: "ACTIVE", source: "BLOG", subscribedAt: "2026-11-16T19:10:00+05:30", createdAt: "2026-11-16T19:10:00+05:30", updatedAt: "2026-11-16T19:10:00+05:30" },
];
