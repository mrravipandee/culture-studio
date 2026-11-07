import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/Arrow";
import { servicesCta } from "@/lib/content/services";
import { contact } from "@/lib/content/home";
import Container from "@/components/home/shared/Container";
import { RippleButton } from "@/registry/magicui/ripple-button";

export default function ServicesCta() {
  const { eyebrow, lead, secondaryAction } = servicesCta;
  const email = contact.email || "inquiries@culturestudio.agency";

  return (
    <section
      id="contact"
      aria-labelledby="services-cta-heading"
      className="relative overflow-hidden py-24 sm:py-36 bg-[#4A121A] text-white selection:bg-white selection:text-black"
    >
      {/* Ambient Radial Glow & Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,247,242,0.12)_0%,_transparent_65%)]"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Eyebrow */}
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#FAF7F2]/60">
            [ 07 / {eyebrow} ]
          </span>

          {/* Headline */}
          <h2
            id="services-cta-heading"
            className="mt-8 text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.03em] leading-[1.05] text-[#FAF7F2]"
          >
            Your next chapter starts{" "}
            <span className="font-serif italic font-normal text-white">
              with a conversation.
            </span>
          </h2>

          {/* Lead */}
          <p className="mt-8 max-w-2xl text-base sm:text-lg md:text-xl font-light leading-relaxed text-[#FAF7F2]/75">
            {lead}
          </p>

          {/* Actions */}
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-5">
            <RippleButton
              href={`mailto:${email}?subject=CULT.URE%20Studio%20Advisory%20Inquiry`}
              rippleColor="rgba(74, 18, 26, 0.4)"
              className="group inline-flex items-center gap-4 rounded-full bg-[#FAF7F2] px-9 py-4 text-xs uppercase tracking-[0.2em] font-medium !text-black transition-all duration-300 hover:bg-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] active:scale-95"
            >
              <span>Initiate Advisory Inquiry</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-3.5" />
              </span>
            </RippleButton>

            <Link
              href={secondaryAction.href}
              className="inline-flex items-center gap-2 rounded-full border border-[#FAF7F2]/25 px-8 py-4 text-xs uppercase tracking-[0.2em] text-[#FAF7F2]/80 hover:text-white hover:border-white transition-colors"
            >
              <span>{secondaryAction.label}</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {/* Direct Channels Contact Strip */}
          <div className="mt-16 w-full max-w-xl border-t border-[#FAF7F2]/15 pt-8 text-xs font-mono text-[#FAF7F2]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FAF7F2]/80 animate-pulse" />
              <span>DIRECT DESK:</span>
              <a
                href={`mailto:${email}`}
                className="text-[#FAF7F2] underline underline-offset-4 hover:text-white transition-colors"
              >
                {email}
              </a>
            </div>

            <span className="uppercase tracking-widest text-[#FAF7F2]/40">
              LONDON &middot; GLOBAL PRACTICE
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
