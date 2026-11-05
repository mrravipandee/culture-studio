import type { ReactNode } from "react";

/** Page container — matches the Navbar and Hero edges (max-w-7xl, px-5 / md:px-10). */
export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 md:px-10 ${className}`}>
      {children}
    </div>
  );
}
