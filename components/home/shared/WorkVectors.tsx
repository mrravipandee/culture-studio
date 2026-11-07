/**
 * Transparent vector graphics for CULT.URE editorial sections.
 * Designed with precise stroke weights, opacity scaling, and SVG coordinate systems
 * to provide depth, atmosphere, and architectural rigor without adding heavy assets.
 */

export function ArchitecturalDialVector({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Outer subtle boundary */}
      <circle cx="300" cy="300" r="280" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.35" />
      <circle cx="300" cy="300" r="240" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      
      {/* Crosshair coordinate axes */}
      <line x1="300" y1="10" x2="300" y2="590" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
      <line x1="10" y1="300" x2="590" y2="300" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />

      {/* Diagonal rays */}
      <line x1="102" y1="102" x2="498" y2="498" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.2" />
      <line x1="102" y1="498" x2="498" y2="102" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.2" />

      {/* Internal rings & ticks */}
      <circle cx="300" cy="300" r="180" stroke="currentColor" strokeWidth="1.25" strokeDasharray="1 3" opacity="0.4" />
      <circle cx="300" cy="300" r="120" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
      <circle cx="300" cy="300" r="60" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="300" cy="300" r="4" fill="currentColor" opacity="0.6" />

      {/* Coordinate ticks along circumference */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        // Rounded so server and browser render identical attributes (no hydration mismatch).
        const r3 = (n: number) => Math.round(n * 1000) / 1000;
        const x1 = r3(300 + Math.cos(angle) * 232);
        const y1 = r3(300 + Math.sin(angle) * 232);
        const x2 = r3(300 + Math.cos(angle) * 240);
        const y2 = r3(300 + Math.sin(angle) * 240);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1"
            opacity={i % 6 === 0 ? "0.6" : "0.25"}
          />
        );
      })}

      {/* Cardinal text labels */}
      <text x="306" y="32" fill="currentColor" fontSize="8" fontFamily="monospace" letterSpacing="0.2em" opacity="0.45">
        N 51° 30&apos; 26&quot;
      </text>
      <text x="495" y="304" fill="currentColor" fontSize="8" fontFamily="monospace" letterSpacing="0.2em" opacity="0.45">
        E 0° 07&apos;
      </text>
      <text x="306" y="580" fill="currentColor" fontSize="8" fontFamily="monospace" letterSpacing="0.2em" opacity="0.45">
        S · ARCHIVE
      </text>
      <text x="24" y="304" fill="currentColor" fontSize="8" fontFamily="monospace" letterSpacing="0.2em" opacity="0.45">
        W · PRACTICE
      </text>
    </svg>
  );
}

export function EditorialSealVector({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
      
      {/* Seal center monogram */}
      <circle cx="60" cy="60" r="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path
        d="M52 50 C52 46, 68 46, 68 50 C68 56, 52 56, 52 64 C52 72, 68 72, 68 70"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle cx="60" cy="74" r="1.5" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

export function TopographicContourVector({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <path
        d="M-50 120 C180 80, 260 280, 520 220 C720 180, 780 320, 850 300"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="4 6"
        opacity="0.2"
      />
      <path
        d="M-50 190 C160 160, 280 350, 560 300 C740 260, 800 400, 850 380"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.25"
      />
      <path
        d="M-50 260 C140 240, 300 420, 600 380 C760 340, 810 480, 850 460"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.18"
      />
      <path
        d="M-50 330 C120 320, 320 490, 640 460 C780 420, 820 540, 850 530"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="2 4"
        opacity="0.15"
      />
    </svg>
  );
}

export function GridCrosshairMarker({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center font-mono text-[10px] leading-none text-current opacity-35 select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      +
    </span>
  );
}

/** 
 * Clean vector glyphs representing the 4 stages of the CULT.URE continuum.
 * Rendered with fine hair-thin lines and subtle opacity for a luxury editorial feel.
 */
export function ProcessStepGlyph({
  step,
  className = "",
}: {
  step: number;
  className?: string;
}) {
  if (step === 1) {
    // 01 — Discover: Reticle / Diagnostic Lens
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none ${className}`}
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
        <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.9" />
        <line x1="24" y1="4" x2="24" y2="10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="24" y1="38" x2="24" y2="44" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="4" y1="24" x2="10" y2="24" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="38" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    );
  }

  if (step === 2) {
    // 02 — Define: Architectural Positioning Grid
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none ${className}`}
        aria-hidden="true"
      >
        <rect x="8" y="8" width="32" height="32" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        <rect x="14" y="14" width="20" height="20" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
        <line x1="8" y1="24" x2="40" y2="24" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
        <line x1="24" y1="8" x2="24" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
        <circle cx="24" cy="24" r="2" fill="currentColor" opacity="0.9" />
      </svg>
    );
  }

  if (step === 3) {
    // 03 — Create: Prism & Editorial Craft
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none ${className}`}
        aria-hidden="true"
      >
        <polygon points="24,6 42,38 6,38" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
        <polygon points="24,16 34,34 14,34" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.35" />
        <line x1="24" y1="6" x2="24" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <circle cx="24" cy="26" r="2" fill="currentColor" opacity="0.9" />
      </svg>
    );
  }

  // 04 — Evolve: Compounding Orbital Loop
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-hidden="true"
    >
      <ellipse cx="24" cy="24" rx="20" ry="10" stroke="currentColor" strokeWidth="1.25" transform="rotate(-30 24 24)" opacity="0.6" />
      <ellipse cx="24" cy="24" rx="20" ry="10" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" transform="rotate(30 24 24)" opacity="0.35" />
      <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.9" />
      <circle cx="38" cy="18" r="1.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}


