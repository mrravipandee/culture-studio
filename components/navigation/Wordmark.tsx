import Link from "next/link";

/** CULT.URE wordmark. Burgundy full stop is the only accent. */
export default function Wordmark({ tone = "ink", onClick }: { tone?: "ink" | "paper"; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="CULT.URE, home"
      className={`title-2 rounded-sm uppercase tracking-eyebrow ${tone === "ink" ? "text-ink" : "text-paper"}`}
    >
      CULT<span className={tone === "ink" ? "text-burgundy" : "text-paper-3"}>.</span>URE
    </Link>
  );
}
