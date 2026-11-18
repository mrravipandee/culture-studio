"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronDown } from "lucide-react";
import type { SeriesPoint } from "@/lib/admin/dashboard-utils";
import { editorialSerif } from "@/lib/fonts";

/**
 * Enquiries Overview: area chart drawn in SVG (no chart library). The series is real
 * MongoDB data (one point per India-time day, zero-filled); the range filter only slices it.
 * Accessible: summary label, keyboard-explorable points, and a screen-reader table.
 */

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

const H = 260;
const PAD = { top: 18, right: 12, bottom: 30, left: 34 };

const fmtShort = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const fmtLong = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function niceMax(max: number) {
  if (max <= 4) return 4;
  const step = max <= 10 ? 2 : max <= 25 ? 5 : 10;
  return Math.ceil(max / step) * step;
}

/** Smooth curve through points (Catmull-Rom → cubic Bézier), clamped to the plot area. */
function smoothPath(pts: { x: number; y: number }[], minY: number, maxY: number) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  const clamp = (y: number) => Math.min(maxY, Math.max(minY, y));
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = clamp(p1.y + (p2.y - p0.y) / 6);
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = clamp(p2.y - (p3.y - p1.y) / 6);
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export default function EnquiriesChart({ series, dataEndLabel }: { series: SeriesPoint[]; dataEndLabel: string }) {
  const [range, setRange] = useState<Range>(30);
  const [active, setActive] = useState<number | null>(null);
  const [width, setWidth] = useState(720);
  const box = useRef<HTMLDivElement>(null);
  const gradientId = useId();
  const selectId = useId();
  const titleId = useId();

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const enough = series.length >= range;
  const data = useMemo(() => (enough ? series.slice(-range) : []), [series, range, enough]);
  const total = data.reduce((n, d) => n + d.count, 0);
  const yMax = niceMax(Math.max(0, ...data.map((d) => d.count)));
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((yMax / 4) * i));

  const plotW = width - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - (v / yMax) * plotH;
  const pts = data.map((d, i) => ({ x: x(i), y: y(d.count) }));
  const line = smoothPath(pts, PAD.top, PAD.top + plotH);
  const area = pts.length ? `${line} L${pts[pts.length - 1].x},${PAD.top + plotH} L${pts[0].x},${PAD.top + plotH} Z` : "";

  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(3, Math.floor(plotW / 78))));

  const onPointer = (event: PointerEvent<SVGSVGElement>) => {
    if (!data.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * width;
    const i = Math.round(((px - PAD.left) / plotW) * (data.length - 1));
    setActive(Math.min(data.length - 1, Math.max(0, i)));
  };
  const onKey = (event: KeyboardEvent<SVGSVGElement>) => {
    if (!data.length) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      setActive((cur) => Math.min(data.length - 1, Math.max(0, (cur ?? data.length - 1) + step)));
    }
  };

  const point = active !== null ? data[active] : null;
  const tipLeft = active !== null ? Math.min(Math.max(x(active), 70), width - 70) : 0;

  return (
    <section aria-labelledby={titleId} className="admin-fade-up flex h-full flex-col rounded-xl border border-black/[0.08] bg-white/80 p-5 sm:p-6 [animation-delay:380ms]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={titleId} className={`${editorialSerif.className} text-2xl text-[#1a0a0c]`}>
            Enquiries Overview
          </h2>
          <p className="mt-1 text-xs text-ink-3">
            {enough ? `${total} enquiries · ` : ""}Up to {dataEndLabel} (India time)
          </p>
        </div>
        <div className="relative">
          <label htmlFor={selectId} className="sr-only">
            Date range
          </label>
          <select
            id={selectId}
            value={range}
            onChange={(e) => {
              setRange(Number(e.target.value) as Range);
              setActive(null);
            }}
            className="h-10 appearance-none rounded-lg border border-black/15 bg-white pl-3.5 pr-9 text-sm text-ink transition-colors hover:border-black/30 focus-visible:outline-2 focus-visible:outline-burgundy"
          >
            {RANGES.map((r) => (
              <option key={r} value={r}>
                Last {r} Days
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-2" />
        </div>
      </div>

      <div ref={box} className="relative mt-4 flex-1">
        {!enough || data.length === 0 ? (
          <p className="grid h-[260px] place-items-center rounded-lg border border-dashed border-black/15 text-sm text-ink-2">
            Not enough data for the last {range} days yet.
          </p>
        ) : (
          <>
            <svg
              width={width}
              height={H}
              viewBox={`0 0 ${width} ${H}`}
              role="img"
              aria-label={`Enquiries per day, last ${range} days of demo data: ${total} in total, peak ${Math.max(...data.map((d) => d.count))} per day. Use left and right arrow keys to read each day.`}
              tabIndex={0}
              onPointerMove={onPointer}
              onPointerLeave={() => setActive(null)}
              onKeyDown={onKey}
              onBlur={() => setActive(null)}
              className="block max-w-full touch-pan-y rounded-md focus-visible:outline-2 focus-visible:outline-burgundy"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7a1f2b" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#7a1f2b" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {yTicks.map((t) => (
                <g key={t}>
                  <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="rgba(0,0,0,0.07)" />
                  <text x={PAD.left - 10} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-[rgba(0,0,0,0.55)] text-[11px]">
                    {t}
                  </text>
                </g>
              ))}
              {data.map((d, i) =>
                i % labelEvery === 0 || i === data.length - 1 ? (
                  i !== data.length - 1 && data.length - 1 - i < labelEvery * 0.6 ? null : (
                    <text key={d.date} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} className="fill-[rgba(0,0,0,0.55)] text-[11px]">
                      {fmtShort(d.date)}
                    </text>
                  )
                ) : null,
              )}

              <path d={area} fill={`url(#${gradientId})`} className="admin-chart-area" />
              <path d={line} fill="none" stroke="#5a0c14" strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" pathLength={1} className="admin-chart-line" />

              {point && active !== null && (
                <g>
                  <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} stroke="rgba(90,12,20,0.25)" strokeDasharray="3 3" />
                  <circle cx={x(active)} cy={y(point.count)} r={5} fill="#5a0c14" stroke="#fff" strokeWidth={2} />
                </g>
              )}
            </svg>

            <div
              aria-live="polite"
              className={`pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-black/10 bg-white px-3 py-2 text-center shadow-[0_6px_20px_-10px_rgba(36,12,14,0.35)] transition-opacity duration-150 ${
                point ? "opacity-100" : "opacity-0"
              }`}
              style={{ left: tipLeft }}
            >
              {point && (
                <>
                  <span className="block text-sm font-semibold text-[#1a0a0c]">
                    {point.count} {point.count === 1 ? "enquiry" : "enquiries"}
                  </span>
                  <span className="block text-xs text-ink-3">{fmtLong(point.date)}</span>
                </>
              )}
            </div>

            {/* sr-only on a wrapper: tables ignore the 1px height and would stretch the page. */}
            <div className="sr-only">
            <table>
              <caption>Enquiries per day, last {range} days (demo data)</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Enquiries</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.date}>
                    <td>{fmtLong(d.date)}</td>
                    <td>{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
