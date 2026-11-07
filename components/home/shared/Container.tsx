import type { ReactNode } from "react";

/** Page container: design token `container-content` (1280px, responsive --gutter). Shares edges with Navbar and Hero. */
export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`container-content ${className}`}>
      {children}
    </div>
  );
}
