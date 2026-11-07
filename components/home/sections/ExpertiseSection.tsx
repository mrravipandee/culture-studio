import { expertise, trustedBy } from "@/lib/content/home";
import LogoMarquee from "@/components/motion/LogoMarquee";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import ServicesStory from "./ServicesStory";

/** 02 — Expertise: pinned scroll story through the four services (ServicesStory). */
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
        <ServicesStory services={expertise.services} />
      </div>
    </section>
  );
}
