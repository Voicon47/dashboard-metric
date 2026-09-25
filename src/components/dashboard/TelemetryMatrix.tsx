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

  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;

      const isAtLeft = el.scrollLeft <= 0;
      const isAtRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

      const isScrollingLeft = e.deltaY < 0;
      const isScrollingRight = e.deltaY > 0;

      // Allow vertical scroll if we are at the horizontal edges
      if ((isAtLeft && isScrollingLeft) || (isAtRight && isScrollingRight)) {
        return;
      }

      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

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
        const color =
          cpu >= thresholds.cpuDegraded
            ? "text-[#f87171]"
            : cpu >= thresholds.cpuWarning
              ? "text-[#fbbf24]"
              : "text-[#4ade80]";
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

        const gb = (node.metrics.ramGB ?? 0).toFixed(1);

        return (
          <span className="font-mono font-bold text-xs sm:text-sm tracking-tight text-slate-800 dark:text-slate-200">
            {gb} GB
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

        const heap = (node.metrics.managedHeapMb ?? 0).toFixed(1);

        return (
          <span className="font-mono font-medium text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
            {heap} MB
          </span>
        );
      },
    },
    // 4. Total Requests
    {
      key: "totalRequests",
      label: "Total Requests",
      icon: <BarChart3 className="w-3.5 h-3.5 text-blue-500 shrink-0" />,
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500 font-mono text-sm">—</span>;

        const totalReq = node.metrics.totalRequests ?? 0;
        
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-mono font-bold text-xs sm:text-sm tracking-tight text-slate-800 dark:text-slate-200 cursor-help border-b border-dashed border-slate-300 dark:border-slate-600">
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
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-mono font-bold text-xs sm:text-sm tracking-tight text-slate-700 dark:text-slate-300 cursor-help border-b border-dashed border-slate-300 dark:border-slate-600">
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
        const color =
          avg >= thresholds.latencyDegraded
            ? "text-[#f87171]"
            : avg >= thresholds.latencyWarning
              ? "text-[#fbbf24]"
              : "text-[#4ade80]";
        return (
          <span
            className={`font-mono font-extrabold text-xs sm:text-sm ${color}`}
          >
            {avg.toFixed(1)} / {min.toFixed(1)} / {max.toFixed(1)} ms
          </span>
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
        const color =
          rate < 96
            ? "text-[#f87171]"
            : rate < 99
              ? "text-[#fbbf24]"
              : "text-[#4ade80]";
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
        const color = err4 >= 5.0 ? "text-[#fbbf24]" : "text-[#4ade80]";
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
        const color =
          err >= thresholds.error5xxDegraded
            ? "text-[#f87171]"
            : err >= thresholds.error5xxWarning
              ? "text-[#fbbf24]"
              : "text-[#4ade80]";
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
          q.Image +
          q.Video +
          q.CameraDebugLog +
          q.ErrorImageLog +
          q.EventAI +
          q.AIConfig;

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-mono font-bold text-xs sm:text-sm tracking-tight text-slate-800 dark:text-slate-200 cursor-help border-b border-dashed border-slate-300 dark:border-slate-600">
                {formatCompactNumber(total)}{" "}
                <span className="text-slate-500 text-[11px] font-normal border-none">
                  ({formatCompactNumber(q.Image)} - {formatCompactNumber(q.Video)})
                </span>
              </span>
            </TooltipTrigger>
            <TooltipContent className="font-mono text-xs">
              <div className="flex flex-col gap-1">
                <div>Total: {formatExactNumber(total)}</div>
                <div className="text-slate-400">Image: {formatExactNumber(q.Image)}</div>
                <div className="text-slate-400">Video: {formatExactNumber(q.Video)}</div>
                <div className="text-slate-400">EventAI: {formatExactNumber(q.EventAI)}</div>
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
    <section
      className={cn(
        "bg-white dark:bg-[#0c101d] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-start h-full max-h-[510px] min-h-[510px] min-w-0 overflow-hidden",
        className
      )}
    >
      {/* ─── Header: Title, Subtitle, Filter, Legend ─────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4.5 bg-blue-500 rounded-full shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Bảng So Sánh Tổng Quan
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Dữ liệu telemetry trực tiếp theo thời gian thực
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <MatrixFilterBar servers={servers} />
        </div>
      </div>

      {/* ─── Matrix Table (Horizontal scroll ONLY, vertical scroll disabled) ─── */}
      <div 
        ref={scrollRef}
        className="bg-white dark:bg-[#0c101d] border border-slate-200/90 dark:border-slate-800/90 rounded-xl overflow-x-auto overflow-y-hidden custom-scrollbar shadow-2xs transition-colors w-full max-w-full"
      >
        <table className="w-full text-xs text-left border-collapse min-w-max">
          {/* Table Header: Metric Name + Server Columns */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1a2336] bg-[#f8fafc] dark:bg-[#0f1422]">
              <th className="sticky left-0 bg-[#f8fafc] dark:bg-[#0f1422] z-20 px-3.5 py-2.5 w-60 min-w-[220px] max-w-[240px] text-slate-500 dark:text-slate-400 font-semibold text-[11px] sm:text-xs uppercase tracking-wider shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] border-r border-slate-200/80 dark:border-slate-800/80">
                Metric Tên / Tham Số Đo
              </th>
              {visibleServers.length === 0 ? (
                <th className="px-3.5 py-2.5 text-center text-slate-400 font-normal italic">
                  Không có server nào được chọn
                </th>
              ) : (
                visibleServers.map((node) => {
                  const isOffline = node.status === "offline";
                  const isDegraded = node.status === "degraded";

                  return (
                    <th
                      key={node.id}
                      className="px-3 py-2.5 text-center font-medium text-slate-800 dark:text-slate-200 min-w-[140px] border-r border-slate-100 dark:border-slate-800/50 last:border-r-0"
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center gap-1.5 font-mono font-bold">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              node.status === "online"
                                ? "bg-emerald-500 animate-pulse"
                                : isDegraded
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                            }`}
                          />
                          <span className="text-xs sm:text-sm font-bold tracking-tight">
                            {node.name}
                          </span>
                        </div>
                        <Badge
                          variant={node.status}
                          className="uppercase text-[9px] px-2 py-0.5 font-semibold tracking-wide"
                        >
                          {node.status}
                        </Badge>
                      </div>
                      {node.roleDescription && (
                        <div
                          className={`text-[10px] font-normal italic lowercase mt-0.5 truncate max-w-[130px] mx-auto ${
                            isOffline
                              ? "text-red-500/80 dark:text-red-400/80"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {node.roleDescription}
                        </div>
                      )}
                    </th>
                  );
                })
              )}
            </tr>
          </thead>

          {/* Table Body: Filtered Metric Rows */}
          <tbody className="divide-y divide-slate-100 dark:divide-[#151e30]">
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(1, visibleServers.length + 1)}
                  className="px-3.5 py-8 text-center text-slate-400 italic text-xs"
                >
                  Không có metric nào được chọn để hiển thị. Vui lòng bật lại
                  các hàng trong bộ lọc.
                </td>
              </tr>
            ) : visibleServers.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-3.5 py-8 text-center text-slate-400 italic text-xs"
                >
                  Vui lòng chọn ít nhất một Server để xem dữ liệu so sánh.
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr
                  key={row.key}
                  className="hover:bg-slate-50/80 dark:hover:bg-[#121929] transition-colors group"
                >
                  {/* Metric Label & Threshold Note - Sticky Left */}
                  <td className="sticky left-0 bg-white dark:bg-[#0c101d] group-hover:bg-slate-50 dark:group-hover:bg-[#121929] z-10 px-3.5 py-1.5 w-60 min-w-[220px] max-w-[240px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] border-r border-slate-200/80 dark:border-slate-800/80 transition-colors">
                    <div className="flex items-center gap-2">
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
                  </td>

                  {/* Server Values */}
                  {visibleServers.map((node) => (
                    <td
                      key={node.id}
                      className="px-3 py-1.5 text-center whitespace-nowrap min-w-[140px] border-r border-slate-100 dark:border-slate-800/40 last:border-r-0"
                    >
                      {row.renderValue(node)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
