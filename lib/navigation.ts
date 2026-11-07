import { contact } from "@/lib/content/home";

export type NavLink = { label: string; href: string };

/** Primary navigation: Navbar, mobile menu and footer read from here. */
export const primaryNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Case studies", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
];

/** The one site wide conversion action. */
export const contactCta: NavLink = contact.email
  ? { label: "Get in touch", href: `mailto:${contact.email}` }
  : { label: "Get in touch", href: "/#contact" };

export const brand = {
  name: "CULT.URE",
  tagline: "Personal branding for founders and leaders who would rather be remembered than seen.",
};

/** True for "/" only on the home page, prefix match elsewhere. */
export const isActivePath = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
