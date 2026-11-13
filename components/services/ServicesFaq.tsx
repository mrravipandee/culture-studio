"use client";

import { useState } from "react";
import { servicesFaq, servicesFaqIntro } from "@/lib/content/services";
import Container from "@/components/home/shared/Container";
import { Plus } from "lucide-react";

export default function ServicesFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40 bg-white text-ink border-b border-black/10">
      <Container>
        {/* Section Header */}
        <div className="border-b border-black/10 pb-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-burgundy font-semibold">
            {servicesFaqIntro.eyebrow}
          </p>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <h2 className="lg:col-span-8 text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.08] text-ink">
              {servicesFaqIntro.title}{" "}
              <span className="font-serif italic font-normal text-burgundy">
                {servicesFaqIntro.titleAccent}
              </span>
            </h2>
          </div>
        </div>

        {/* Accessible Accordion List */}
        <div className="mt-12 lg:mt-16 divide-y divide-black/10 border-b border-black/10">
          {servicesFaq.map((item, index) => {
            const isOpen = openIndex === index;
            const id = `faq-${index}`;
            const headerId = `faq-header-${index}`;

            return (
              <div key={item.question} className="py-6 sm:py-8 group">
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex items-baseline gap-4 sm:gap-8 pr-4">
                    <span className="font-mono text-xs sm:text-sm text-ink-3 group-hover:text-burgundy transition-colors shrink-0">
                      0{index + 1}
                    </span>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-light tracking-tight text-ink group-hover:text-burgundy transition-colors">
                      {item.question}
                    </h3>
                  </div>

                  {/* Plus / Minus indicator button */}
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full border border-black/15 text-black transition-[transform,background-color,border-color,color] duration-500 ease-editorial ${
                      isOpen
                        ? "bg-black text-white rotate-45 border-black"
                        : "group-hover:border-burgundy group-hover:text-burgundy"
                    }`}
                    aria-hidden="true"
                  >
                    <Plus size={16} />
                  </span>
                </button>

                {/* Collapsible Answer Region with Smooth Height */}
                <div
                  id={id}
                  role="region"
                  aria-labelledby={headerId}
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-editorial ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 pt-5"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden pl-8 sm:pl-14">
                    <p className="text-sm sm:text-base font-light leading-relaxed text-ink-2 max-w-2xl">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

