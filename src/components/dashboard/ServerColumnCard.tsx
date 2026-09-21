import React, { useMemo } from "react";
import { Badge } from "../ui/badge";
import type { ServerNode, ServerColumnsFilter, Endpoint } from "../../types";
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
import { useUIStore } from "../../store/useUIStore";
import { useEndpointTopMetrics } from "../../hooks/useEndpointTopMetrics";
import { QueueGauges } from "../queue/QueueGauges";

export interface ServerColumnCardProps {
  server: ServerNode;
  endpointFilter?: ServerColumnsFilter;
  serverCount?: number;
}

export const ServerColumnCard = React.memo(function ServerColumnCard({
  server,
  endpointFilter,
  serverCount = 1,
}: ServerColumnCardProps) {
  const isSingleServer = serverCount === 1;
  const thresholds = useUIStore((state) => state.settings.thresholds);
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

  // Filter endpoints by method
  const filteredEndpoints = useMemo(() => {
    let list = server.endpoints;
    if (!endpointFilter) return list;

    if (endpointFilter.endpointMethod.length > 0) {
      list = list.filter((ep) =>
        endpointFilter.endpointMethod.includes(ep.method)
      );
    }

    return list;
  }, [server.endpoints, endpointFilter]);

  const {
    topLatency,
    topRps,
    top4xx,
    top5xx,
    topFast,
  } = useEndpointTopMetrics(filteredEndpoints);

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
      className={`${
        isSingleServer
          ? "w-full min-w-0"
          : "flex-1 min-w-[310px] sm:min-w-[330px]"
      } snap-center shrink-0 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col ${
        isOffline
          ? "bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 opacity-70"
          : isDegraded
            ? "bg-[#fff8f8] dark:bg-[#1a0f16]/90 border border-[#fca5a5] dark:border-red-900/50"
            : "bg-white dark:bg-[#0b1120]/90 border border-slate-200 dark:border-slate-800/80"
      }`}
    >
      {/* ── Column Top Header: Server Tag + Status Badge ── */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 font-mono">
          <span
            className={`font-bold text-sm sm:text-[15px] tracking-tight ${
              isOffline
                ? "text-slate-500 dark:text-slate-400"
                : isDegraded
                  ? "text-red-700 dark:text-red-400"
                  : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {server.name}
          </span>
          {filteredEndpoints.length !== server.endpoints.length && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold">
              ({filteredEndpoints.length}/{server.endpoints.length})
            </span>
          )}
        </div>

        <Badge
          variant={server.status}
          className="uppercase text-[10px] px-2 py-0.5 font-semibold"
        >
          {server.status}
        </Badge>
      </div>

      {/* ── Sub-bar: Metrics Grid ── */}
      <div
        className={`grid ${
          isSingleServer
            ? "grid-cols-2 sm:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
        } gap-2.5 mb-3.5 p-2.5 bg-slate-50/90 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs`}
      >
        {/* CPU */}
        <div className="flex items-baseline justify-between px-1.5 py-0.5 border-r border-slate-200 dark:border-slate-700/50">
          <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
            CPU
          </span>
          <span
            className={`font-mono font-extrabold text-sm sm:text-[15px] tracking-tight ${
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
        <div className="flex items-baseline justify-between px-1.5 py-0.5 sm:border-r lg:border-r-0 xl:border-r border-slate-200 dark:border-slate-700/50">
          <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
            RAM
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono font-extrabold text-sm sm:text-[15px] tracking-tight text-slate-800 dark:text-slate-200">
              {ramVal}
            </span>
            <span className="font-mono text-[9.5px] text-slate-400 dark:text-slate-500">
              ({server.metrics.managedHeapMb}M)
            </span>
          </div>
        </div>
        {/* RPS */}
        <div className="flex items-baseline justify-between px-1.5 py-0.5 border-r border-slate-200 dark:border-slate-700/50">
          <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
            RPS
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono font-extrabold text-sm sm:text-[15px] tracking-tight text-slate-800 dark:text-slate-200">
              {headerRps}
            </span>
            <span className="font-mono text-[9.5px] text-slate-400 dark:text-slate-500">
              ({headerTotalReqs})
            </span>
          </div>
        </div>
        {/* 5xx */}
        <div className="flex items-baseline justify-between px-1.5 py-0.5">
          <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
            5xx
          </span>
          <span
            className={`font-mono font-extrabold text-sm sm:text-[15px] tracking-tight ${
              (server.metrics.errorRate5xx ?? 0) >= thresholds.error5xxDegraded
                ? "text-red-600 dark:text-red-500"
                : (server.metrics.errorRate5xx ?? 0) >=
                    thresholds.error5xxWarning
                  ? "text-amber-600 dark:text-amber-500"
                  : "text-slate-700 dark:text-slate-300"
            }`}
          >
            {header5xx}%
          </span>
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar ${
          isSingleServer
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 [&>*]:mt-0"
            : "flex flex-col"
        }`}
      >
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

        {/* Section 6: Queue Monitor */}
        <QueueGauges queues={server.queues} />
      </div>
    </div>
  );
});
