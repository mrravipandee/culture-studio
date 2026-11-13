import Link from "next/link";
import { disciplineHref, disciplines, serviceCount } from "@/lib/content/disciplines";
import { Reveal } from "@/components/motion";

/** Table of contents for /services: four disciplines, 26 services, all linked to their sections. */
export default function ServiceIndex() {
  return (
    <nav aria-labelledby="service-index-title" className="section-sm surface-paper">
      <div className="container-content">
        <h2 id="service-index-title" className="eyebrow text-burgundy">
          Four disciplines · {serviceCount} services
        </h2>
        <ol className="mt-10 grid border-t border-line md:grid-cols-2 lg:grid-cols-4">
          {disciplines.map((discipline, i) => (
            <Reveal
              as="li"
              key={discipline.id}
              delay={i * 0.06}
              distance={16}
              className="border-b border-line py-8 md:px-6 md:first:pl-0 lg:border-b-0 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-line"
            >
              <Link href={disciplineHref(discipline.id)} className="group block">
                <span className="eyebrow text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="title-1 mt-3 block text-ink transition-colors duration-300 ease-editorial group-hover:text-burgundy">
                  {discipline.name}
                </span>
              </Link>
              <p className="body-6 mt-3 text-ink-2">{discipline.indexLine}</p>
              <ul className="mt-5 grid gap-2 border-t border-line pt-5">
                {discipline.services.map((service) => (
                  <li key={service.id}>
                    <Link href={disciplineHref(service.id)} className="link body-6 min-h-6 py-0.5 text-ink-2 hover:text-ink">
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
      </div>
    </nav>
  );
}
