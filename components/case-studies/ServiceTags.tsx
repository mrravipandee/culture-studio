import Link from "next/link";
import { serviceHref, services, type ServiceId } from "@/lib/content/service-catalog";

/** Official service labels for a project, linked to their sections on /services. */
export function ServiceTags({ ids, tone = "light", className = "" }: { ids: ServiceId[]; tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  return (
    <ul aria-label="Services" className={`flex flex-wrap gap-2 ${className}`}>
      {ids.map((id) => (
        <li key={id}>
          <Link
            href={serviceHref(id)}
            className={`caption-4 inline-block rounded-full border px-3 py-1 transition-colors duration-300 ease-editorial ${
              dark ? "border-line-inverse text-paper-2 hover:text-paper" : "border-line-strong text-ink-2 hover:border-burgundy hover:text-burgundy"
            }`}
          >
            {services[id].name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Visible label for entries that are layout samples, not confirmed projects. */
export function SampleBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`eyebrow inline-flex items-center gap-2 rounded-full border border-dashed border-line-strong px-3 py-1 text-ink-3 ${className}`}>
      Sample project — details to be confirmed
    </span>
  );
}
