import React, { useMemo } from "react";
import { Badge } from "../ui/badge";
import type { ServerNode } from "../../types";
import {
  MetricSection,
  LatencyRow,
  RpsRow,
  Error4xxRow,
  Error5xxRow,
  FastLatencyRow,
} from "./MetricSection";
import {
  Clock,
  Zap,
  AlertTriangle,
  AlertOctagon,
  RotateCw,
} from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";

export interface ServerColumnCardProps {
  server: ServerNode;
}

export function ServerColumnCard({ server }: ServerColumnCardProps) {
  const thresholds = useDashboardStore((state) => state.settings.thresholds);
  const isDegraded = server.status === "degraded";
  const isOffline = server.status === "offline";

  const cpuVal = server.metrics.cpuPercent.toFixed(1);
  const ramVal = `${(server.metrics.ramGB ?? 0).toFixed(1)}GB`;

  const headerRps =
    server.metrics.rps >= 1000
      ? `${(server.metrics.rps / 1000).toFixed(1)}k`
      : `${server.metrics.rps}`;

  const headerTotalReqs =
    server.metrics.totalRequests >= 1000
      ? `${(server.metrics.totalRequests / 1000).toFixed(1)}k`
      : `${server.metrics.totalRequests}`;
  const header5xx = (server.metrics.errorRate5xx ?? 0).toFixed(2);

  // Pre-sort endpoints for the different sections
  // 1. Top Latency
  const topLatency = useMemo(() => {
    return [...server.endpoints]
      .sort(
        (a, b) => (b.latencyCurrentAvgMs ?? 0) - (a.latencyCurrentAvgMs ?? 0),
      )
      .slice(0, 5);
  }, [server.endpoints]);

  // 2. Top RPS
  const topRps = useMemo(() => {
    return [...server.endpoints].sort((a, b) => b.rps - a.rps).slice(0, 5);
  }, [server.endpoints]);

  // 3. Top 4xx
  const top4xx = useMemo(() => {
    return [...server.endpoints]
      .sort((a, b) => (b.errorRate4xx ?? 0) - (a.errorRate4xx ?? 0))
      .slice(0, 5);
  }, [server.endpoints]);

  // 4. Top 5xx
  const top5xx = useMemo(() => {
    return [...server.endpoints]
      .sort((a, b) => (b.errorRate5xx ?? 0) - (a.errorRate5xx ?? 0))
      .slice(0, 5);
  }, [server.endpoints]);

  // 5. Fast Path (Lowest latency)
  const topFast = useMemo(() => {
    return [...server.endpoints]
      .sort(
        (a, b) => (a.latencyCurrentAvgMs ?? 0) - (b.latencyCurrentAvgMs ?? 0),
      )
      .slice(0, 5);
  }, [server.endpoints]);

  // Use real minLatencyMs for Fast Path header
  const minFast =
    topFast.length > 0
      ? (
          topFast[0].minLatencyMs ??
          topFast[0].latencyCurrentAvgMs ??
          0
        ).toFixed(1)
      : "0";

  return (
    <div
      className={`min-w-[320px] max-w-[360px] snap-center shrink-0 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col ${
        isOffline
          ? "bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 opacity-70"
          : isDegraded
            ? "bg-[#fff8f8] dark:bg-[#1a0f16]/90 border border-[#fca5a5] dark:border-red-900/50"
            : "bg-white dark:bg-[#0b1120]/90 border border-slate-200 dark:border-slate-800/80"
      }`}
    >
      {/* ── Column Top Header: Server Tag + Status Badge ── */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-2 font-mono">
          <span
            className={`font-bold text-xs ${
              isOffline
                ? "text-slate-500 dark:text-slate-400"
                : isDegraded
                  ? "text-red-700 dark:text-red-400"
                  : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {server.name}
          </span>
        </div>

        <Badge
          variant="outline"
          className={`uppercase text-[8px] font-bold px-2 py-0 h-4 border-0 ${
            isOffline
              ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              : isDegraded
                ? "bg-red-500 text-white"
                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
          }`}
        >
          {isOffline
            ? "DISCONNECTED"
            : isDegraded
              ? "OUTLIER ALERT"
              : "OPTIMAL STABLE"}
        </Badge>
      </div>

      {/* ── Sub-bar: Metrics Grid ── */}
      <div className="grid grid-cols-2 gap-y-1.5 text-[10px] font-mono mb-3 p-2 bg-slate-50/80 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-700/50">
        {/* CPU */}
        <div className="flex justify-between items-center pr-2 border-r border-slate-200 dark:border-slate-700/50">
          <span className="text-slate-400 dark:text-slate-500">CPU</span>
          <span
            className={`font-bold ${
              server.metrics.cpuPercent >= thresholds.cpuDegraded
                ? "text-red-600 dark:text-red-500"
                : server.metrics.cpuPercent >= thresholds.cpuWarning
                  ? "text-amber-600 dark:text-amber-500"
                  : "text-emerald-600 dark:text-emerald-500"
            }`}
          >
            {cpuVal}%
          </span>
        </div>
        {/* RAM */}
        <div className="flex justify-between items-center pl-2">
          <span className="text-slate-400 dark:text-slate-500">RAM</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {ramVal}{" "}
            <span className="font-normal text-[8px] opacity-70">
              ({server.metrics.managedHeapMb}M)
            </span>
          </span>
        </div>
        {/* RPS */}
        <div className="flex justify-between items-center pr-2 border-r border-slate-200 dark:border-slate-700/50">
          <span className="text-slate-400 dark:text-slate-500">RPS</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {headerRps}{" "}
            <span className="font-normal text-[8px] opacity-70">
              ({headerTotalReqs})
            </span>
          </span>
        </div>
        {/* 5xx */}
        <div className="flex justify-between items-center pl-2">
          <span className="text-slate-400 dark:text-slate-500">5xx</span>
          <span
            className={`font-bold ${
              (server.metrics.errorRate5xx ?? 0) >= thresholds.error5xxDegraded
                ? "text-red-600 dark:text-red-500"
                : (server.metrics.errorRate5xx ?? 0) >=
                    thresholds.error5xxWarning
                  ? "text-amber-600 dark:text-amber-500"
                  : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {header5xx}%
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
        {/* Section 1: Top Latency */}
        <MetricSection
          title="1. ĐỘ TRỄ RESPONSE (AVG)"
          icon={<Clock className="w-3 h-3" />}
          summary={`Max: ${(server.metrics.maxLatencyMs ?? 0).toFixed(2)}ms`}
          themeColor="latency"
        >
          {topLatency.map((ep) => (
            <LatencyRow key={`lat-${ep.id}`} ep={ep} />
          ))}
        </MetricSection>

        {/* Section 2: Top RPS */}
        <MetricSection
          title="2.TOP REQUEST"
          icon={<RotateCw className="w-3 h-3" />}
          summary={`${headerRps} rps`}
          themeColor="rps"
        >
          {topRps.map((ep) => (
            <RpsRow key={`rps-${ep.id}`} ep={ep} />
          ))}
        </MetricSection>

        {/* Section 3: 4xx Errors */}
        <MetricSection
          title="3.STATUSCODE 4XX"
          icon={<AlertTriangle className="w-3 h-3" />}
          summary={`4xx Rate: ${(server.metrics.errorRate4xx ?? 0).toFixed(2)}%`}
          themeColor="error4xx"
        >
          {top4xx.map((ep) => (
            <Error4xxRow key={`4xx-${ep.id}`} ep={ep} />
          ))}
        </MetricSection>

        {/* Section 4: 5xx Errors */}
        <MetricSection
          title="4.STATUSCODE 5XX"
          icon={<AlertOctagon className="w-3 h-3" />}
          summary={
            (server.metrics.errorRate5xx ?? 0) > 5
              ? `${header5xx}% [CRIT]`
              : `5xx: ${header5xx}% [TỐT]`
          }
          themeColor="error5xx"
        >
          {top5xx.map((ep) => (
            <Error5xxRow key={`5xx-${ep.id}`} ep={ep} />
          ))}
        </MetricSection>

        {/* Section 5: Fast Path */}
        <MetricSection
          title="5. LOW LATENCY"
          icon={<Zap className="w-3 h-3" />}
          summary={`${minFast}ms min`}
          themeColor="fastPath"
        >
          {topFast.map((ep) => (
            <FastLatencyRow key={`fast-${ep.id}`} ep={ep} />
          ))}
        </MetricSection>
      </div>
    </div>
  );
}
