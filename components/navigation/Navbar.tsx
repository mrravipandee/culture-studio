"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface NavbarProps {
  introActive?: boolean;
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
];

export default function Navbar({ introActive = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Reveal navbar when user scrolls down at all
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount in case user lands mid-page
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Navbar is hidden during the cinematic intro
  // When intro ends, it reveals cleanly on scroll (or stays seamlessly integrated)
  const isVisible = !introActive && scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-4 md:px-12">
          <nav className="flex items-center justify-between rounded-full border border-black/5 bg-white/80 px-6 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
            {/* Logo */}
            <Link
              href="/"
              className="text-lg font-light tracking-[0.2em] uppercase text-black hover:opacity-80 transition-opacity"
            >
              <span>CULT</span>
              <span className="text-[#240c0e] font-serif font-bold">.</span>
              <span>URE</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs uppercase tracking-[0.18em] text-neutral-600 hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Contact CTA */}
            <div className="hidden md:flex items-center">
              <Link
                href="/services#contact"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#240c0e] px-5 py-2 text-xs uppercase tracking-[0.18em] text-white transition-all hover:bg-[#3a1518]"
              >
                <span>Get in Touch</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              <span
                className={`block h-0.5 w-5 bg-black transition-transform duration-300 ${
                  mobileMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-black transition-opacity duration-300 ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-black transition-transform duration-300 ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 bg-white/95 backdrop-blur-xl md:hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-full flex-col justify-between px-8 py-12">
          {/* Top Bar inside Mobile Drawer */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-light tracking-[0.2em] uppercase text-black">
              CULT<span className="text-[#240c0e] font-serif">.</span>URE
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-2xl font-light text-black hover:opacity-60"
              aria-label="Close Navigation Menu"
            >
              &times;
            </button>
          </div>

          {/* Links */}
          <div className="flex flex-col space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-light uppercase tracking-[0.2em] text-neutral-800 hover:text-[#240c0e] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Bottom Action */}
          <div>
            <Link
              href="/services#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full rounded-full bg-[#240c0e] py-4 text-center text-xs uppercase tracking-[0.2em] text-white"
            >
              Get in Touch &rarr;
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

