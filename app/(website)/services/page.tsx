import type { Metadata } from "next";
import Navbar from "@/components/navigation/Navbar";

export const metadata: Metadata = {
  title: "Services",
  description: "Personal branding, cultural positioning and media production for founders and leaders.",
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-light text-black">Services</h1>
        <p className="mt-4 text-ink-2">
          Personal branding, cultural positioning, and media production.
        </p>
      </main>
    </>
  );
}

