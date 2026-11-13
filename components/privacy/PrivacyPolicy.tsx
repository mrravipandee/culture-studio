import Container from "@/components/home/shared/Container";
import { Reveal } from "@/components/motion";
import { formFields, privacyHero, privacySections } from "@/lib/content/privacy";

/** One editorial row: heading on the left, content on the right (Services/About pattern). */
function PolicySection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="grid scroll-mt-24 gap-6 border-t border-line py-12 lg:grid-cols-12 lg:gap-8 lg:py-16"
    >
      <h2 id={`${id}-title`} className="heading-5 text-ink lg:col-span-4">
        {title}
      </h2>
      <Reveal distance={16} className="grid gap-5 lg:col-span-7 lg:col-start-6">
        {children}
      </Reveal>
    </section>
  );
}

/**
 * /privacy-policy (first draft). Only verified technical facts are shown; client and
 * legal sections are pending (see lib/content/privacy.ts). Text-only editorial layout.
 */
export default function PrivacyPolicy() {
  const { collected, formStatus, direct, cookies } = privacySections;

  return (
    <>
      {/* Hero: same pattern as the Contact page hero */}
      <section className="relative pt-36 pb-16 md:pt-48 md:pb-24 bg-white border-b border-black/10">
        <Container>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-burgundy" aria-hidden="true" />
            <p className="font-mono text-xs uppercase tracking-eyebrow text-burgundy font-medium">{privacyHero.eyebrow}</p>
          </div>
          <h1 className="mt-8 max-w-5xl font-light text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-heading leading-[1.05] text-black">
            {privacyHero.headline}
          </h1>
          <p className="mt-8 md:mt-10 max-w-2xl text-base sm:text-lg md:text-xl font-light leading-relaxed text-ink-2">
            {privacyHero.lead}
          </p>
          <p className="caption-2 mt-6 max-w-2xl rounded-lg border border-dashed border-line-strong p-4 text-ink-2">
            {privacyHero.draftNote}
          </p>
        </Container>
      </section>

      <div className="section surface-paper">
        <Container>
          <PolicySection id="information-collected" title={collected.title}>
            <p className="body-3 text-ink-2">{collected.intro}</p>
            <dl className="grid border-t border-line">
              {formFields.map((field) => (
                <div key={field.label} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6">
                  <dt className="title-3 text-ink">
                    {field.label}
                    <span className="caption-5 mt-1 block font-mono uppercase tracking-eyebrow text-ink-3">
                      {field.required ? "Required" : "Optional"}
                    </span>
                  </dt>
                  <dd className="body-6 text-ink-2">{field.purpose}</dd>
                </div>
              ))}
            </dl>
          </PolicySection>

          <PolicySection id="form-status" title={formStatus.title}>
            {formStatus.body.map((p) => (
              <p key={p.slice(0, 24)} className="body-3 text-ink-2">
                {p}
              </p>
            ))}
          </PolicySection>

          <PolicySection id="direct-contact" title={direct.title}>
            {direct.body.map((p) => (
              <p key={p.slice(0, 24)} className="body-3 text-ink-2">
                {p}
              </p>
            ))}
          </PolicySection>

          <PolicySection id="cookies" title={cookies.title}>
            {cookies.body.map((p) => (
              <p key={p.slice(0, 24)} className="body-3 text-ink-2">
                {p}
              </p>
            ))}
          </PolicySection>
        </Container>
      </div>
    </>
  );
}
