import { editorialSerif } from "@/lib/fonts";
import type { ServiceShare } from "@/lib/admin/dashboard-utils";

/** Burgundy shades, darkest for the largest share. */
const SHADES = ["#4a121a", "#8c3a40", "#b76e6e", "#d9a9a3", "#ece0dc"];
const R = 70;
const STROKE = 26;
const C = 2 * Math.PI * R;

/** Enquiries by Service: SVG donut + legend. Percentages arrive pre-computed (sum to 100). */
/**
 * `total` = service selections (an enquiry may pick several), used for the arcs;
 * `enquiries` = number of enquiries, shown in the centre.
 */
export default function ServiceBreakdown({ shares, total, enquiries }: { shares: ServiceShare[]; total: number; enquiries: number }) {
  const withColor = shares.map((s, i) => ({ ...s, color: SHADES[i % SHADES.length] }));
  // Pre-compute each arc's length and start offset (pure, no mutation during render).
  const segments = withColor
    .filter((s) => s.count > 0)
    .map((s, i, all) => {
      const before = all.slice(0, i).reduce((n, p) => n + p.count, 0);
      return { ...s, length: (s.count / total) * C, start: (before / total) * C };
    });

  return (
    <section
      aria-labelledby="service-breakdown-title"
      className="@container admin-fade-up flex h-full flex-col rounded-xl border border-black/[0.08] bg-white/80 p-5 sm:p-6 [animation-delay:460ms]"
    >
      <h2 id="service-breakdown-title" className={`${editorialSerif.className} text-2xl text-[#1a0a0c]`}>
        Enquiries by Service
      </h2>

      {total === 0 ? (
        <p className="mt-6 grid flex-1 place-items-center rounded-lg border border-dashed border-black/15 py-12 text-sm text-ink-2">No enquiries yet.</p>
      ) : (
        <div className="mt-5 flex flex-1 flex-col items-center gap-6 @[30rem]:flex-row @[30rem]:gap-8">
          <div className="relative shrink-0">
            <svg width={190} height={190} viewBox="0 0 190 190" role="img" aria-label={`${enquiries} enquiries, ${total} service selections: ${withColor.map((s) => `${s.label} ${s.percent}%`).join(", ")}`}>
              <g transform="rotate(-90 95 95)">
                <circle cx={95} cy={95} r={R} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth={STROKE} />
                {segments.map((s) => (
                    <circle
                      key={s.id}
                      cx={95}
                      cy={95}
                      r={R}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={STROKE}
                      strokeDasharray={`${Math.max(0, s.length - 1.5)} ${C}`}
                      strokeDashoffset={-s.start}
                      className="admin-donut-seg"
                    />
                ))}
              </g>
            </svg>
            <div aria-hidden="true" className="absolute inset-0 grid place-content-center text-center">
              <span className={`${editorialSerif.className} text-4xl font-medium leading-none text-[#1a0a0c]`}>{enquiries}</span>
              <span className="mt-1 text-xs text-ink-2">Enquiries</span>
            </div>
          </div>

          <ul className="w-full min-w-0 flex-1 space-y-3">
            {withColor.map((s) => (
              <li key={s.id} className="flex items-center gap-3 text-sm">
                <span aria-hidden="true" className="size-3.5 shrink-0 rounded-[3px]" style={{ backgroundColor: s.color }} />
                <span className="min-w-0 flex-1 truncate text-ink">{s.label}</span>
                <span className="tabular-nums text-ink-2">
                  {s.percent}%<span className="sr-only"> ({s.count})</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
