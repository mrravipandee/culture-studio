#!/usr/bin/env node
/**
 * DEVELOPMENT ONLY — fills a dev database with the fictional demo enquiries that the admin
 * dashboard used before it was connected to MongoDB (moved here from lib/admin/data.ts).
 *
 *   npm run seed:dev-enquiries            # insert (refuses if seed records already exist)
 *   npm run seed:dev-enquiries -- --reset # delete previous seed records, then insert
 *
 * Safety:
 *  - Refuses unless the database named in MONGODB_URI looks like a development database
 *    (its name contains dev / test / staging / local). Never run against production.
 *  - Every record has seed: true; --reset deletes ONLY seed records, never real enquiries.
 *  - People, companies and emails are invented (example.com).
 *  - Deterministic: the same records every run, dated relative to today (90 days).
 */

import mongoose from "mongoose";

const uri = process.env.MONGODB_URI ?? "";
const dbName = uri.split("?")[0].split("/").pop() ?? "";
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}
if (!/(dev|test|staging|local)/i.test(dbName)) {
  console.error(`Refusing to seed: database "${dbName || "(unknown)"}" doesn't look like a development database.`);
  process.exit(1);
}
const reset = process.argv.includes("--reset");

/* ---- Generator (ported from lib/admin/data.ts) ---- */

const DAYS = 90;
const seeded = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const FIRST = ["Aarav", "Diya", "Kabir", "Isha", "Manav", "Riya", "Tanvi", "Yash", "Nikhil", "Pooja", "Harsh", "Sneha", "Omkar", "Devika", "Varun", "Aditi", "Sameer", "Nidhi"];
const LAST = ["Shah", "Kapoor", "Pillai", "Chopra", "Deshmukh", "Malhotra", "Bhat", "Saxena", "Shetty", "Agarwal", "Kaur", "Pandit", "Jain", "Sinha"];
const COMPANY = ["Studio", "Foods", "Clinic", "Realty", "Textiles", "Labs", "Consulting", "Interiors", "Logistics", "Wellness", "Ventures", "Exports"];
const SERVICE_WEIGHTS = [
  ["brand-strategy-communications", 0.34],
  ["digital-marketing-growth", 0.28],
  ["content-creative", 0.2],
  ["technology-automation", 0.11],
  ["not-sure", 0.07],
];
const MESSAGES = {
  "brand-strategy-communications": ["Looking for brand positioning support for a new business.", "Need help refreshing our brand identity and messaging.", "Planning a rebrand and would like to discuss scope."],
  "digital-marketing-growth": ["Want to improve lead generation through paid campaigns.", "Looking for SEO and performance marketing support.", "Need help scaling online sales."],
  "content-creative": ["Interested in monthly social media content.", "Looking for a content strategy for LinkedIn.", "Need video content for an upcoming launch."],
  "technology-automation": ["Need a new website for our business.", "Want to automate our enquiry follow-ups.", "Looking for help with CRM setup."],
  "not-sure": ["Would like to discuss a project. Please get in touch.", "Have a few questions about working together."],
};
const SOURCES = ["CONTACT_PAGE", "CONTACT_PAGE", "ABOUT"];
const pick = (list, r) => list[Math.floor(r * list.length) % list.length];
const finalStatus = (r) => (r < 0.55 ? "REPLIED" : r < 0.8 ? "CLOSED" : "READ");
const PATH = { NEW: [], READ: ["READ"], REPLIED: ["READ", "REPLIED"], CLOSED: ["READ", "REPLIED", "CLOSED"] };

function build() {
  const rand = seeded(20261114);
  const today = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()) + "T00:00:00+05:30");
  const out = [];
  let n = 0;
  for (let back = DAYS - 1; back >= 0; back--) {
    const day = new Date(today.getTime() - back * 86_400_000);
    const trend = 0.6 + (DAYS - back) / 110;
    const count = Math.floor(rand() * 5 * trend + (day.getUTCDay() === 0 ? 0 : 1));
    for (let i = 0; i < count; i++) {
      const r = rand();
      let acc = 0;
      const service = SERVICE_WEIGHTS.find(([, w]) => (acc += w) >= r)?.[0] ?? "not-sure";
      const first = pick(FIRST, rand());
      const last = pick(LAST, rand());
      const created = new Date(day.getTime() + (6 + Math.floor(rand() * 2)) * 3_600_000 + Math.floor(rand() * 60) * 60_000);
      n += 1;
      // Recent days stay NEW so the badge and "New" cards have something to show.
      const status = back < 4 ? "NEW" : finalStatus(rand());
      const history = [{ from: null, to: "NEW", at: created }];
      let prev = "NEW";
      PATH[status].forEach((to, k) => {
        history.push({ from: prev, to, at: new Date(created.getTime() + (k + 1) * 6 * 3_600_000) });
        prev = to;
      });
      out.push({
        name: `${first} ${last}`,
        email: `${first}.${last}`.toLowerCase() + `${n}@example.com`,
        company: `${last} ${pick(COMPANY, rand())}`,
        services: [service],
        message: pick(MESSAGES[service], rand()),
        status,
        source: pick(SOURCES, rand()),
        statusHistory: history,
        deletedAt: null,
        seed: true,
        createdAt: created,
        updatedAt: history[history.length - 1].at,
      });
    }
  }
  return out;
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000, autoIndex: false, maxPoolSize: 2 });
const enquiries = mongoose.connection.db.collection("enquiries");
try {
  const existing = await enquiries.countDocuments({ seed: true });
  if (existing && !reset) {
    console.log(`${existing} seed enquiries already exist in "${dbName}". Use --reset to replace them.`);
  } else {
    if (reset) console.log(`Removed ${(await enquiries.deleteMany({ seed: true })).deletedCount} previous seed enquiries.`);
    const docs = build();
    await enquiries.insertMany(docs);
    console.log(`Inserted ${docs.length} fictional seed enquiries into "${dbName}" (seed: true).`);
  }
} finally {
  await mongoose.disconnect();
}
