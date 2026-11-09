import type { Metadata } from "next";
import Navbar from "@/components/navigation/Navbar";
import ServicesHero from "@/components/services/ServicesHero";
import ServiceIndex from "@/components/services/ServiceIndex";
import ServiceChapter from "@/components/services/ServiceChapter";
import ServicesProcess from "@/components/services/ServicesProcess";
import ServicesFaq from "@/components/services/ServicesFaq";
import ServicesCta from "@/components/services/ServicesCta";
import { serviceCategories } from "@/lib/content/service-catalog";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Nine services across brand, marketing, search and technology: Social Media Marketing, Email & Lifecycle Marketing, Personal Branding & LinkedIn Marketing, SEO, GEO & AEO, AI & Business Automation, Website Design & Development, Performance & Growth Marketing, E-commerce Marketing & Growth, and PR & Event Marketing.",
};

export default function ServicesPage() {
  return (
    <div className="relative min-h-screen bg-paper">
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
