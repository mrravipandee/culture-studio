/**
 * Small, dependency-free User-Agent summary for the login activity list.
 * Pure (no server APIs). Unknown agents are reported as "Unknown", never guessed.
 */

export interface UserAgentSummary {
  device: "Desktop" | "Mobile" | "Tablet" | "Unknown";
  browser: string;
  os: string;
}

const major = (ua: string, re: RegExp) => ua.match(re)?.[1]?.split(".")[0];

function browserOf(ua: string): string {
  const pick = (name: string, re: RegExp) => {
    const v = major(ua, re);
    return v ? `${name} ${v}` : name;
  };
  if (/Edg(?:e|A|iOS)?\//.test(ua)) return pick("Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/);
  if (/OPR\/|Opera/.test(ua)) return pick("Opera", /(?:OPR|Opera)\/([\d.]+)/);
  if (/SamsungBrowser\//.test(ua)) return pick("Samsung Internet", /SamsungBrowser\/([\d.]+)/);
  if (/Firefox\/|FxiOS\//.test(ua)) return pick("Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/);
  if (/CriOS\//.test(ua)) return pick("Chrome", /CriOS\/([\d.]+)/);
  if (/Chrome\/|Chromium\//.test(ua)) return pick("Chrome", /(?:Chrome|Chromium)\/([\d.]+)/);
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return pick("Safari", /Version\/([\d.]+)/);
  return "Unknown";
}

function osOf(ua: string): string {
  if (/iPad/.test(ua)) return "iPadOS";
  if (/iPhone|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function deviceOf(ua: string, os: string): UserAgentSummary["device"] {
  if (!ua) return "Unknown";
  if (/iPad|Tablet/.test(ua) || (os === "Android" && !/Mobile/.test(ua))) return "Tablet";
  if (/Mobi|iPhone|iPod/.test(ua)) return "Mobile";
  if (os === "Unknown") return "Unknown";
  return "Desktop";
}

export function summariseUserAgent(raw: string | null | undefined): UserAgentSummary {
  const ua = (raw ?? "").slice(0, 512);
  const os = osOf(ua);
  return { device: deviceOf(ua, os), browser: browserOf(ua), os };
}
