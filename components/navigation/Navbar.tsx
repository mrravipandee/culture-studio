
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { RippleButton } from "@/registry/magicui/ripple-button";

interface NavbarProps {
  introActive?: boolean;
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
];

export default function Navbar({
  introActive = false,
}: NavbarProps) {
  const pathname = usePathname();

  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);
  const menuTimeline = useRef<gsap.core.Timeline | null>(null);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuOpenRef = useRef(false);
  const introRef = useRef(introActive);
  const visibleRef = useRef(false);

  // Keep intro state synchronized.
  useEffect(() => {
    introRef.current = introActive;

    if (introActive) {
      visibleRef.current = false;
      gsap.to(headerRef.current, {
        yPercent: -110,
        autoAlpha: 0,
        duration: 0.5,
        overwrite: true,
      });
    }
  }, [introActive]);

  // Navbar entrance and scroll controller.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    gsap.set(header, {
      yPercent: -110,
      autoAlpha: 0,
    });

    let lastScroll = window.scrollY;
    let ticking = false;

    const reveal = () => {
      if (introRef.current || menuOpenRef.current) return;

      if (visibleRef.current) return;
      visibleRef.current = true;

      gsap.to(header, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.75,
        ease: "power4.out",
        overwrite: true,
      });
    };

    const hide = () => {
      if (!visibleRef.current) return;
      visibleRef.current = false;

      gsap.to(header, {
        yPercent: -110,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power3.inOut",
        overwrite: true,
      });
    };

    const updateScroll = () => {
      const currentScroll = window.scrollY;
      const delta = currentScroll - lastScroll;

      setScrolled(currentScroll > 30);

      if (introRef.current || menuOpenRef.current) {
        lastScroll = currentScroll;
        ticking = false;
        return;
      }

      if (pathname === "/" && currentScroll <= 20) {
        hide();
      } else if (delta < -4) {
        reveal();
      } else if (delta > 5 && currentScroll > 80) {
        hide();
      }

      lastScroll = currentScroll;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    // Initial state: reveal immediately on subpages or when intro is passed
    if (pathname !== "/" || (!introActive && window.scrollY > 20)) {
      reveal();
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      gsap.killTweensOf(header);
    };
  }, [introActive, pathname]);

  // Mobile menu animation.
  const openMenu = useCallback(() => {
    const menu = menuRef.current;
    const content = menuContentRef.current;

    if (!menu || !content) return;

    menuOpenRef.current = true;
    setMenuOpen(true);

    menuTimeline.current?.kill();

    const links = content.querySelectorAll(".mobile-nav-link");

    gsap.set(menu, {
      autoAlpha: 1,
      pointerEvents: "auto",
    });

    menuTimeline.current = gsap.timeline();

    menuTimeline.current
      .fromTo(
        menu,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 0.8,
          ease: "power4.inOut",
        }
      )
      .fromTo(
        links,
        {
          y: 45,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: "power3.out",
        },
        "-=0.35"
      );
  }, []);

  const closeMenu = useCallback(() => {
    const menu = menuRef.current;
    const content = menuContentRef.current;

    if (!menu || !content) return;

    menuOpenRef.current = false;
    menuTimeline.current?.kill();

    const links = content.querySelectorAll(".mobile-nav-link");

    menuTimeline.current = gsap.timeline({
      onComplete: () => {
        gsap.set(menu, {
          autoAlpha: 0,
          pointerEvents: "none",
        });
        setMenuOpen(false);
      },
    });

    menuTimeline.current
      .to(links, {
        y: -20,
        autoAlpha: 0,
        duration: 0.2,
        stagger: 0.025,
        ease: "power2.in",
      })
      .to(
        menu,
        {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.55,
          ease: "power4.inOut",
        },
        "-=0.05"
      );

  }, []);

  // Keyboard accessibility and body scroll lock.
  useEffect(() => {
    if (!menuOpen) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, closeMenu]);

  // Cleanup mobile animation.
  useEffect(() => {
    return () => {
      menuTimeline.current?.kill();
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop / Main Navbar */}
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-40"
        style={{ visibility: "hidden" }}
      >
        <div className="mx-auto max-w-7xl px-5 py-4 md:px-10">
          <nav
            ref={navRef}
            className={`flex items-center justify-between rounded-full border px-6 py-3 transition-all duration-500 ${scrolled
                ? "border-black/5 bg-[#F9F8F6]/90 shadow-[0_8px_35px_rgba(0,0,0,0.06)] backdrop-blur-2xl"
                : "border-white/20 bg-white/70 backdrop-blur-lg"
              }`}
          >
            {/* Logo */}
            <Link
              href="/"
              className="group relative z-10 text-xl font-light tracking-[0.2em] uppercase text-[#1C1717]"
            >
              CULT
              <span className="font-serif font-bold text-[#240C0E]">
                .
              </span>
              URE
            </Link>

            {/* Desktop Links */}
            <div className="hidden items-center gap-9 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link relative py-2 text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${isActive(link.href)
                      ? "text-[#240C0E]"
                      : "text-neutral-500 hover:text-[#240C0E]"
                    }`}
                >
                  {link.label}

                  <span
                    className={`absolute bottom-0 left-0 h-px bg-[#240C0E] transition-transform duration-500 origin-left ${isActive(link.href)
                        ? "scale-x-100"
                        : "scale-x-0"
                      }`}
                  />
                </Link>
              ))}
            </div>

            {/* Contact CTA */}
            <RippleButton
              href="/services#contact"
              rippleColor="rgba(255, 255, 255, 0.45)"
              className="group hidden items-center gap-2.5 rounded-full bg-[#240C0E] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.16em] !text-white transition-all duration-300 hover:bg-[#3A1518] hover:shadow-[0_6px_20px_rgba(36,12,14,0.25)] active:scale-[0.98] md:inline-flex"
            >
              <span className="!text-white text-white">Get in Touch</span>
              <span className="!text-white text-white text-xs leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </RippleButton>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={openMenu}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
            >
              <span className="h-px w-6 bg-[#240C0E]" />
              <span className="h-px w-4 self-end bg-[#240C0E] transition-all duration-300 group-hover:w-6" />
            </button>
          </nav>
        </div>
      </header>

      {/* Fullscreen Mobile Navigation */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-50 flex flex-col bg-[#F7F5F1] md:hidden"
        style={{
          visibility: "hidden",
          pointerEvents: "none",
          clipPath: "inset(0 0 100% 0)",
        }}
      >
        <div
          ref={menuContentRef}
          className="flex h-full flex-col justify-between px-8 py-10"
        >
          {/* Top */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={closeMenu}
              className="text-xl font-light tracking-[0.2em] text-[#1C1717]"
            >
              CULT<span className="font-serif text-[#240C0E]">.</span>URE
            </Link>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-2xl text-[#240C0E] transition-transform hover:rotate-90"
            >
              ×
            </button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-5">
            <span className="mb-3 text-[10px] uppercase tracking-[0.3em] text-neutral-400">
              Navigation
            </span>

            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`mobile-nav-link flex items-center justify-between border-b border-black/10 pb-4 text-4xl font-light uppercase tracking-tight ${isActive(link.href)
                    ? "text-[#240C0E]"
                    : "text-neutral-800"
                  }`}
              >
                {link.label}
                <span className="text-sm text-neutral-400">
                  0{index + 1}
                </span>
              </Link>
            ))}
          </div>

          {/* Bottom */}
          <div className="mobile-nav-link">
            <p className="mb-5 text-xs tracking-wide text-neutral-500">
              Have a project in mind?
            </p>

            <RippleButton
              href="/services#contact"
              onClick={closeMenu}
              rippleColor="rgba(255, 255, 255, 0.45)"
              className="flex w-full items-center justify-between rounded-full bg-[#240C0E] px-7 py-5 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#3A1518]"
            >
              <span>Let&apos;s Talk</span>
              <span>↗</span>
            </RippleButton>

            <p className="mt-8 text-[9px] uppercase tracking-[0.25em] text-neutral-400">
              CULT.URE — Creative Digital Experiences
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
