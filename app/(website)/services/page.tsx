import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import ServicesHero from "@/components/services/ServicesHero";
import ServiceIndex from "@/components/services/ServiceIndex";
import ServiceChapter from "@/components/services/ServiceChapter";
import ServicesProcess from "@/components/services/ServicesProcess";
import ServicesFaq from "@/components/services/ServicesFaq";
import ServicesCta from "@/components/services/ServicesCta";
import { serviceCategories } from "@/lib/content/service-catalog";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, servicesSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  path: "/services",
  description:
    "Nine services in four disciplines: brand and presence, digital marketing and growth, search and customer engagement, and technology and experience. See what each includes.",
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
        {serviceCategories.map((category, i) => (
          <ServiceChapter key={category.id} category={category} index={i} />
        ))}
        <ServicesProcess />
        <ServicesFaq />
        <ServicesCta />
      </main>
    </div>
  );
}
