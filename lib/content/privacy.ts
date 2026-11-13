/**
 * CULT.URE — /privacy-policy (FIRST DRAFT, not published).
 *
 * Public-facing content contains ONLY technical facts verified in the code audit:
 * the enquiry form fields, the form's current disabled state, the absence of
 * project-owned cookies / browser storage / analytics / tracking, and the direct
 * contact details. The page is noindex/nofollow, not in the sitemap and not linked
 * from the Footer or the enquiry form until the policy is completed and approved.
 *
 * PENDING (client / legal advisor) — deliberately NOT shown on the page:
 *  - Legal business name / entity and registration details
 *  - Registered address, country and applicable jurisdictions / laws
 *  - Privacy contact for requests (confirm whether the Gmail address is used)
 *  - Hosting provider and any server logs it keeps
 *  - Form backend provider (once chosen) and where enquiries are stored
 *  - Data retention period
 *  - Purposes beyond responding to enquiries (e.g. marketing) and consent
 *  - Internal access and sharing with external service providers
 *  - Rights of individuals and how to exercise them (legal review)
 *  - Security practices that can be accurately stated (no certifications/guarantees)
 *  - Plans for future analytics / cookies (may require a cookie notice)
 *  - Effective / last-updated date
 */

import { contact } from "./home";
import { disciplines } from "./disciplines";

export const privacyHero = {
  eyebrow: "PRIVACY POLICY",
  headline: "Privacy Policy",
  lead: "This page explains what information the CULT.URE website asks for and how enquiries are currently handled.",
  /** Shown while the policy is incomplete. */
  draftNote:
    "This policy is being finalised. Further details will be added once they are confirmed.",
};

export type PrivacyField = {
  label: string;
  required: boolean;
  purpose: string;
};

/** Mirrors the fields in components/home/sections/InquiryForm.tsx (labels as shown on the form). */
export const formFields: PrivacyField[] = [
  { label: "Name", required: true, purpose: "To know who the enquiry is from and how to address the reply." },
  { label: "Work email", required: true, purpose: "To reply to the enquiry." },
  { label: "Company / Organisation", required: false, purpose: "To understand the business the enquiry relates to." },
  { label: "Website", required: false, purpose: "To understand the business's existing online presence." },
  {
    label: "Services of interest",
    required: true,
    purpose: `To direct the enquiry to the relevant area: ${disciplines.map((d) => d.name).join(", ")}, or "Not sure yet".`,
  },
  {
    label: "What are you looking to achieve?",
    required: false,
    purpose: "To understand the requirement, so the response can be directed towards the right next step.",
  },
];

export const privacySections = {
  collected: {
    title: "Information requested by the enquiry form",
    intro:
      "The enquiry form on the Contact page (also shown on the About page) asks for the following information:",
  },
  formStatus: {
    title: "Current status of the enquiry form",
    body: [
      "The enquiry form is not yet connected to a submission service. Its submit button is disabled, so the form cannot be sent.",
      "Information typed into the form is not submitted or stored by the website. It remains only in your browser and is cleared when the page is closed or reloaded.",
    ],
  },
  direct: {
    title: "Contacting CULT.URE directly",
    body: [
      `You can contact CULT.URE by email at ${contact.email} (a Gmail address) or by phone on ${contact.phone.display}.`,
      "The email and phone links on this website open your own email or phone app. The website does not receive or store anything when you use them; your message goes directly to the address or number you contact.",
    ],
  },
  cookies: {
    title: "Cookies, browser storage and analytics",
    body: [
      "The website's own code does not set cookies, does not use browser storage (such as local storage or session storage), and does not include analytics or tracking tools.",
      "Fonts, images and video on the website are served from the website itself rather than from third-party services.",
    ],
  },
};

export const privacyDescription =
  "What information the CULT.URE website asks for, and how enquiries are currently handled.";
