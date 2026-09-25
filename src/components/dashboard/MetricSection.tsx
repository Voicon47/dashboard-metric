import React from "react";
import type { Endpoint } from "../../types";
import { useUIStore } from "../../store/useUIStore";
import {
  getSectionTheme,
  getMethodBadgeStyle,
  type MetricSectionThemeKey,
} from "../../constants/metricTheme";
import { formatCompactNumber } from "../../utils/formatUtils";

// ─── Metric Section Wrapper ──────────────────────────────────────
export interface MetricSectionProps {
  title: string;
  icon: React.ReactNode;
  summary: React.ReactNode;
  children: React.ReactNode;
  themeColor?: MetricSectionThemeKey | string;
}

export const MetricSection = React.memo(function MetricSection({
  title,
  icon,
  summary,
  children,
  themeColor = "blue",
}: MetricSectionProps) {
  const theme = getSectionTheme(themeColor);

  return (
    <div
      className={`mt-2.5 rounded-sm border-2 ${theme.border} overflow-hidden bg-white dark:bg-[#0c1220] shadow-xs`}
    >
      {/* Section Header */}
      <div
        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 ${theme.headerBg} text-white select-none`}
      >
        <div className="flex items-center gap-1.5 font-bold text-[10.5px] sm:text-[11px] uppercase tracking-wide min-w-0 flex-1">
          <span className="shrink-0">{icon}</span>
          <span className="truncate">{title}</span>
        </div>
        <div
          className={`shrink-0 whitespace-nowrap font-mono font-bold text-[10px] sm:text-[10.5px] px-2 py-0.5 rounded-md border border-white/20 text-white shadow-2xs ${theme.summaryBg}`}
        >
          {summary}
        </div>
      </div>
      {/* Rows Container */}
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
        {React.Children.count(children) === 0 ? (
          <div className="px-3 py-3 text-xs text-slate-400 italic text-center">
            Không có endpoint phù hợp
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
});

// ─── Shared Base Row ─────────────────────────────────────────────
interface BaseRowProps {
  ep: Endpoint;
  rightPrimary?: React.ReactNode;
  rightSecondary?: React.ReactNode;
  primaryColor?: string;
  badgeContent?: React.ReactNode;
}

const BaseRow = React.memo(function BaseRow({
  ep,
  rightPrimary,
  rightSecondary,
  primaryColor = "text-slate-700 dark:text-slate-200",
  badgeContent,
}: BaseRowProps) {
  const methodStyle = getMethodBadgeStyle(ep.method);

  const isSingleValue = rightPrimary && !rightSecondary && !badgeContent;

  if (isSingleValue) {
    return (
      <div className="flex items-center justify-between gap-3 px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className={`text-[9.5px] font-bold font-mono px-1.5 py-0.5 rounded uppercase leading-none shrink-0 ${methodStyle}`}
          >
            {ep.method}
          </span>
          <span
            className="font-mono text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-semibold group-hover:text-black dark:group-hover:text-white truncate flex-1 text-left"
            style={{ direction: "rtl" }}
            title={ep.path}
          >
            &lrm;{ep.path}
          </span>
        </div>
        <div className="flex items-center shrink-0">
          <span
            className={`font-mono font-bold text-xs sm:text-[13px] tracking-tight ${primaryColor}`}
          >
            {rightPrimary}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
      <div className="flex items-center gap-2 min-w-0 w-full">
        <span
          className={`text-[9.5px] font-bold font-mono px-1.5 py-0.5 rounded uppercase leading-none shrink-0 ${methodStyle}`}
        >
          {ep.method}
        </span>
        <span
          className="font-mono text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-semibold group-hover:text-black dark:group-hover:text-white truncate flex-1 text-left"
          style={{ direction: "rtl" }}
          title={ep.path}
        >
          &lrm;{ep.path}
        </span>
      </div>
      <div className="flex items-center justify-between w-full pl-0.5 mt-0.5">
        {rightPrimary && (
          <span
            className={`font-mono font-bold text-xs sm:text-[13px] tracking-tight ${primaryColor}`}
          >
            {rightPrimary}
          </span>
        )}
        {rightSecondary && (
          <span className="font-mono text-xs sm:text-[13px] font-bold tracking-tight">
            {rightSecondary}
          </span>
        )}
      </div>
    </div>
  );
});

// ─── Specific Row Renderers ──────────────────────────────────────

export const LatencyRow = React.memo(function LatencyRow({
  ep,
}: {
  ep: Endpoint;
}) {
  const thresholds = useUIStore((state) => state.settings.thresholds);
  const lat = ep.latencyCurrentAvgMs ?? (ep as any).latencyMs ?? 0;
  const maxLat = ep.maxLatencyMs || Math.round(lat * 1.5);
  
  const color =
    lat >= thresholds.latencyDegraded
      ? "text-red-600 dark:text-red-400"
      : lat >= thresholds.latencyWarning
        ? "text-amber-600 dark:text-amber-400"
        : "text-slate-700 dark:text-slate-200";

  const maxColor = 
    maxLat >= thresholds.latencyDegraded
      ? "text-red-600 dark:text-red-400"
      : maxLat >= thresholds.latencyWarning
        ? "text-amber-600 dark:text-amber-400"
        : "text-slate-700 dark:text-slate-200";

  return (
    <BaseRow
      ep={ep}
      primaryColor={color}
      rightPrimary={
        <div className="flex items-baseline gap-1">
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">AVG</span>
          <span>{lat.toFixed(1)}</span>
          <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400 ml-0.5">ms</span>
        </div>
      }
      rightSecondary={
        <div className="flex items-baseline gap-1">
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">MAX</span>
          <span className={maxColor}>{maxLat.toFixed(2)}</span>
          <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400 ml-0.5">ms</span>
        </div>
      }
    />
  );
});

export const RpsRow = React.memo(function RpsRow({ ep }: { ep: Endpoint }) {
  const formatRps = (val: number) => formatCompactNumber(val);
  
  return (
    <BaseRow
      ep={ep}
      primaryColor="text-slate-800 dark:text-slate-200"
      rightPrimary={
        <div className="flex items-baseline gap-1">
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">AVG</span>
          <span>{formatRps(ep.rps)}</span>
          <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400 ml-0.5">req/s</span>
        </div>
      }
    />
  );
});

export const Error4xxRow = React.memo(function Error4xxRow({
  ep,
}: {
  ep: Endpoint;
}) {
  const err = ep.errorRate4xx ?? (ep as any).errorRate ?? 0;
  const hasError = err > 0;
  const count = Math.round((err / 100) * ep.totalRequests);
  const color = hasError ? "text-[#c2410c] dark:text-orange-400" : "text-slate-700 dark:text-slate-300";

  return (
    <BaseRow
      ep={ep}
      primaryColor={color}
      rightPrimary={
        <div className="flex items-baseline gap-1">
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">RATE</span>
          <span>{err.toFixed(2)}</span>
          <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400 ml-0.5">%</span>
        </div>
      }
      rightSecondary={
        <div className="flex items-baseline gap-1">
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">COUNT</span>
          <span className={color}>{count}</span>
        </div>
      }
    />
  );
});

export const Error5xxRow = React.memo(function Error5xxRow({
  ep,
}: {
  ep: Endpoint;
}) {
  const thresholds = useUIStore((state) => state.settings.thresholds);
  const err = ep.errorRate5xx ?? (ep as any).errorRate ?? 0;
  const hasError = err > 0;
  const isDegraded = err >= thresholds.error5xxDegraded;
  const count = Math.round((err / 100) * ep.totalRequests);
  const color = isDegraded ? "text-red-600 dark:text-red-400" : hasError ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300";

  return (
    <BaseRow
      ep={ep}
      primaryColor={color}
      rightPrimary={
        <div className="flex items-baseline gap-1">
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">RATE</span>
          <span>{err.toFixed(2)}</span>
          <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400 ml-0.5">%</span>
        </div>
      }
      rightSecondary={
        <div className="flex items-baseline gap-1">
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">COUNT</span>
          <span className={color}>{count}</span>
        </div>
      }
    />
  );
});

export const FastLatencyRow = React.memo(function FastLatencyRow({
  ep,
}: {
  ep: Endpoint;
}) {
  const lat = ep.latencyCurrentAvgMs ?? 0;
  const minLat = ep.minLatencyMs ?? lat;
  
  return (
    <BaseRow
      ep={ep}
      primaryColor="text-slate-800 dark:text-slate-200"
      rightPrimary={
        <div className="flex items-baseline gap-1">
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">AVG</span>
          <span>{lat.toFixed(1)}</span>
          <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400 ml-0.5">ms</span>
        </div>
      }
      rightSecondary={
        <div className="flex items-baseline gap-1">
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">MIN</span>
          <span>{minLat.toFixed(2)}</span>
          <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400 ml-0.5">ms</span>
        </div>
      }
    />
  );
});
