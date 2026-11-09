import Container from "@/components/home/shared/Container";
import { aboutApproach } from "@/lib/content/about";

export default function AboutApproach() {
  const { eyebrow, title, lead, steps } = aboutApproach;

  return (
    <section className="py-24 sm:py-32 bg-ink text-white relative">
      <Container>
        {/* Header */}
        <div className="border-b border-white/15 pb-8">
          <p className="font-mono text-xs uppercase tracking-eyebrow text-paper-3">
            [ {eyebrow} ]
          </p>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <h2 className="lg:col-span-8 text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1]">
              {title}
            </h2>
            <p className="lg:col-span-4 text-base font-light text-white/70 leading-relaxed">
              {lead}
            </p>
          </div>
        </div>

        {/* 4 Stages Progression */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.step}
              className="border-t border-white/20 pt-8 flex flex-col justify-between group hover:border-white transition-colors"
            >
              <div>
                <span className="font-mono text-xs text-white/40 tracking-eyebrow uppercase block mb-4">
                  STAGE {step.step}
                </span>

                <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                  {step.name}
                </h3>

                <p className="mt-2 text-xs font-mono uppercase tracking-eyebrow text-paper-3">
                  {step.tagline}
                </p>

                <p className="mt-6 text-sm font-light text-white/65 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="font-mono text-xs uppercase tracking-eyebrow text-white/40 mb-3">
                  TYPICAL OUTPUTS
                </h4>
                <ul className="space-y-2">
                  {step.deliverables.map((item) => (
                    <li
                      key={item}
                      className="text-xs font-light text-white/80 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-white/40" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

