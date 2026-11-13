/**
 * CULT.URE — /contact page copy.
 *
 * Source of truth: client copy deck "CULTURE_Complete_Website_Copy_B2B.pdf" (04 / Contact).
 * Section order follows the PDF: Contact (hero), Direct Enquiries, Tell Us About the
 * Project (enquiry form), A good place to begin, closing line.
 *
 * Verified contact details (phone, email) live in lib/content/home.ts and the domain in
 * lib/site.ts. Social profiles are named in the copy deck without URLs, so none are shown.
 * No address, office location, business hours or response time: none are provided.
 */

export const contactHero = {
  eyebrow: "CONTACT",
  headline: "Start with the business objective.",
  lead: [
    "Every engagement begins with a conversation about what needs to change, what the business wants to achieve and what the work will require.",
    "Share a little about the brief. CULT.URE will take it from there.",
  ],
};

export const contactEnquiry = {
  /** Heading above the enquiry form (PDF wording and capitalisation). */
  formTitle: "Tell Us About the Project",
  detailsTitle: "Direct Enquiries",
};

export const contactClosing = {
  title: "A good place to begin.",
  body: "Not every brief arrives fully defined. If the objective is clear but the solution is not, that is a perfectly good starting point.",
  tagline: "CULT.URE — Beyond the noise. Into the culture.",
};

/** Page metadata description (PDF hero wording). */
export const contactDescription =
  "Start with the business objective. Every engagement begins with a conversation about what needs to change, what the business wants to achieve and what the work will require.";
