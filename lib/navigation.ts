import { caseStudiesEnabled } from "@/lib/content/case-studies-publishing";

export type NavLink = { label: string; href: string };

/** Case Studies links appear only once a case study is explicitly published. */
const visible = (link: NavLink) => link.href !== "/case-studies" || caseStudiesEnabled;

/** Primary navigation: Navbar, mobile menu and the 404 page read from here. */
export const primaryNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Case studies", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
].filter(visible);

/** Footer "Explore" list: labels and order from the client copy deck (05 / Footer). */
export const footerNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Contact", href: "/contact" },
].filter(visible);

/** The one site wide conversion action: the Contact page (enquiry form), never a mailto. */
export const contactCta: NavLink = { label: "Get in touch", href: "/contact" };

export const brand = {
  name: "CULT.URE",
  tagline: "Beyond the noise. Into the culture.",
  /** Footer description (client copy deck, 05 / Footer). */
  description:
    "A B2B-focused marketing agency working across brand strategy, communications, content, digital growth and technology.",
  /** Mobile menu line (approved short form). */
  short: "A B2B-focused marketing agency. Beyond the noise. Into the culture.",
};

/** True for "/" only on the home page, prefix match elsewhere. */
export const isActivePath = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
