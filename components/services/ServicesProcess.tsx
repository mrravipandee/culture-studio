import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import SectionHeader from "@/components/editorial/SectionHeader";
import { H3, HEADER_GAP, INDEX, META, SMALL } from "@/components/editorial/type";
import { serviceProcess, servicesProcessIntro } from "@/lib/content/services";

/** "[ 05 / OUR PROCESS ]" → { index: "05", label: "OUR PROCESS" } (presentation only). */
export const splitEyebrow = (raw: string) => {
  const m = raw.match(/^\[\s*(\d+)\s*\/\s*(.+?)\s*\]$/);
  return m ? { index: m[1], label: m[2] } : { index: "", label: raw };
};

/**
 * 05 — Our Process (warm ivory band). Four stages in an editorial row with thin vertical
 * rules on desktop, two columns on tablet, stacked on mobile; each lists its deliverables.
 */
export default function ServicesProcess() {
  const { index, label } = splitEyebrow(servicesProcessIntro.eyebrow);

  return (
    <section aria-labelledby="services-process-title" className="section bg-[var(--cream)]">
      <Container>
        <SectionHeader
          index={index}
          eyebrow={label}
          title={servicesProcessIntro.title}
          titleAccent={servicesProcessIntro.titleAccent}
          titleId="services-process-title"
          intro={[servicesProcessIntro.description]}
        />

        <RevealGroup as="ol" count={4} className={`${HEADER_GAP} grid grid-cols-1 border-t border-black/10 md:grid-cols-2 lg:grid-cols-4`}>
          {serviceProcess.map((stage, i) => (
            <RevealItem
              as="li"
              key={stage.number}
              className={[
                "border-b border-black/10 py-8 md:py-10 lg:border-b-0 lg:px-8 lg:py-12",
                i % 2 === 1 ? "md:border-l md:pl-8" : "md:pr-8",
                i > 0 ? "lg:border-l" : "lg:pl-0",
                i === 3 ? "lg:pr-0" : "",
              ].join(" ")}
            >
              <p className={INDEX}>{stage.number}</p>
              <h3 className={`${H3} mt-6`}>{stage.name}</h3>
              <p className={`${META} mt-2`}>{stage.tagline}</p>
              <p className={`${SMALL} mt-4`}>{stage.summary}</p>
              <ul className="mt-6 border-t border-black/10 pt-4" aria-label={`${stage.name} deliverables`}>
                {stage.deliverables.map((d) => (
                  <li key={d} className="flex gap-3 py-1.5 text-[0.875rem] leading-snug text-black/80">
                    <span aria-hidden="true" className="mt-[0.55em] h-px w-3 shrink-0 bg-burgundy" />
                    {d}
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
