"use client";

import { useRef } from "react";
import {
  cubicBezier,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

const ease = cubicBezier(0.22, 1, 0.36, 1);

interface TaglineRevealProps {
  eyebrow?: string;
  /** Each entry renders on its own line, so breaks land where the thought breaks. */
  lines: string[];
}

function Word({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.28, 1], { ease });
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {word}
    </motion.span>
  );
}

/** Large type moment: each word brightens in reading order as it scrolls through. */
export default function TaglineReveal({ eyebrow, lines }: TaglineRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });

  const total = lines.reduce((n, l) => n + l.split(" ").length, 0);
  let index = 0;

  return (
    <section
      aria-label={lines.join(" ")}
      className="section-padding bg-black text-white"
    >
      <div ref={ref} className="mx-auto max-w-[680px] px-6 text-center lg:max-w-4xl">
        {eyebrow && (
          <p className="mb-8 font-mono text-xs uppercase tracking-[0.22em] text-white/50">
            {eyebrow}
          </p>
        )}
        <p
          aria-hidden="true"
          className="text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl"
        >
          {lines.map((line, li) => (
            <span key={li} className="block">
              {line.split(" ").map((word, wi, arr) => {
                const i = index++;
                return (
                  <span key={wi}>
                    {reduce ? (
                      word
                    ) : (
                      <Word
                        word={word}
                        progress={scrollYProgress}
                        range={[i / total, (i + 1) / total]}
                      />
                    )}
                    {wi < arr.length - 1 && " "}
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
