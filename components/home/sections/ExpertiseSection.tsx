import { expertise, trustedBy } from "@/lib/content/home";
import Container from "../shared/Container";
import ImageFrame from "../shared/ImageFrame";
import SectionHeading from "../shared/SectionHeading";
import ScrollReveal from "../shared/ScrollReveal";
import LogoMarquee from "@/components/motion/LogoMarquee";
import { CurtainReveal, LineDraw, StaggerItem, StaggerList } from "@/components/motion/Stagger";

/** 04 — Expertise: alternating editorial rows, one per service. */
export default function ExpertiseSection() {
  return (
    <section
      id="expertise"
      aria-labelledby="expertise-title"
      className="section-padding scroll-mt-24 bg-white"
    >
      <Container>
        <ScrollReveal>
          <SectionHeading intro={expertise.intro} titleId="expertise-title" />
        </ScrollReveal>

        {/* Trusted by: logo marquee */}
        <LogoMarquee
          label={trustedBy.label}
          logos={trustedBy.logos}
          speed={18}
          className="mt-16 lg:mt-24"
        />

        <div className="mt-16 lg:mt-24 space-y-12">
          {expertise.services.map((service, index) => {
            const flipped = index % 2 === 1;

            return (
              <ScrollReveal
                key={service.id}
                delay={0.1}
                distance={32}
              >
                <article
                  id={service.id}
                  aria-labelledby={`${service.id}-title`}
                  className="relative grid gap-8 py-10 md:grid-cols-12 md:gap-8 lg:py-14"
                >
                  <LineDraw className="absolute inset-x-0 top-0 bg-black/10" />
                  <div
                    className={`flex flex-col md:col-span-6 ${
                      flipped ? "md:order-2 md:col-start-7" : ""
                    }`}
                  >
                    <span className="font-mono text-[11px] tracking-[0.2em] text-brand-burgundy">
                      {String(index + 1).padStart(2, "0")} / {String(expertise.services.length).padStart(2, "0")}
                    </span>
                    <h3
                      id={`${service.id}-title`}
                      className="mt-4 text-3xl font-light tracking-[-0.02em] text-black sm:text-4xl"
                    >
                      {service.title}
                    </h3>
                    <p className="mt-4 max-w-lg leading-relaxed font-light text-neutral-600">
                      {service.description}
                    </p>

                    <StaggerList className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3 text-sm text-neutral-800 sm:grid-cols-2 md:mt-auto md:pt-8">
                      {service.includes.map((item) => (
                        <StaggerItem key={item} className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-brand-burgundy"
                          />
                          {item}
                        </StaggerItem>
                      ))}
                    </StaggerList>
                  </div>

                  <div
                    className={`md:col-span-5 ${
                      flipped ? "md:order-1 md:col-start-1" : "md:col-start-8"
                    }`}
                  >
                    <CurtainReveal className="rounded-lg">
                      <ImageFrame
                        image={service.image}
                        aspect="aspect-[4/3]"
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className="rounded-lg shadow-sm"
                      />
                    </CurtainReveal>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
