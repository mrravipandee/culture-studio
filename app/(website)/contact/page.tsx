import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, contactPageSchema } from "@/lib/schema";
import { contactDescription } from "@/lib/content/contact";
import ContactHero from "@/components/contact/ContactHero";
import ContactEnquiry from "@/components/contact/ContactEnquiry";
import ContactClosing from "@/components/contact/ContactClosing";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  path: "/contact",
  description: contactDescription,
});

/** Contact page (client copy deck, 04 / Contact). Text-only editorial layout. */
export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-paper">
      <JsonLd data={contactPageSchema()} />
      <JsonLd data={breadcrumbSchema([["Contact", "/contact"]])} />
      <Navbar />
      <main className="relative z-0">
        <ContactHero />
        <ContactEnquiry />
        <ContactClosing />
      </main>
    </div>
  );
}
