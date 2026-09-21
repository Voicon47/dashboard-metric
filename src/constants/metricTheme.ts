// ============================================================
// ADSUN Media Metrics Dashboard — Metric Section Color Tokens
// Chuẩn hóa bảng màu tập trung cho ServerColumnCard & MetricSection
// ============================================================

import type { ServerStatus } from "../types";

export type MetricSectionThemeKey =
  | "latency"
  | "rps"
  | "error4xx"
  | "error5xx"
  | "fastPath";

export interface MetricSectionTheme {
  border: string;
  headerBg: string;
  summaryBg: string;
  accentText?: string;
}

export const METRIC_SECTION_THEMES: Record<
  MetricSectionThemeKey,
  MetricSectionTheme
> = {
  // 1. ĐỘ TRỄ RESPONSE (AVG) - Đỏ (Red)
  latency: {
    border: "border-[#dc2626] dark:border-[#ef4444]", // 700→600 / 600→500
    headerBg: "bg-[#dc2626] dark:bg-[#b91c1c]", // 700→600 / 800→700
    summaryBg: "bg-[#991b1b]/90 dark:bg-black/40", // 900→800
    accentText: "text-red-500 dark:text-red-300", // 600→500 / 400→300
  },
  // 2. REQUEST NHIỀU NHẤT (TOP RPS) - Xanh dương (Blue) — giảm 1 nhịp
  rps: {
    border: "border-[#2563eb] dark:border-[#3b82f6]",
    headerBg: "bg-[#2563eb] dark:bg-[#1d4ed8]",
    summaryBg: "bg-[#1e40af]/90 dark:bg-black/40",
    accentText: "text-blue-500 dark:text-blue-300",
  },
  // 3. LỖI STATUSCODE 4XX - Cam (Orange) — giảm 1 nhịp
  error4xx: {
    border: "border-[#ea580c] dark:border-[#f97316]",
    headerBg: "bg-[#ea580c] dark:bg-[#c2410c]",
    summaryBg: "bg-[#9a3412]/90 dark:bg-black/40",
    accentText: "text-orange-500 dark:text-orange-300",
  },
  // 4. LỖI STATUSCODE 5XX - Xanh lục (Emerald) — giảm 1 nhịp
  error5xx: {
    border: "border-[#059669] dark:border-[#10b981]",
    headerBg: "bg-[#059669] dark:bg-[#047857]",
    summaryBg: "bg-[#065f46]/90 dark:bg-black/40",
    accentText: "text-emerald-500 dark:text-emerald-300",
  },
  // 5. ĐỘ TRỄ THẤP NHẤT (FAST PATH) - Xanh mòng két (Teal) — giảm 1 nhịp
  fastPath: {
    border: "border-[#0d9488] dark:border-[#14b8a6]",
    headerBg: "bg-[#0d9488] dark:bg-[#0f766e]",
    summaryBg: "bg-[#115e59]/90 dark:bg-black/40",
    accentText: "text-teal-500 dark:text-teal-300",
  },
};

// Aliases hỗ trợ tương thích nếu component truyền tên màu trực tiếp
export const COLOR_ALIAS_MAP: Record<string, MetricSectionThemeKey> = {
  red: "latency",
  blue: "rps",
  cyan: "rps",
  orange: "error4xx",
  yellow: "error4xx",
  emerald: "error5xx",
  teal: "fastPath",
};

export function getSectionTheme(
  key?: MetricSectionThemeKey | string,
): MetricSectionTheme {
  if (!key) return METRIC_SECTION_THEMES.latency;
  if (key in METRIC_SECTION_THEMES) {
    return METRIC_SECTION_THEMES[key as MetricSectionThemeKey];
  }
  const mapped = COLOR_ALIAS_MAP[key];
  if (mapped && METRIC_SECTION_THEMES[mapped]) {
    return METRIC_SECTION_THEMES[mapped];
  }
  return METRIC_SECTION_THEMES.latency;
}

// ─── HTTP Method Pill Badges ─────────────────────────────────────
export const METHOD_BADGE_STYLES: Record<string, string> = {
  GET: "bg-[#2563eb] text-white", // blue-700 → blue-600
  POST: "bg-[#16a34a] text-white", // green-700 → green-600
  PUT: "bg-[#d97706] text-white", // amber-700 → amber-600
  DELETE: "bg-[#dc2626] text-white", // red-700 → red-600
  PATCH: "bg-[#9333ea] text-white", // purple-700 → purple-600
};
export function getMethodBadgeStyle(method: string): string {
  return METHOD_BADGE_STYLES[method.toUpperCase()] || "bg-slate-600 text-white";
}

// ─── Server Status Indicator Colors ──────────────────────────────
export const STATUS_DOT_COLORS: Record<ServerStatus, string> = {
  online: "bg-emerald-500",
  degraded: "bg-amber-500",
  offline: "bg-red-500",
};

export const STATUS_OPTIONS: {
  status: ServerStatus;
  label: string;
  color: string;
}[] = [
  { status: "online", label: "Online", color: STATUS_DOT_COLORS.online },
  { status: "degraded", label: "Degraded", color: STATUS_DOT_COLORS.degraded },
  { status: "offline", label: "Offline", color: STATUS_DOT_COLORS.offline },
];

