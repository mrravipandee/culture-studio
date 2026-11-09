"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";

export type MarqueeLogo = {
  name: string;
  /** SVG/PNG under /public. While null, a styled wordmark placeholder renders. */
  src: string | null;
};

interface LogoMarqueeProps {
  logos: MarqueeLogo[];
  /** Seconds per loop at rest. Lower is faster. */
  speed?: number;
  label?: string;
  className?: string;
}

const COPIES = 4;
const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/* Placeholder marks: varied shapes so the strip reads like distinct brands. */
function Mark({ i }: { i: number }) {
  const shapes = [
    <circle key="a" cx="16" cy="16" r="12" fill="currentColor" />,
    <rect key="b" x="5" y="5" width="22" height="22" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />,
    <g key="c" fill="currentColor"><circle cx="12" cy="16" r="8" /><circle cx="20" cy="16" r="8" opacity=".5" /></g>,
    <rect key="d" x="8" y="8" width="16" height="16" rx="2" transform="rotate(45 16 16)" fill="currentColor" />,
    <path key="e" d="M16 4 L28 27 H4 Z" fill="currentColor" />,
    <g key="f" fill="currentColor"><rect x="5" y="6" width="5" height="20" rx="2.5" /><rect x="13.5" y="10" width="5" height="16" rx="2.5" /><rect x="22" y="14" width="5" height="12" rx="2.5" /></g>,
  ];
  return (
    <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden="true">
      {shapes[i % shapes.length]}
    </svg>
  );
}

const WORDMARK = [
  "text-2xl font-semibold tracking-[-0.03em]",
  "text-lg font-medium uppercase tracking-[0.24em]",
  "text-2xl font-bold tracking-[-0.04em] lowercase",
  "text-xl font-medium tracking-[-0.01em]",
];

function Logo({ logo, i, hidden }: { logo: MarqueeLogo; i: number; hidden: boolean }) {
  return (
    <li
      aria-hidden={hidden}
      className="flex h-12 shrink-0 items-center gap-3 text-black opacity-40 grayscale transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03] hover:opacity-100 hover:grayscale-0"
    >
      {logo.src ? (
        <Image src={logo.src} alt={logo.name} width={160} height={48} className="h-9 w-auto object-contain" />
      ) : (
        <>
          <Mark i={i} />
          <span className={`whitespace-nowrap ${WORDMARK[i % WORDMARK.length]}`}>{logo.name}</span>
        </>
      )}
    </li>
  );
}

function Row({ logos, reverse, speed, offset = 0 }: { logos: MarqueeLogo[]; reverse?: boolean; speed: number; offset?: number }) {
  const reduce = useReducedMotion();
  const paused = useRef(false);
  const baseX = useMotionValue(0);

  // Scroll velocity briefly speeds the strip up, then it eases back.
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-1500, 0, 1500], [5, 0, 5], { clamp: false });

  const loop = 100 / COPIES; // percent of the track that equals one copy
  const x = useTransform(baseX, (v) => `${wrap(-loop, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce || paused.current) return;
    const dir = reverse ? 1 : -1;
    const step = (loop / speed) * (delta / 1000);
    baseX.set(baseX.get() + dir * step * (1 + boost.get()));
  });

  const items = Array.from({ length: COPIES }, () => logos).flat();

  return (
    <div
      className="marquee-mask flex overflow-hidden"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <motion.ul style={{ x }} className="flex w-max shrink-0 items-center gap-16 pr-16 will-change-transform sm:gap-24 sm:pr-24">
        {items.map((logo, i) => (
          <Logo key={i} logo={logo} i={(i + offset) % logos.length} hidden={i >= logos.length} />
        ))}
      </motion.ul>
    </div>
  );
}

/** Full bleed, two row logo band. Rows drift in opposite directions and react to scroll speed. */
export default function LogoMarquee({ logos, speed = 18, label, className = "" }: LogoMarqueeProps) {
  const rowB = [...logos].reverse();

  return (
    <motion.section
      aria-label={label ?? "Clients"}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`relative left-1/2 w-screen -translate-x-1/2 border-y border-black/10 bg-subtle py-12 sm:py-16 ${className}`}
    >
      {label && (
        <div className="container-content mb-10 flex items-center gap-4 sm:mb-12">
          <span aria-hidden="true" className="h-px flex-1 bg-black/10" />
          <p className="text-center eyebrow text-ink-3">{label}</p>
          <span aria-hidden="true" className="h-px flex-1 bg-black/10" />
        </div>
      )}
      <div className="grid gap-8 sm:gap-12">
        <Row logos={logos} speed={speed} />
        <Row logos={rowB} speed={speed * 1.2} reverse offset={2} />
      </div>
    </motion.section>
  );
}
