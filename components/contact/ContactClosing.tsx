import { contactClosing } from "@/lib/content/contact";
import { Reveal, TextMask } from "@/components/motion";

/** "A good place to begin." and the closing brand line (PDF, end of the Contact page). */
export default function ContactClosing() {
  const { title, body, tagline } = contactClosing;

  return (
    <section aria-labelledby="contact-closing-title" className="section surface-paper">
      <div className="container-content grid gap-8 lg:grid-cols-12 lg:gap-8">
        <TextMask as="h2" id="contact-closing-title" text={title} className="heading-2 text-ink lg:col-span-6" />
        <div className="lg:col-span-5 lg:col-start-8">
          <Reveal as="p" delay={0.1} distance={16} className="body-lead max-w-measure text-ink-2">
            {body}
          </Reveal>
        </div>
        <p className="font-mono text-xs uppercase tracking-eyebrow text-ink-3 border-t border-line pt-8 mt-8 lg:col-span-12">
          {tagline}
        </p>
      </div>
    </section>
  );
}
