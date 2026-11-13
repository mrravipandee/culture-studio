import { expertise, trustedBy } from "@/lib/content/home";
import { disciplineHref, disciplines } from "@/lib/content/disciplines";
import { Button } from "@/components/ui/site-button";
import LogoMarquee from "@/components/motion/LogoMarquee";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import ServicesStory, { type StoryService } from "./ServicesStory";

/**
 * One pinned stage per discipline (client copy deck), listing its services.
 * Each service links to its own section (/services#<service-id>); the
 * "Explore …" link goes to the discipline section (/services#<discipline-id>).
 */
const stages: StoryService[] = disciplines.map((discipline) => ({
  id: `home-${discipline.id}`,
  title: discipline.name,
  description: discipline.summary,
  includes: discipline.services.map((service) => ({ label: service.name, href: disciplineHref(service.id) })),
  more: { label: `Explore ${discipline.name}`, href: disciplineHref(discipline.id) },
  image: discipline.image,
}));

/** 02 — Services: pinned scroll story through the four disciplines. */
export default function ExpertiseSection() {
  return (
    <section id="expertise" aria-labelledby="expertise-title" className="section surface-paper">
      <Container>
        <SectionHeading intro={expertise.intro} titleId="expertise-title" />

        {/* Client logos appear only once real, approved logos replace the placeholders. */}
        {!trustedBy.placeholder && (
          <LogoMarquee label={trustedBy.label} logos={trustedBy.logos} speed={18} className="mt-16 lg:mt-24" />
        )}
      </Container>

      <div className="mt-16 lg:mt-24">
        <ServicesStory services={stages} />
      </div>

      <Container className="mt-12 flex justify-start md:justify-end">
        <Button href={expertise.cta.href} variant="secondary" icon="arrow">
          {expertise.cta.label}
        </Button>
      </Container>
    </section>
  );
}
