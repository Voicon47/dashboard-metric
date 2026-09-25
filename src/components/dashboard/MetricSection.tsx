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
        className={`flex items-center justify-between px-3 py-1.5 ${theme.headerBg} text-white select-none`}
      >
        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-[12px] uppercase tracking-wide">
          <span className="shrink-0">{icon}</span>
          <span>{title}</span>
        </div>
        <div
          className={`font-mono font-bold text-[10.5px] sm:text-[11px] px-2.5 py-0.5 rounded-md border border-white/20 text-white shadow-2xs ${theme.summaryBg}`}
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

  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
      <div className="flex items-center gap-2 min-w-0 pr-2 flex-1">
        <span
          className={`text-[9.5px] font-bold font-mono px-1.5 py-0.5 rounded uppercase leading-none shrink-0 ${methodStyle}`}
        >
          {ep.method}
        </span>
        <span
          className="font-mono text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-semibold group-hover:text-black dark:group-hover:text-white truncate"
          title={ep.path}
        >
          {ep.path}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badgeContent}
        {rightPrimary && (
          <div className="flex flex-col items-end leading-[1.15]">
            <span
              className={`font-mono font-bold text-xs sm:text-[13px] tracking-tight ${primaryColor}`}
            >
              {rightPrimary}
            </span>
            {rightSecondary && (
              <span className="font-mono text-[9.5px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {rightSecondary}
              </span>
            )}
          </div>
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
  const color =
    lat >= thresholds.latencyDegraded
      ? "text-red-600 dark:text-red-400"
      : lat >= thresholds.latencyWarning
        ? "text-amber-600 dark:text-amber-400"
        : "text-slate-700 dark:text-slate-200";

  return (
    <BaseRow
      ep={ep}
      primaryColor={color}
      rightPrimary={`${lat.toFixed(1)}ms`}
      rightSecondary={`(Max: ${(ep.maxLatencyMs || Math.round(lat * 1.5)).toFixed(2)}ms)`}
    />
  );
});

export const RpsRow = React.memo(function RpsRow({ ep }: { ep: Endpoint }) {
  const formatRps = (val: number) => `${formatCompactNumber(val)} req/s`;
  const bwMb = (ep.rps * 0.12).toFixed(1);
  const bwLabel =
    Number(bwMb) > 1000
      ? `${(Number(bwMb) / 1024).toFixed(1)} GB/s`
      : `${bwMb} MB/s`;

  return (
    <BaseRow
      ep={ep}
      primaryColor="text-slate-800 dark:text-slate-200"
      rightPrimary={formatRps(ep.rps)}
      // rightSecondary={`(${bwLabel})`}
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

  return (
    <BaseRow
      ep={ep}
      badgeContent={
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded leading-none ${
              hasError
                ? "bg-[#c2410c] text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-500"
            }`}
          >
            4xx
          </span>
          <span
            className={`text-xs sm:text-[12.5px] font-bold flex items-center gap-1 ${
              hasError
                ? "text-[#c2410c] dark:text-orange-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {err.toFixed(2)}%{" "}
            <span className="text-[11px] font-bold">({count})</span>
          </span>
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

  return (
    <BaseRow
      ep={ep}
      badgeContent={
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded leading-none ${
              hasError
                ? "bg-[#b91c1c] text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-500"
            }`}
          >
            5xx
          </span>
          <span
            className={`text-xs sm:text-[12.5px] font-bold flex items-center gap-1 ${
              isDegraded
                ? "text-red-600 dark:text-red-400"
                : hasError
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {err.toFixed(2)}%{" "}
            <span className="text-[11px] font-bold">({count})</span>
          </span>
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
  return (
    <BaseRow
      ep={ep}
      primaryColor="text-slate-800 dark:text-slate-200"
      rightPrimary={`${lat.toFixed(1)}ms`}
      rightSecondary={`(Min: ${(ep.minLatencyMs ?? lat).toFixed(2)}ms)`}
    />
  );
});
