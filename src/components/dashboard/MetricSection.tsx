import React from "react";
import type { Endpoint } from "../../types";
import { useDashboardStore } from "../../store/useDashboardStore";
import {
  getSectionTheme,
  getMethodBadgeStyle,
  type MetricSectionThemeKey,
} from "../../constants/metricTheme";

// ─── Metric Section Wrapper ──────────────────────────────────────
export interface MetricSectionProps {
  title: string;
  icon: React.ReactNode;
  summary: React.ReactNode;
  children: React.ReactNode;
  themeColor?: MetricSectionThemeKey | string;
}

export function MetricSection({
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
        className={`flex items-center justify-between px-2.5 py-1.5 ${theme.headerBg} text-white select-none`}
      >
        <div className="flex items-center gap-1.5 font-bold text-[10px] sm:text-[10.5px] uppercase tracking-wide">
          <span className="shrink-0">{icon}</span>
          <span>{title}</span>
        </div>
        <div
          className={`font-mono font-bold text-[9px] sm:text-[9.5px] px-2 py-0.5 rounded border border-white/20 text-white shadow-2xs ${theme.summaryBg}`}
        >
          {summary}
        </div>
      </div>
      {/* Rows Container */}
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
        {children}
      </div>
    </div>
  );
}

// ─── Shared Base Row ─────────────────────────────────────────────
interface BaseRowProps {
  ep: Endpoint;
  rightPrimary?: React.ReactNode;
  rightSecondary?: React.ReactNode;
  primaryColor?: string;
  badgeContent?: React.ReactNode;
}

function BaseRow({
  ep,
  rightPrimary,
  rightSecondary,
  primaryColor = "text-slate-700 dark:text-slate-200",
  badgeContent,
}: BaseRowProps) {
  const methodStyle = getMethodBadgeStyle(ep.method);

  return (
    <div className="flex items-center justify-between px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
      <div className="flex items-center gap-1.5 min-w-0 pr-1.5">
        <span
          className={`text-[8px] font-extrabold font-mono px-1 py-0.5 rounded uppercase leading-none shrink-0 ${methodStyle}`}
        >
          {ep.method}
        </span>
        <span
          className="font-mono text-[9.5px] text-slate-700 dark:text-slate-300 font-semibold group-hover:text-black dark:group-hover:text-white truncate max-w-[130px] sm:max-w-[145px]"
          title={ep.path}
        >
          {ep.path}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {badgeContent}
        {rightPrimary && (
          <div className="flex flex-col items-end leading-[1.1]">
            <span className={`font-mono font-bold text-[10px] ${primaryColor}`}>
              {rightPrimary}
            </span>
            {rightSecondary && (
              <span className="font-mono text-[8.5px] text-slate-400 dark:text-slate-500 mt-0.5">
                {rightSecondary}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Specific Row Renderers ──────────────────────────────────────

export function LatencyRow({ ep }: { ep: Endpoint }) {
  const thresholds = useDashboardStore((state) => state.settings.thresholds);
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
}

export function RpsRow({ ep }: { ep: Endpoint }) {
  const formatRps = (val: number) =>
    val >= 1000 ? `${(val / 1000).toFixed(1)}k req/s` : `${val} req/s`;
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
      rightSecondary={`(${bwLabel})`}
    />
  );
}

export function Error4xxRow({ ep }: { ep: Endpoint }) {
  const err = ep.errorRate4xx ?? (ep as any).errorRate ?? 0;
  const hasError = err > 0;

  return (
    <BaseRow
      ep={ep}
      badgeContent={
        <div className="flex items-center gap-1 font-mono text-[9px] font-bold">
          <span
            className={`text-[8px] px-1 py-0.5 rounded leading-none ${
              hasError
                ? "bg-[#c2410c] text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-500"
            }`}
          >
            4xx
          </span>
          <span
            className={
              hasError
                ? "text-[#c2410c] dark:text-orange-400"
                : "text-slate-400 dark:text-slate-500"
            }
          >
            {err.toFixed(2)}%
          </span>
        </div>
      }
    />
  );
}

export function Error5xxRow({ ep }: { ep: Endpoint }) {
  const thresholds = useDashboardStore((state) => state.settings.thresholds);
  const err = ep.errorRate5xx ?? (ep as any).errorRate ?? 0;
  const hasError = err > 0;
  const isDegraded = err >= thresholds.error5xxDegraded;

  return (
    <BaseRow
      ep={ep}
      badgeContent={
        <div className="flex items-center gap-1 font-mono text-[9px] font-bold">
          <span
            className={`text-[8px] px-1 py-0.5 rounded leading-none ${
              hasError
                ? "bg-[#b91c1c] text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-500"
            }`}
          >
            5xx
          </span>
          <span
            className={
              isDegraded
                ? "text-red-600 dark:text-red-400"
                : hasError
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-400 dark:text-slate-500"
            }
          >
            {err.toFixed(2)}%
          </span>
        </div>
      }
    />
  );
}

export function FastLatencyRow({ ep }: { ep: Endpoint }) {
  const lat = ep.latencyCurrentAvgMs ?? 0;
  return (
    <BaseRow
      ep={ep}
      primaryColor="text-slate-800 dark:text-slate-200"
      rightPrimary={`${lat.toFixed(1)}ms`}
      rightSecondary={`(Min: ${(ep.minLatencyMs ?? lat).toFixed(2)}ms)`}
    />
  );
}
