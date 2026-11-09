"use client";

interface BrandRevealProps {
  visible: boolean;
}

export default function BrandReveal({ visible }: BrandRevealProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center transition-[opacity,transform] duration-900 ease-editorial ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6"
      }`}
      aria-hidden={!visible}
    >
      {/* Brand Title */}
      <p aria-hidden="true" className="text-white text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-eyebrow uppercase select-none">
        <span>CULT</span>
        <span className="text-paper-3">.</span>
        <span>URE</span>
      </p>

      {/* Thin Editorial Divider */}
      <div
        className={`my-6 h-px w-16 bg-white/40 transition-[opacity,transform] duration-900 ease-editorial delay-200 ${
          visible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        }`}
      />

      {/* Brand Tagline */}
      <p
        className={`text-white/80 text-xs sm:text-sm md:text-base font-light uppercase tracking-[0.35em] sm:tracking-[0.45em] select-none transition-[opacity,transform] duration-900 ease-editorial delay-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        Beyond the noise. Into the culture.
      </p>
    </div>
  );
}

