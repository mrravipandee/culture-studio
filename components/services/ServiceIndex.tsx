import Link from "next/link";
import { serviceCategories, serviceHref, services } from "@/lib/content/service-catalog";
import { Reveal } from "@/components/motion";

/** Table of contents for /services: four categories, nine services, all linked to their sections. */
export default function ServiceIndex() {
  return (
    <nav aria-labelledby="service-index-title" className="section-sm surface-paper">
      <div className="container-content">
        <h2 id="service-index-title" className="eyebrow text-burgundy">
          Four disciplines · Nine services
        </h2>
        <ol className="mt-10 grid border-t border-line md:grid-cols-2 lg:grid-cols-4">
          {serviceCategories.map((category, i) => (
            <Reveal
              as="li"
              key={category.id}
              delay={i * 0.06}
              distance={16}
              className="border-b border-line py-8 md:px-6 md:first:pl-0 lg:border-b-0 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-line"
            >
              <Link href={serviceHref(category.id)} className="group block">
                <span className="eyebrow text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="title-1 mt-3 block text-ink transition-colors duration-300 ease-editorial group-hover:text-burgundy">
                  {category.name}
                </span>
              </Link>
              <ul className="mt-4 grid gap-2">
                {category.services.map((id) => (
                  <li key={id}>
                    <Link href={serviceHref(id)} className="link body-6 text-ink-2 hover:text-ink">
                      {services[id].name}
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
