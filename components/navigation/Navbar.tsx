"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/site-button";
import { EASE } from "@/lib/motion";
import { brand, contactCta, isActivePath, primaryNav } from "@/lib/navigation";
import Wordmark from "./Wordmark";

interface NavbarProps {
  /** Home only: keeps the bar hidden while the cinematic intro plays. */
  introActive?: boolean;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Floating navbar + full height mobile menu.
 * - Hides on scroll down, returns on scroll up (rAF throttled, passive listener).
 * - On "/" it stays hidden at the very top and during the intro.
 * - Reveals whenever it receives keyboard focus, so it is never focus trapped off screen.
 * - Mobile menu is a modal dialog: focus trap, Escape, scroll lock, focus returns to the toggle.
 */
export default function Navbar({ introActive = false }: NavbarProps) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const menuId = useId();

  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuOpenRef = useRef(false);
  const introRef = useRef(introActive);

  useEffect(() => {
    introRef.current = introActive;
  }, [introActive]);

  // Close the menu on navigation (render time state adjustment, no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  // Scroll controller.
  useEffect(() => {
    const isHome = pathname === "/";
    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const delta = y - last;
      setScrolled(y > 24);

      if (!introRef.current && !menuOpenRef.current) {
        if (isHome && y <= 20) setVisible(false);
        else if (delta < -4) setVisible(true);
        else if (delta > 6 && y > 96) setVisible(false);
      }
      last = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    // Initial state: visible on sub pages, or on home once scrolled past the intro.
    const init = window.setTimeout(() => {
      setScrolled(window.scrollY > 24);
      if (!introRef.current && (!isHome || window.scrollY > 20)) setVisible(true);
    }, 0);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(init);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname, introActive]);

  const closeMenu = useCallback((restoreFocus = true) => {
    setMenuOpen(false);
    if (restoreFocus) requestAnimationFrame(() => toggleRef.current?.focus());
  }, []);

  // Close when resizing up to desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Modal behaviour while open.
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";

    const items = () => [toggleRef.current, ...(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(Boolean) as HTMLElement[];
    requestAnimationFrame(() => items()[1]?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return closeMenu();
      if (e.key !== "Tab") return;
      const list = items();
      const first = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, closeMenu]);

  const shown = (visible && !introActive) || menuOpen;
  const step = Math.min(0.06, 0.4 / (primaryNav.length + 1));

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 pt-4"
        initial={false}
        animate={shown ? { y: 0, opacity: 1 } : { y: "-110%", opacity: 0 }}
        transition={{ duration: shown ? 0.6 : 0.4, ease: EASE }}
        onFocusCapture={() => !introRef.current && setVisible(true)}
        style={{ pointerEvents: shown ? "auto" : "none" }}
      >
        <div className="container-content">
          <nav
            aria-label="Primary"
            className={`flex h-14 items-center justify-between rounded-full border pr-2 pl-6 backdrop-blur-xl transition-colors duration-300 ease-editorial ${
              scrolled || menuOpen ? "border-line bg-paper/85" : "border-transparent bg-paper/60"
            }`}
          >
            <Wordmark onClick={() => menuOpen && closeMenu(false)} />

            <ul className="hidden items-center gap-8 md:flex">
              {primaryNav.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`link title-4 transition-colors duration-300 ease-editorial ${active ? "text-ink" : "text-ink-3 hover:text-ink"}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Button href={contactCta.href} variant="burgundy" size="sm" icon="arrow" className="hidden md:inline-flex">
              {contactCta.label}
            </Button>

            {/* Mobile toggle: two lines morph into a cross. */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="relative grid size-11 place-items-center rounded-full md:hidden"
            >
              <motion.span
                aria-hidden="true"
                className="absolute h-px w-5 bg-ink"
                initial={false}
                animate={menuOpen ? { y: 0, rotate: 45 } : { y: -4, rotate: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              />
              <motion.span
                aria-hidden="true"
                className="absolute h-px w-5 origin-center bg-ink"
                initial={false}
                animate={menuOpen ? { y: 0, rotate: -45, scaleX: 1 } : { y: 4, rotate: 0, scaleX: 0.6 }}
                transition={{ duration: 0.5, ease: EASE }}
              />
            </button>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={panelRef}
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-lenis-prevent
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-paper/95 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE } }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="container-content flex min-h-full flex-col justify-between gap-12 pt-28 pb-10">
              <nav aria-label="Mobile">
                <p className="eyebrow mb-6 text-ink-3">Menu</p>
                <ul className="grid">
                  {primaryNav.map((link, i) => {
                    const active = isActivePath(pathname, link.href);
                    return (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE, delay: 0.08 + i * step }}
                        className="border-b border-line"
                      >
                        <Link
                          href={link.href}
                          onClick={() => closeMenu(false)}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-baseline justify-between py-4 heading-3 transition-colors duration-300 ease-editorial ${active ? "text-burgundy" : "text-ink"}`}
                        >
                          {link.label}
                          <span className="font-mono caption-5 text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.08 + primaryNav.length * step }}
                className="grid gap-6"
              >
                <p className="body-6 max-w-xs text-ink-2">{brand.tagline}</p>
                <Button href={contactCta.href} variant="burgundy" size="lg" icon="badge" className="w-full justify-between" onClick={() => closeMenu(false)}>
                  {contactCta.label}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
