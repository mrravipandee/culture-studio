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
        const x1 = 300 + Math.cos(angle) * 232;
        const y1 = 300 + Math.sin(angle) * 232;
        const x2 = 300 + Math.cos(angle) * 240;
        const y2 = 300 + Math.sin(angle) * 240;
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
