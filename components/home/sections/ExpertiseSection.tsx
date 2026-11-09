import { expertise, trustedBy } from "@/lib/content/home";
import { serviceCategories, serviceHref, services } from "@/lib/content/service-catalog";
import { Button } from "@/components/ui/site-button";
import LogoMarquee from "@/components/motion/LogoMarquee";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import ServicesStory, { type StoryService } from "./ServicesStory";

/** Curated view: one pinned stage per category, linking to each service on /services. */
const stages: StoryService[] = serviceCategories.map((category) => ({
  id: `home-${category.id}`,
  title: category.name,
  description: category.intro,
  includes: category.services.map((id) => ({ label: services[id].name, href: serviceHref(id) })),
  more: { label: `Explore ${category.name}`, href: serviceHref(category.id) },
  image: category.image,
}));

/** 02 — Services: pinned scroll story through the four service categories. */
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
