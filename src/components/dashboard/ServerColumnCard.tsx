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
  Cpu,
  HardDrive,
  Activity,
} from "lucide-react";
import { useUIStore } from "../../store/useUIStore";
import { useEndpointTopMetrics } from "../../hooks/useEndpointTopMetrics";
import { QueueGauges } from "../queue/QueueGauges";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { formatCompactNumber, formatExactNumber } from "../../utils/formatUtils";

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

  // CPU Computations
  const cpuVal = server.metrics.cpuPercent.toFixed(1);
  const isCpuDegraded = server.metrics.cpuPercent >= thresholds.cpuDegraded;
  const isCpuWarning = server.metrics.cpuPercent >= thresholds.cpuWarning;
  const cpuColor = isCpuDegraded
    ? "text-red-600 dark:text-red-400"
    : isCpuWarning
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400";
  const cpuStatus = isCpuDegraded
    ? "Quá tải"
    : isCpuWarning
      ? "Cảnh báo"
      : "Ổn định";

  // RAM Computations
  const ramVal = `${(server.metrics.ramGB ?? 0).toFixed(1)}GB`;
  const heapMb = server.metrics.managedHeapMb
    ? `${Math.round(server.metrics.managedHeapMb)}M`
    : null;

  // RPS Computations
  const headerRps = formatCompactNumber(server.metrics.rps);
  const headerTotalReqs = formatCompactNumber(server.metrics.totalRequests);

  // 5XX Computations
  const errorRate5xx = server.metrics.errorRate5xx ?? 0;
  const header5xx = errorRate5xx.toFixed(2);
  const is5xxDegraded = errorRate5xx >= thresholds.error5xxDegraded;
  const is5xxWarning = errorRate5xx >= thresholds.error5xxWarning;
  const color5xx = is5xxDegraded
    ? "text-red-600 dark:text-red-400"
    : is5xxWarning
      ? "text-amber-600 dark:text-amber-400"
      : errorRate5xx === 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-slate-700 dark:text-slate-300";

  // Filter endpoints by method
  const filteredEndpoints = useMemo(() => {
    let list = server.endpoints;
    if (!endpointFilter) return list;

    if (endpointFilter.endpointMethod.length > 0) {
      list = list.filter((ep) =>
        endpointFilter.endpointMethod.includes(ep.method),
      );
    }

    return list;
  }, [server.endpoints, endpointFilter]);

  const { topLatency, topRps, top4xx, top5xx, topFast } =
    useEndpointTopMetrics(filteredEndpoints);

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
      } shrink-0 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col ${
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

      {/* ── Sub-bar: Modern 4-Card Metric Grid ── */}
      <div
        className={`grid grid-cols-4 ${
          isSingleServer ? "gap-2.5 sm:gap-3 p-2.5" : "gap-1.5 p-1.5"
        } mb-3.5 bg-slate-50/80 dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800/80 shadow-2xs`}
      >
        {/* 1. CPU */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-default text-center group min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <Cpu className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors" />
                <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  CPU
                </span>
              </div>
              <span
                className={`font-mono font-extrabold text-[13px] sm:text-sm tracking-tight leading-tight ${cpuColor}`}
              >
                {cpuVal}%
              </span>
              <span
                className={`text-[9.5px] font-mono font-semibold leading-none mt-1 ${
                  isCpuDegraded
                    ? "text-red-500 dark:text-red-400"
                    : isCpuWarning
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {cpuStatus}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p className="font-semibold text-slate-900 dark:text-white">
              CPU: {cpuVal}%
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Cảnh báo: &ge;{thresholds.cpuWarning}% | Quá tải: &ge;
              {thresholds.cpuDegraded}%
            </p>
          </TooltipContent>
        </Tooltip>

        {/* 2. RAM */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-default text-center group min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <HardDrive className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors" />
                <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  RAM
                </span>
              </div>
              <span className="font-mono font-extrabold text-[13px] sm:text-sm tracking-tight leading-tight text-slate-800 dark:text-slate-100">
                {ramVal}
              </span>
              <span className="text-[9.5px] font-mono font-semibold text-slate-500 dark:text-slate-400 leading-none mt-1 truncate max-w-full">
                {heapMb ? `${heapMb} heap` : "Heap OK"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p className="font-semibold text-slate-900 dark:text-white">
              RAM: {ramVal}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Managed Heap:{" "}
              {server.metrics.managedHeapMb
                ? `${server.metrics.managedHeapMb} MB`
                : "N/A"}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* 3. RPS */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-default text-center group min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <Activity className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
                <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  RPS
                </span>
              </div>
              <span className="font-mono font-extrabold text-[13px] sm:text-sm tracking-tight leading-tight text-blue-600 dark:text-blue-400">
                {headerRps}
              </span>
              <span className="text-[9.5px] font-mono font-semibold text-slate-500 dark:text-slate-400 leading-none mt-1 truncate max-w-full">
                {headerTotalReqs} tổng
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p className="font-semibold text-slate-900 dark:text-white">
              RPS: {formatExactNumber(server.metrics.rps)} req/giây
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Tổng số request: {formatExactNumber(server.metrics.totalRequests)}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* 4. 5XX */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-default text-center group min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <AlertOctagon
                  className={`w-3 h-3 ${
                    is5xxDegraded || is5xxWarning
                      ? "text-red-500"
                      : "text-slate-400 dark:text-slate-500"
                  } group-hover:text-amber-500 transition-colors`}
                />
                <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  5XX
                </span>
              </div>
              <span
                className={`font-mono font-extrabold text-[13px] sm:text-sm tracking-tight leading-tight ${color5xx}`}
              >
                {header5xx}%
              </span>
              <span className="text-[9.5px] font-mono font-semibold leading-none mt-1 truncate max-w-full">
                {errorRate5xx === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    0 lỗi
                  </span>
                ) : (
                  <span className="text-red-500 dark:text-red-400">
                    {server.metrics.errorCount5xx ?? 0} lỗi
                  </span>
                )}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p className="font-semibold text-slate-900 dark:text-white">
              Lỗi 5xx: {header5xx}%
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Cảnh báo: &ge;{thresholds.error5xxWarning}% | Nguy hiểm: &ge;
              {thresholds.error5xxDegraded}%
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div
        className={`flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar ${
          isSingleServer
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 [&>*]:mt-0"
            : "flex flex-col"
        }`}
      >
        {/* Section 6: Queue Monitor */}
        <QueueGauges queues={server.queues} />
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
          summary={`4xx: ${(server.metrics.errorRate4xx ?? 0).toFixed(2)}% (${server.metrics.errorCount4xx ?? 0})`}
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
              ? `${header5xx}% (${server.metrics.errorCount5xx ?? 0}) [CRIT]`
              : `5xx: ${header5xx}% (${server.metrics.errorCount5xx ?? 0}) [TỐT]`
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
});
