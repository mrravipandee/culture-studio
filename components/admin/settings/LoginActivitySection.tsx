"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Globe2, History, LoaderCircle, Monitor, RefreshCw, Smartphone, Tablet, Clock3, CalendarDays, AppWindow } from "lucide-react";
import type { LoginActivityData, LoginActivityItem } from "@/lib/admin/settings-schemas";
import { settingsRequest } from "./settings-api";
import { FormNotice, LocalTime, SettingsCard, secondaryButton } from "./SettingsParts";

const LIMIT = 5;

const DeviceIcon = ({ device }: { device: string }) => {
  const Icon = device === "Mobile" ? Smartphone : device === "Tablet" ? Tablet : Monitor;
  return <Icon aria-hidden="true" size={16} strokeWidth={1.7} className="shrink-0" />;
};

const deviceLabel = (item: LoginActivityItem) => (item.os !== "Unknown" ? `${item.os} · ${item.device}` : item.device === "Unknown" ? "Unknown device" : item.device);
const browserLabel = (item: LoginActivityItem) => (item.browser === "Unknown" ? "Unknown browser" : item.browser);

function StatusBadge({ status }: { status: LoginActivityItem["status"] }) {
  return status === "SUCCESS" ? (
    <span className="inline-flex rounded-full bg-[#e5f1e8] px-2.5 py-0.5 text-xs font-medium text-[#245a3a] ring-1 ring-inset ring-[#2f6b47]/15">Successful</span>
  ) : (
    <span className="inline-flex rounded-full bg-[#f7e4e4] px-2.5 py-0.5 text-xs font-medium text-[#6e1a24] ring-1 ring-inset ring-[#7a1f2b]/15">Failed</span>
  );
}

function Skeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-28 rounded-lg bg-black/[0.05]" />
        <div className="h-28 rounded-lg bg-black/[0.05]" />
      </div>
      <div className="mt-6 space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-11 rounded-md bg-black/[0.04]" />
        ))}
      </div>
    </div>
  );
}

function Summary({ title, item, empty, highlight }: { title: string; item: LoginActivityItem | null; empty: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 sm:p-5 ${highlight ? "border-[#7a1f2b]/10 bg-[#f7e7e6]" : "border-black/[0.07] bg-[var(--cream)]"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-burgundy">{title}</p>
      {item ? (
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-start gap-2.5">
            <CalendarDays aria-hidden="true" size={16} strokeWidth={1.7} className="mt-0.5 shrink-0 text-ink-2" />
            <dt className="sr-only">Date and time</dt>
            <dd className="font-medium text-[#1a0a0c]">
              <LocalTime iso={item.loggedInAt} />
            </dd>
          </div>
          <div className="flex items-start gap-2.5 text-ink-2">
            <span className="mt-0.5">
              <DeviceIcon device={item.device} />
            </span>
            <dt className="sr-only">Device</dt>
            <dd>{deviceLabel(item)}</dd>
          </div>
          <div className="flex items-start gap-2.5 text-ink-2">
            <AppWindow aria-hidden="true" size={16} strokeWidth={1.7} className="mt-0.5 shrink-0" />
            <dt className="sr-only">Browser</dt>
            <dd>{browserLabel(item)}</dd>
          </div>
          <div className="flex items-start gap-2.5 text-ink-2">
            <Globe2 aria-hidden="true" size={16} strokeWidth={1.7} className="mt-0.5 shrink-0" />
            <dt className="sr-only">Location</dt>
            <dd className={item.location ? "" : "text-ink-3"}>{item.location ?? "Location unavailable"}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-ink-2">{empty}</p>
      )}
    </div>
  );
}

export default function LoginActivitySection({ serifClassName }: { serifClassName: string }) {
  const [state, setState] = useState<{ status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: LoginActivityData }>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const result = await settingsRequest<LoginActivityData>(`/api/admin/settings/login-activity?limit=${LIMIT}`, { signal });
      if (result.ok) setState({ status: "ready", data: result.data });
      else if (result.status !== 401) setState({ status: "error", message: result.error.message });
    } catch {
      // aborted (component unmounted)
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount; state is set when the request settles
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SettingsCard
      id="settings-activity"
      title="Login Activity"
      description="Recent sign-ins to your admin account."
      icon={<History size={19} strokeWidth={1.7} />}
      serifClassName={serifClassName}
      actions={
        state.status !== "loading" && (
          <button type="button" onClick={refresh} disabled={refreshing} className={`${secondaryButton} w-full sm:w-auto`}>
            {refreshing ? <LoaderCircle aria-hidden="true" size={16} className="animate-spin motion-reduce:animate-none" /> : <RefreshCw aria-hidden="true" size={16} />}
            Refresh
          </button>
        )
      }
    >
      <div aria-busy={state.status === "loading" || refreshing}>
        {state.status === "loading" && (
          <>
            <p className="sr-only" role="status">
              Loading login activity…
            </p>
            <Skeleton />
          </>
        )}

        {state.status === "error" && (
          <FormNotice
            notice={{
              tone: "error",
              text: state.message,
              action: (
                <button type="button" onClick={refresh} className="font-medium underline underline-offset-2">
                  Try again
                </button>
              ),
            }}
          />
        )}

        {state.status === "ready" && (
          <div className="admin-detail-in">
            <div className="grid gap-3 sm:grid-cols-2">
              <Summary title="This session" item={state.data.current} empty="This session's sign-in record isn't available yet. Refresh in a moment." highlight />
              <Summary title="Last login" item={state.data.lastLogin} empty="No earlier sign-in recorded. This is the first sign-in since login activity started being tracked." />
            </div>

            {state.data.failedLast30Days > 0 && (
              <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#c08a2d]/25 bg-[#c08a2d]/[0.07] px-3.5 py-2.5 text-sm text-[#6b4a12]">
                <AlertTriangle aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
                {state.data.failedLast30Days === 1 ? "1 failed sign-in attempt" : `${state.data.failedLast30Days} failed sign-in attempts`} with your email in the last 30 days. If that wasn&rsquo;t you, change your password.
              </p>
            )}

            <h3 className="mt-7 flex items-center gap-2 text-sm font-semibold text-[#1a0a0c]">
              <Clock3 aria-hidden="true" size={16} /> Recent activity
            </h3>

            {state.data.recent.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-black/15 px-5 py-8 text-center text-sm text-ink-2">No login activity recorded yet.</p>
            ) : (
              <>
                {/* Table (md and up) */}
                <table className="mt-3 hidden w-full table-fixed text-left text-sm md:table">
                  <caption className="sr-only">Your {state.data.recent.length} most recent sign-in attempts, newest first</caption>
                  <thead>
                    <tr className="text-[0.8125rem] text-ink-2">
                      <th scope="col" className="w-[34%] py-2.5 pr-3 font-medium">Date &amp; time</th>
                      <th scope="col" className="py-2.5 pr-3 font-medium">Device</th>
                      <th scope="col" className="py-2.5 pr-3 font-medium">Browser</th>
                      <th scope="col" className="w-[8.5rem] py-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.data.recent.map((item) => (
                      <tr key={item.id} className="border-t border-black/[0.06]">
                        <td className="py-3 pr-3 text-ink">
                          <LocalTime iso={item.loggedInAt} />
                          {item.isCurrent && <span className="ml-2 rounded-full bg-[#4a121a] px-2 py-0.5 text-[0.6875rem] font-medium text-[#F8F5F0]">This session</span>}
                        </td>
                        <td className="py-3 pr-3 text-ink-2">
                          <span className="flex items-center gap-2">
                            <DeviceIcon device={item.device} /> <span className="truncate">{deviceLabel(item)}</span>
                          </span>
                        </td>
                        <td className="truncate py-3 pr-3 text-ink-2">{browserLabel(item)}</td>
                        <td className="py-3">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Stacked cards (below md) */}
                <ul className="mt-3 space-y-2.5 md:hidden">
                  {state.data.recent.map((item) => (
                    <li key={item.id} className="rounded-lg border border-black/[0.07] bg-white p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-ink">
                          <LocalTime iso={item.loggedInAt} />
                        </p>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="mt-1.5 flex items-center gap-2 text-[0.8125rem] text-ink-2">
                        <DeviceIcon device={item.device} /> {deviceLabel(item)} · {browserLabel(item)}
                      </p>
                      {item.isCurrent && <p className="mt-2 inline-flex rounded-full bg-[#4a121a] px-2 py-0.5 text-[0.6875rem] font-medium text-[#F8F5F0]">This session</p>}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-4 text-xs text-ink-3">Times are shown in your local time zone. Records are kept for 180 days.</p>
          </div>
        )}
      </div>
    </SettingsCard>
  );
}
