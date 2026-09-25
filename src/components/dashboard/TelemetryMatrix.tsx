// ============================================================
// ADSUN Dashboard — TelemetryMatrix.tsx
// "Bảng So Sánh Tổng Quan (System Telemetry Matrix)"
// ============================================================

import React from "react";
import {
  LayoutGrid,
  Cpu,
  HardDrive,
  Layers,
  BarChart3,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Inbox,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import type { ServerNode, MetricRowKey } from "../../types";
import { useServerStore } from "../../store/useServerStore";
import { useUIStore } from "../../store/useUIStore";
import { MatrixFilterBar } from "../filters/MatrixFilterBar";
import { formatCompactNumber, formatExactNumber } from "../../utils/formatUtils";
import { cn } from "../../lib/utils";
import {
  getMetricStatusColor,
  getSuccessRateColor,
  getError4xxColor,
  getRequestVolumeColor,
  getRamColor,
  getHeapColor,
  getRpsColor
} from "../../constants/metricTheme";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

interface MetricRowDef {
  key: MetricRowKey;
  label: string;
  icon?: React.ReactNode;
  thresholdLabel?: string;
  renderValue: (node: ServerNode) => React.ReactNode;
}

interface TelemetryMatrixProps {
  className?: string;
}

export function TelemetryMatrix({ className }: TelemetryMatrixProps = {}) {
  const servers = useServerStore((state) => state.servers);
  const thresholds = useUIStore((state) => state.settings.thresholds);
  const matrixFilter = useUIStore((state) => state.matrixFilter);

  const [hoveredRow, setHoveredRow] = React.useState<string | null>(null);

  // Legacy scroll logic removed in favor of Carousel

  const visibleServers =
    matrixFilter.serverIds.length > 0
      ? servers.filter((s) => matrixFilter.serverIds.includes(s.id))
      : servers;

  const rows: MetricRowDef[] = [
    // 1. CPU Usage (%)
    {
      key: "cpuPercent",
      label: "CPU Usage (%)",
      icon: <Cpu className="w-3.5 h-3.5 text-emerald-500 shrink-0" />,
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500 font-mono text-sm">—</span>;
        const cpu = node.metrics.cpuPercent;
        const color = getMetricStatusColor(cpu, thresholds.cpuWarning, thresholds.cpuDegraded);
        return (
          <span
            className={`font-mono font-extrabold text-xs sm:text-sm tracking-tight ${color}`}
          >
            {cpu.toFixed(1)}%
          </span>
        );
      },
    },
    // 2. RAM Usage (GB)
    {
      key: "ramGB",
      label: "RAM Usage (GB)",
      icon: <HardDrive className="w-3.5 h-3.5 text-indigo-500 shrink-0" />,
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500 font-mono text-sm">—</span>;

        const gb = (node.metrics.ramGB ?? 0);
        const colorClass = getRamColor(gb);

        return (
          <span className={`font-mono font-bold text-xs sm:text-sm tracking-tight ${colorClass}`}>
            {gb.toFixed(1)} GB
          </span>
        );
      },
    },
    // 3. Heap RAM (MB)
    {
      key: "managedHeapMb",
      label: "Heap RAM (MB)",
      icon: <Layers className="w-3.5 h-3.5 text-purple-500 shrink-0" />,
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500 font-mono text-sm">—</span>;

        const heap = (node.metrics.managedHeapMb ?? 0);
        const colorClass = getHeapColor(heap);

        return (
          <span className={`font-mono font-medium text-xs sm:text-[13px] ${colorClass}`}>
            {heap.toFixed(1)} MB
          </span>
        );
      },
    },
    {
      key: "totalRequests",
      label: "Total Requests",
      icon: <BarChart3 className="w-3.5 h-3.5 text-blue-500 shrink-0" />,
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500 font-mono text-sm">—</span>;

        const totalReq = node.metrics.totalRequests ?? 0;
        const colorClass = getRequestVolumeColor(totalReq);

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`font-mono font-bold text-xs sm:text-sm tracking-tight cursor-help border-b border-dashed border-slate-300 dark:border-slate-600 ${colorClass}`}>
                {formatCompactNumber(totalReq)}
              </span>
            </TooltipTrigger>
            <TooltipContent className="font-mono text-xs">
              {formatExactNumber(totalReq)} lượt
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    // 5. Ingest / Total RPS
    {
      key: "rps",
      label: "Ingest / Total RPS",
      icon: <Activity className="w-3.5 h-3.5 text-cyan-500 shrink-0" />,
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="font-mono text-xs sm:text-sm text-slate-400 dark:text-slate-500">—</span>;
        const rps = node.metrics.rps ?? 0;
        const colorClass = getRpsColor(rps);
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`font-mono font-bold text-xs sm:text-sm tracking-tight cursor-help border-b border-dashed border-slate-300 dark:border-slate-600 ${colorClass}`}>
                {formatCompactNumber(rps)}
              </span>
            </TooltipTrigger>
            <TooltipContent className="font-mono text-xs">
              {formatExactNumber(rps)} req/s
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    // 6. Latency (Avg/Min/Max)
    {
      key: "latencyCurrentAvgMs",
      label: "Latency (Avg/Min/Max)",
      icon: <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-400 dark:text-slate-500 font-mono text-xs sm:text-sm">—</span>;
        const avg = node.metrics.latencyCurrentAvgMs ?? 0;
        const min = node.metrics.minLatencyMs ?? avg;
        const max = node.metrics.maxLatencyMs ?? avg;
        const color = getMetricStatusColor(avg, thresholds.latencyWarning, thresholds.latencyDegraded);
        const displayMax = max >= 10000 ? formatCompactNumber(max) : max.toFixed(1);
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`font-mono font-extrabold text-[11px] sm:text-[12px] tracking-tight cursor-help ${color}`}
              >
                {avg.toFixed(1)}
                <span className="opacity-40 mx-px">/</span>
                {min.toFixed(1)}
                <span className="opacity-40 mx-px">/</span>
                {displayMax}
                <span className="text-[10px] ml-0.5 opacity-80 font-bold">ms</span>
              </span>
            </TooltipTrigger>
            <TooltipContent className="font-mono text-xs">
              <div className="flex flex-col gap-0.5">
                <div>Trung bình: {avg.toFixed(2)} ms</div>
                <div>Tối thiểu: {min.toFixed(2)} ms</div>
                <div>Tối đa: {formatExactNumber(max)} ms</div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      },
    },

    // 7. Success Rate (2xx/3xx)
    {
      key: "successRate",
      label: "Success Rate (2xx/3xx)",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />,
      renderValue: (node) => {
        if (node.status === "offline")
          return (
            <span className="font-mono text-xs sm:text-sm text-slate-400 dark:text-slate-500">—</span>
          );
        const rate = node.metrics.successRate ?? 0;
        const color = getSuccessRateColor(rate);
        return (
          <span
            className={`font-mono font-extrabold text-xs sm:text-sm tracking-tight ${color}`}
          >
            {rate.toFixed(2)}%
          </span>
        );
      },
    },
    // 8. 4xx Error Rate (%)
    {
      key: "errorRate4xx",
      label: "4xx Error Rate (%)",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />,
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500 font-mono text-sm">—</span>;
        const err4 = node.metrics.errorRate4xx ?? 0;
        const count = node.metrics.errorCount4xx ?? 0;
        const color = getError4xxColor(err4);
        return (
          <span
            className={`font-mono font-extrabold text-xs sm:text-sm tracking-tight ${color}`}
          >
            {err4.toFixed(2)}%{" "}
            <span className="font-normal text-[11px] opacity-80">
              ({count})
            </span>
          </span>
        );
      },
    },
    // 9. 5xx Error Rate (%)
    {
      key: "errorRate5xx",
      label: "5xx Error Rate (%)",
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-500 shrink-0" />,
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500 font-mono text-sm">—</span>;
        const err = node.metrics.errorRate5xx ?? 0;
        const count = node.metrics.errorCount5xx ?? 0;
        const color = getMetricStatusColor(err, thresholds.error5xxWarning, thresholds.error5xxDegraded);
        return (
          <span
            className={`font-mono font-extrabold text-xs sm:text-sm tracking-tight ${color}`}
          >
            {err.toFixed(2)}%{" "}
            <span className="font-normal text-[11px] opacity-80">
              ({count})
            </span>
          </span>
        );
      },
    },
    // 10. Total Queue
    {
      key: "totalQueue",
      label: "Total Queue",
      icon: <Inbox className="w-3.5 h-3.5 text-violet-500 shrink-0" />,
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500 font-mono text-sm">—</span>;
        if (!node.queues)
          return <span className="text-slate-500 font-mono text-sm">—</span>;

        const q = node.queues;
        const total =
          (q.Image || 0) +
          (q.Video || 0) +
          (q.CameraDebugLog || 0) +
          (q.ErrorImageLog || 0) +
          (q.EventAI || 0) +
          (q.AIConfig || 0);

        const colorClass = getMetricStatusColor(total, thresholds.queueWarning, thresholds.queueDegraded);

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`font-mono font-bold text-xs sm:text-sm tracking-tight cursor-help border-b border-dashed border-slate-300 dark:border-slate-600 ${colorClass}`}>
                {formatCompactNumber(total)}{" "}
                <span className="opacity-80 text-[11px] font-normal border-none">
                  ({formatCompactNumber(q.Image || 0)} - {formatCompactNumber(q.Video || 0)})
                </span>
              </span>
            </TooltipTrigger>
            <TooltipContent className="font-mono text-xs">
              <div className="flex flex-col gap-1">
                <div>Total: {formatExactNumber(total)}</div>
                <div className="text-slate-400">Image: {formatExactNumber(q.Image || 0)}</div>
                <div className="text-slate-400">Video: {formatExactNumber(q.Video || 0)}</div>
                <div className="text-slate-400">EventAI: {formatExactNumber(q.EventAI || 0)}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      },
    },
  ];

  const visibleRows = rows.filter(
    (row) => !matrixFilter.hiddenMetricKeys.includes(row.key),
  );

  return (
    <Carousel
      opts={{
        align: "start",
        containScroll: "trimSnaps",
        loop: false,
      }}
      className={cn(
        "bg-white dark:bg-[#0c101d] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-start h-full max-h-[540px] min-h-0 min-w-0 overflow-hidden flex-1",
        className
      )}
    >
      {/* ─── Header: Title, Subtitle, Filter, Legend ─────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 shrink-0">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Bảng So Sánh Tổng Quan
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Dữ liệu telemetry trực tiếp theo thời gian thực
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <MatrixFilterBar servers={servers} />
          {visibleServers.length > 0 && (
            <div className="flex items-center gap-1.5 ml-1">
              <CarouselPrevious className="static translate-y-0 left-0 right-0 h-8 w-8 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300" />
              <CarouselNext className="static translate-y-0 left-0 right-0 h-8 w-8 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300" />
            </div>
          )}
        </div>
      </div>

      {/* ─── Matrix Table (Flexbox + Carousel) ─── */}
      <div className="flex bg-white dark:bg-[#0c101d] border border-slate-200/90 dark:border-slate-800/90 rounded-xl overflow-hidden shadow-2xs w-full max-w-full flex-1 min-h-0">
        {/* Sticky Left Column (Metrics) */}
        <div className="w-56 sm:w-60 min-w-[210px] max-w-[240px] shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-[#f8fafc] dark:bg-[#0f1422] flex flex-col z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
          {/* Header Cell */}
          <div className="h-[68px] min-h-[68px] max-h-[68px] shrink-0 px-3.5 flex items-center text-slate-500 dark:text-slate-400 font-semibold text-[11px] sm:text-xs uppercase tracking-wider border-b border-slate-200 dark:border-[#1a2336] box-border overflow-hidden">
            Metric Tên / Tham Số Đo
          </div>
          {/* Rows Cells */}
          {visibleRows.length === 0 ? (
            <div className="h-12 px-3.5 py-1.5 flex items-center text-slate-400 italic text-xs">
              Chưa bật metric nào.
            </div>
          ) : (
            visibleRows.map((row) => (
              <div
                key={row.key}
                onMouseEnter={() => setHoveredRow(row.key)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`h-[37px] min-h-[37px] max-h-[37px] shrink-0 px-3.5 flex items-center border-b border-slate-100 dark:border-[#151e30] last:border-b-0 box-border overflow-hidden transition-colors ${hoveredRow === row.key ? "bg-slate-50 dark:bg-[#121929]" : ""
                  }`}
              >
                <div className="flex items-center gap-2 w-full">
                  {row.icon && (
                    <div className="p-1 rounded-md bg-slate-100/90 dark:bg-slate-800/70 shrink-0">
                      {row.icon}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs sm:text-[12.5px] text-slate-800 dark:text-slate-100 truncate">
                      {row.label}
                    </div>
                    {row.thresholdLabel && (
                      <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500 tracking-tight truncate">
                        {row.thresholdLabel}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Carousel (Servers) */}
        <div className="flex-1 min-w-0 h-full">
          <CarouselContent wrapperClassName="h-full" className="ml-0 h-full">
            {visibleServers.length === 0 ? (
              <CarouselItem className="pl-0 basis-full flex items-center justify-center text-slate-400 italic text-xs h-[68px]">
                Vui lòng chọn ít nhất một Server để xem dữ liệu so sánh.
              </CarouselItem>
            ) : (
              visibleServers.map((node) => {
                const isOffline = node.status === "offline";
                const isDegraded = node.status === "degraded";

                return (
                  <CarouselItem
                    key={node.id}
                    className="pl-0 basis-full sm:basis-1/2 lg:basis-1/4 min-w-0 shrink-0 grow-0 border-r border-slate-100 dark:border-slate-800/50 last:border-r-0 flex flex-col h-full"
                  >
                    {/* Header Cell */}
                    <div className="h-[68px] min-h-[68px] max-h-[68px] shrink-0 px-2 py-1.5 flex flex-col items-center justify-center gap-0.5 border-b border-slate-200 dark:border-[#1a2336] bg-[#f8fafc] dark:bg-[#0f1422] box-border overflow-hidden">
                      <div className="flex items-center gap-1.5 font-mono font-bold leading-tight">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${node.status === "online"
                            ? "bg-emerald-500 animate-pulse"
                            : isDegraded
                              ? "bg-amber-500"
                              : "bg-slate-400"
                            }`}
                        />
                        <span className="text-xs sm:text-sm font-bold tracking-tight truncate max-w-[110px]">
                          {node.name}
                        </span>
                      </div>
                      <Badge
                        variant={node.status}
                        className="uppercase text-[9px] px-2 py-0 h-4 font-semibold tracking-wide leading-none"
                      >
                        {node.status}
                      </Badge>
                      {node.roleDescription && (
                        <div
                          className={`text-[10px] font-normal italic lowercase truncate w-full text-center leading-tight ${isOffline
                            ? "text-red-500/80 dark:text-red-400/80"
                            : "text-slate-400 dark:text-slate-500"
                            }`}
                        >
                          {node.roleDescription}
                        </div>
                      )}
                    </div>

                    {/* Rows Cells */}
                    {visibleRows.map((row) => (
                      <div
                        key={row.key}
                        onMouseEnter={() => setHoveredRow(row.key)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className={`h-[37px] min-h-[37px] max-h-[37px] shrink-0 px-1.5 flex items-center justify-center whitespace-nowrap border-b border-slate-100 dark:border-[#151e30] last:border-b-0 box-border overflow-hidden transition-colors ${hoveredRow === row.key ? "bg-slate-50/80 dark:bg-[#121929]" : ""
                          }`}
                      >
                        {row.renderValue(node)}
                      </div>
                    ))}
                  </CarouselItem>
                );
              })
            )}
          </CarouselContent>
        </div>
      </div>
    </Carousel>
  );
}
