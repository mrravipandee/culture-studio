"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { serviceList } from "@/lib/content/services";
import { useLenis } from "@/components/motion/MotionProvider";
import Container from "@/components/home/shared/Container";
import { ArrowUpRight } from "@/components/ui/Arrow";
import {
  ArchitecturalDialVector,
  GridCrosshairMarker,
  EditorialSealVector,
} from "@/components/home/shared/WorkVectors";

gsap.registerPlugin(ScrollTrigger);

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function PinnedShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [activeTab, setActiveTab] = useState(0);
  const totalSteps = serviceList.length;

  // Sync GSAP ScrollTrigger with Lenis
  useEffect(() => {
    if (!lenis) return;
    return lenis.on("scroll", ScrollTrigger.update);
  }, [lenis]);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ctx: gsap.Context | null = null;

    const build = () => {
      ctx?.revert();
      ctx = null;
      if (reduce.matches) return;

      const mm = gsap.matchMedia();

      // Desktop Pinning Experience (>= 1024px)
      mm.add("(min-width: 1024px)", () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-showcase-panel]");
        const images = gsap.utils.toArray<HTMLElement>("[data-showcase-image]");
        const progressLine = root.querySelector<HTMLElement>("[data-nav-progress]");

        // Initial setup
        panels.forEach((panel, i) => {
          gsap.set(panel, {
            autoAlpha: i === 0 ? 1 : 0,
            x: i === 0 ? 0 : 40,
            position: i === 0 ? "relative" : "absolute",
            top: 0,
            left: 0,
            width: "100%",
          });
        });

        images.forEach((img, i) => {
          gsap.set(img, {
            autoAlpha: i === 0 ? 1 : 0,
            scale: i === 0 ? 1 : 1.06,
            clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
            position: "absolute",
            inset: 0,
          });
        });

        // Master scrubbed timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: `+=${(totalSteps - 0.25) * 100}%`,
            pin: pin,
            scrub: 0.8,
            anticipatePin: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              const index = Math.min(
                Math.floor(progress * totalSteps),
                totalSteps - 1
              );
              setActiveTab(index);

              if (progressLine) {
                gsap.set(progressLine, {
                  scaleX: progress,
                  transformOrigin: "left center",
                });
              }
            },
          },
        });

        // Build transitions between each consecutive stage
        for (let i = 0; i < totalSteps - 1; i++) {
          const currentPanel = panels[i];
          const nextPanel = panels[i + 1];
          const currentImg = images[i];
          const nextImg = images[i + 1];

          // Text panel out
          tl.to(
            currentPanel,
            {
              autoAlpha: 0,
              x: -30,
              duration: 0.8,
              ease: "power2.inOut",
            },
            `step-${i}`
          );

          // Current image out
          tl.to(
            currentImg,
            {
              scale: 0.96,
              autoAlpha: 0.2,
              duration: 0.8,
              ease: "power2.inOut",
            },
            `step-${i}`
          );

          // Next image in with smooth clip reveal
          tl.fromTo(
            nextImg,
            {
              autoAlpha: 1,
              clipPath: "inset(100% 0% 0% 0%)",
              scale: 1.08,
            },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              duration: 1,
              ease: "power3.inOut",
            },
            `step-${i}+=0.1`
          );

          // Next panel in with horizontal slide and fade
          tl.fromTo(
            nextPanel,
            {
              autoAlpha: 0,
              x: 40,
            },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.9,
              ease: "power3.out",
            },
            `step-${i}+=0.2`
          );
        }
      });
    };

    ctx = gsap.context(build, root);

    const onResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("resize", onResize);
      ctx?.revert();
    };
  }, [totalSteps]);

  // Click handler to jump to a specific service stage
  const handleNavClick = (index: number) => {
    setActiveTab(index);
    if (!rootRef.current) return;

    const rootTop = rootRef.current.offsetTop;
    const scrollDistance = (rootRef.current.offsetHeight - window.innerHeight);
    const targetScroll = rootTop + (scrollDistance * (index / (totalSteps - 1)));

    if (lenis) {
      lenis.scrollTo(targetScroll, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={rootRef}
      id="showcase"
      className="relative bg-[#FCFBF9] text-ink selection:bg-burgundy selection:text-white"
    >
      {/* Pinned Viewport Container */}
      <div
        ref={pinRef}
        className="relative flex min-h-screen flex-col justify-between overflow-hidden py-8 lg:h-screen lg:py-12"
      >
        {/* Ambient Architectural Vector Backdrop */}
        <div
          className="pointer-events-none absolute -top-12 -left-12 h-[550px] w-[550px] text-burgundy opacity-[0.09] lg:h-[700px] lg:w-[700px]"
          aria-hidden="true"
        >
          <ArchitecturalDialVector className="h-full w-full" />
        </div>

        <Container className="relative z-10 flex h-full flex-col justify-between">
          {/* SECTION 02: EDITORIAL SERVICE NAVIGATION */}
          <div className="border-b border-black/10 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 text-xs font-mono">
              <span className="uppercase tracking-[0.2em] text-burgundy font-semibold">
                [ 02 / SERVICE ARCHITECTURE ]
              </span>
              <span className="text-black/45 tracking-wider hidden sm:inline">
                STAGE {String(activeTab + 1).padStart(2, "0")} OF 04 &middot; NATIVE SCROLL DRIVE
              </span>
            </div>

            {/* 4 Interactive Service Tabs */}
            <nav aria-label="Services Showcase Navigation" className="relative">
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                {serviceList.map((service, idx) => {
                  const isActive = activeTab === idx;
                  return (
                    <li key={service.id}>
                      <button
                        type="button"
                        onClick={() => handleNavClick(idx)}
                        className={`group relative flex w-full flex-col items-start rounded-lg p-3 sm:p-4 text-left transition-all duration-300 focus:outline-none ${
                          isActive
                            ? "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/15"
                            : "hover:bg-black/[0.03] border border-transparent"
                        }`}
                      >
                        <span
                          className={`font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
                            isActive
                              ? "text-burgundy font-bold"
                              : "text-black/40 group-hover:text-black"
                          }`}
                        >
                          {service.number}
                        </span>
                        <span
                          className={`mt-1 text-xs sm:text-sm font-medium tracking-tight transition-colors line-clamp-1 ${
                            isActive
                              ? "text-black font-semibold"
                              : "text-black/60 group-hover:text-black"
                          }`}
                        >
                          {service.shortTitle}
                        </span>
                        {isActive && (
                          <span
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy rounded-full"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Progress Line Bar on Desktop */}
              <div
                className="mt-4 hidden h-[2px] w-full bg-black/10 lg:block overflow-hidden rounded-full"
                aria-hidden="true"
              >
                <div
                  data-nav-progress
                  className="h-full w-full bg-burgundy scale-x-0 origin-left"
                />
              </div>
            </nav>
          </div>

          {/* SECTION 03: INTERACTIVE PINNED SHOWCASE STAGE */}
          <div className="relative my-auto py-8 lg:py-10">
            {/* Desktop Stage (Overlayed & Scrubbed) */}
            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-14 lg:items-center">
              {/* Left Column: Text Content Stage */}
              <div className="lg:col-span-6 relative min-h-[460px]">
                {serviceList.map((service) => (
                  <div
                    key={service.id}
                    data-showcase-panel
                    className="flex flex-col justify-between"
                  >
                    <div>
                      {/* Sub-label kicker */}
                      <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-burgundy mb-4">
                        <span>STAGE {service.number}</span>
                        <span className="h-1 w-1 rounded-full bg-burgundy" />
                        <span className="text-black/50">{service.scope}</span>
                      </div>

                      {/* Heading */}
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-ink">
                        {service.title}
                      </h2>

                      {/* Tagline */}
                      <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-burgundy font-semibold">
                        {service.tagline}
                      </p>

                      {/* Description */}
                      <p className="mt-6 text-base lg:text-lg font-light leading-relaxed text-ink-2 max-w-xl">
                        {service.description}
                      </p>

                      {/* Deliverables Pills */}
                      <div className="mt-8 pt-6 border-t border-black/10">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 mb-3">
                          CORE DELIVERABLES
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {service.deliverables.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-black/10 bg-white/90 px-3.5 py-1.5 font-mono text-xs text-black/75 shadow-xs"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Service CTA */}
                    <div className="mt-10">
                      <Link
                        href="#contact"
                        className="group inline-flex items-center gap-3 rounded-full bg-black px-7 py-3 text-xs uppercase tracking-[0.2em] font-medium text-white transition-all duration-300 hover:bg-burgundy hover:shadow-lg active:scale-95"
                      >
                        <span>Inquire about {service.shortTitle}</span>
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 text-white transition-transform group-hover:rotate-45">
                          <ArrowUpRight className="size-3.5" />
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Visual Stage */}
              <div className="lg:col-span-6 relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-black/10 bg-black/5 shadow-[0_24px_50px_rgba(0,0,0,0.08)]">
                {serviceList.map((service) => (
                  <div
                    key={service.id}
                    data-showcase-image
                    className="absolute inset-0 h-full w-full"
                  >
                    <Image
                      src={service.image.src}
                      alt={service.image.alt}
                      fill
                      priority
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Corner Archival Seal */}
                    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white pointer-events-none">
                      <div className="flex items-center gap-2">
                        <EditorialSealVector className="h-4 w-4 text-white/80" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/90">
                          CULT.URE &middot; PRACTICE 0{service.number}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-white/70">
                        EST. 2026
                      </span>
                    </div>
                  </div>
                ))}

                <GridCrosshairMarker className="absolute top-3 left-3 text-white/60 z-10" />
                <GridCrosshairMarker className="absolute top-3 right-3 text-white/60 z-10" />
              </div>
            </div>

            {/* Mobile / Responsive Fallback Stack (Smooth scroll flow) */}
            <div className="lg:hidden space-y-16">
              {serviceList.map((service) => (
                <article
                  key={service.id}
                  className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm flex flex-col gap-6"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-black/5">
                    <Image
                      src={service.image.src}
                      alt={service.image.alt}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs text-burgundy uppercase tracking-wider mb-2">
                      <span>STAGE {service.number}</span>
                      <span>&middot;</span>
                      <span>{service.scope}</span>
                    </div>

                    <h3 className="text-2xl font-light text-ink">
                      {service.title}
                    </h3>

                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-burgundy font-medium">
                      {service.tagline}
                    </p>

                    <p className="mt-4 text-sm font-light text-ink-2 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="mt-6 pt-4 border-t border-black/8">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-black/40 mb-2">
                        DELIVERABLES
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {service.deliverables.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-neutral-100 px-3 py-1 font-mono text-[11px] text-black/70"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <Link
                        href="#contact"
                        className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-xs uppercase tracking-widest text-white hover:bg-burgundy transition-colors"
                      >
                        <span>Inquire</span>
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Bottom Footnote Bar */}
          <div className="flex items-center justify-between border-t border-black/10 pt-4 text-xs font-mono text-black/40">
            <span>SCRUBBED SHOWCASE &mdash; 04 CAPABILITIES</span>
            <span className="hidden sm:inline">
              CULT.URE STUDIO &middot; BEYOND THE NOISE
            </span>
          </div>
        </Container>
      </div>
    </div>
  );
}
