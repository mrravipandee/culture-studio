import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import ServicesHero from "@/components/services/ServicesHero";
import ServiceIndex from "@/components/services/ServiceIndex";
import ServiceChapter from "@/components/services/ServiceChapter";
import ServicesProcess from "@/components/services/ServicesProcess";
import ServicesFaq from "@/components/services/ServicesFaq";
import ServicesCta from "@/components/services/ServicesCta";
import { disciplines } from "@/lib/content/disciplines";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, servicesSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  path: "/services",
  description:
    "CULT.URE works primarily with B2B businesses across brand strategy, content, digital marketing and technology. Four disciplines and 26 services, commissioned individually or together.",
});

export default function ServicesPage() {
  return (
    <div className="relative min-h-screen bg-paper">
      <JsonLd data={servicesSchema()} />
      <JsonLd data={breadcrumbSchema([["Services", "/services"]])} />
      <Navbar />
      <main className="relative z-0">
        <ServicesHero />
        <ServiceIndex />
        {disciplines.map((discipline, i) => (
          <ServiceChapter key={discipline.id} discipline={discipline} index={i} />
        ))}
        <ServicesProcess />
        <ServicesFaq />
        <ServicesCta />
      </main>
    </div>
  );
}
