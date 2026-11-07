import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "./Arrow";

type Variant = "primary" | "burgundy" | "secondary" | "inverse";
type Size = "sm" | "md" | "lg";
/** "arrow": inline arrow that nudges · "badge": arrow in a circle that rotates · "none" */
type Icon = "arrow" | "badge" | "none";

const VARIANT: Record<Variant, string> = {
  primary: "btn-primary",
  burgundy: "btn-burgundy",
  secondary: "btn-secondary",
  inverse: "btn-inverse",
};
const SIZE: Record<Size, string> = { sm: "btn-sm", md: "", lg: "btn-lg" };
/** Badge colour contrasts with the button fill. */
const BADGE: Record<Variant, string> = {
  primary: "bg-paper text-ink",
  burgundy: "bg-paper text-burgundy",
  secondary: "bg-ink text-paper",
  inverse: "bg-ink text-paper",
};

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: Icon;
  className?: string;
}

type LinkProps = BaseProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;
type NativeProps = BaseProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

/**
 * The single button for CULT.URE. Renders a Next <Link> for internal hrefs,
 * <a> for external/mailto, and <button> without href. Styling comes from the
 * design system (.btn + tone + size); hover, press and focus are CSS only.
 */
export function Button(props: LinkProps | NativeProps) {
  const { children, variant = "primary", size = "md", icon = "none", className = "", ...rest } = props;
  const classes = ["btn", VARIANT[variant], SIZE[size], icon === "badge" ? "pr-4" : "", className].filter(Boolean).join(" ");

  const content = (
    <>
      <span>{children}</span>
      {icon === "arrow" && <ArrowUpRight className="btn-arrow size-4" />}
      {icon === "badge" && (
        <span className={`btn-badge ${BADGE[variant]}`}>
          <ArrowUpRight className="size-4" />
        </span>
      )}
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...anchor } = rest as LinkProps;
    if (isExternal(href)) {
      const newTab = href.startsWith("http");
      return (
        <a href={href} className={classes} {...(newTab ? { target: "_blank", rel: "noreferrer noopener" } : {})} {...anchor}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchor}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...button } = rest as Omit<NativeProps, keyof BaseProps>;
  return (
    <button type={type} className={classes} {...button}>
      {content}
    </button>
  );
}

/** Editorial inline link: underline draws in on hover/focus, stays on the current page. */
export function TextLink({
  href,
  children,
  arrow = false,
  className = "",
  ...rest
}: { href: string; children: ReactNode; arrow?: boolean; className?: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">) {
  const classes = `link ${className}`;
  const content = (
    <>
      {children}
      {arrow && <ArrowUpRight className="btn-arrow size-3.5" />}
    </>
  );
  return isExternal(href) ? (
    <a href={href} className={classes} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {})} {...rest}>
      {content}
    </a>
  ) : (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}
