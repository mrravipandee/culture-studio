import { contact } from "@/lib/content/home";
import { contactEnquiry } from "@/lib/content/contact";
import { siteUrl } from "@/lib/site";
import { Reveal, TextMask } from "@/components/motion";
import { TextLink } from "@/components/ui/site-button";
import InquiryForm from "@/components/home/sections/InquiryForm";

/** Production domain for display, from the single source in lib/site.ts. */
const websiteLabel = new URL(siteUrl).host;

/**
 * Direct Enquiries + "Tell Us About the Project" (enquiry form).
 * The form is the shared InquiryForm (same component as Home/About): it stays disabled
 * until a real submission endpoint is configured, and ?service=<discipline> preselects.
 * DOM order follows the PDF (details first, so they lead on mobile); on desktop the form
 * takes the left columns and the details sit on the right.
 */
export default function ContactEnquiry() {
  const { email, phone } = contact;

  return (
    <section id="enquiry" aria-labelledby="enquiry-title" className="section surface-ink scroll-mt-24">
      <div className="container-content grid gap-16 lg:grid-cols-12 lg:gap-8">
        <Reveal as="aside" aria-labelledby="direct-enquiries-title" className="lg:order-2 lg:col-span-4 lg:col-start-9">
          <h2 id="direct-enquiries-title" className="eyebrow text-paper-3">
            {contactEnquiry.detailsTitle}
          </h2>
          <dl className="mt-8 grid content-start gap-8 border-t border-line pt-8">
            <div>
              <dt className="eyebrow text-paper-3">Phone</dt>
              <dd className="title-1 mt-3 text-paper">
                <TextLink href={phone.href}>{phone.display}</TextLink>
              </dd>
            </div>
            {email && (
              <div>
                <dt className="eyebrow text-paper-3">Email</dt>
                <dd className="title-1 mt-3 text-paper [overflow-wrap:anywhere]">
                  <TextLink href={`mailto:${email}`}>{email}</TextLink>
                </dd>
              </div>
            )}
            <div>
              <dt className="eyebrow text-paper-3">Website</dt>
              <dd className="title-1 mt-3 text-paper">
                {/* This site's own domain: open in the same tab. */}
                <TextLink href={siteUrl} target="_self">
                  {websiteLabel}
                </TextLink>
              </dd>
            </div>
          </dl>
        </Reveal>

        <div className="lg:order-1 lg:col-span-7">
          <TextMask as="h2" id="enquiry-title" text={contactEnquiry.formTitle} className="heading-2 text-paper" />
          <Reveal delay={0.1} className="mt-10 border-t border-line pt-10">
            <InquiryForm email={email} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
