"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/motion";
import Container from "@/components/home/shared/Container";
import SectionHeader from "@/components/editorial/SectionHeader";
import { HEADER_GAP, INDEX, SMALL } from "@/components/editorial/type";
import { servicesFaq, servicesFaqIntro } from "@/lib/content/services";
import { splitEyebrow } from "./ServicesProcess";

/**
 * 06 — FAQ. Accessible accordion (button + region, aria-expanded/controls), aligned with the
 * header's title column. One answer open at a time; the first is open initially.
 * Height animates with a grid-rows transition (instant under reduced motion).
 */
export default function ServicesFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();
  const { index, label } = splitEyebrow(servicesFaqIntro.eyebrow);

  return (
    <section aria-labelledby="services-faq-title" className="section bg-white">
      <Container>
        <SectionHeader index={index} eyebrow={label} title={servicesFaqIntro.title} titleAccent={servicesFaqIntro.titleAccent} titleId="services-faq-title" />

        <div className={`${HEADER_GAP} grid grid-cols-1 lg:grid-cols-12 lg:gap-8`}>
          <RevealGroup as="ul" count={6} className="border-t border-black/10 lg:col-span-8 lg:col-start-5">
            {servicesFaq.map((item, i) => {
              const open = openIndex === i;
              const buttonId = `${baseId}-q${i}`;
              const panelId = `${baseId}-a${i}`;
              return (
                <RevealItem as="li" key={item.question} className="border-b border-black/10">
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(open ? null : i)}
                      className="group flex w-full items-start gap-4 py-6 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-burgundy sm:gap-6"
                    >
                      <span className={`${INDEX} w-6 shrink-0 pt-1`}>{String(i + 1).padStart(2, "0")}</span>
                      <span className={`flex-1 text-base font-semibold leading-snug transition-colors duration-200 sm:text-lg ${open ? "text-burgundy" : "text-black group-hover:text-burgundy"}`}>
                        {item.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`grid size-8 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-300 motion-reduce:transition-none ${
                          open ? "rotate-45 border-burgundy bg-burgundy text-white" : "border-black/15 text-black group-hover:border-burgundy"
                        }`}
                      >
                        <Plus size={15} strokeWidth={1.6} />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden" inert={!open}>
                      <p className={`${SMALL} max-w-[64ch] pb-7 pl-10 sm:pl-12`}>{item.answer}</p>
                    </div>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
