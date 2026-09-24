// ============================================================
// ADSUN Dashboard — TelemetryMatrix.tsx
// "Bảng So Sánh Tổng Quan (System Telemetry Matrix)"
// ============================================================

import React from "react";
import { LayoutGrid } from "lucide-react";
import { Badge } from "../ui/badge";
import type { ServerNode, MetricRowKey } from "../../types";
import { useServerStore } from "../../store/useServerStore";
import { useUIStore } from "../../store/useUIStore";
import { MatrixFilterBar } from "../filters/MatrixFilterBar";
import { cn } from "../../lib/utils";

interface MetricRowDef {
  key: MetricRowKey;
  label: string;
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

  const visibleServers =
    matrixFilter.serverIds.length > 0
      ? servers.filter((s) => matrixFilter.serverIds.includes(s.id))
      : servers;

  const rows: MetricRowDef[] = [
    // 1. CPU Usage (%)
    {
      key: "cpuPercent",
      label: "CPU Usage (%)",
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
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500 font-mono text-sm">—</span>;

        const totalReq = node.metrics.totalRequests ?? 0;
        const formatted =
          totalReq >= 1000 ? `${(totalReq / 1000).toFixed(1)}k` : `${totalReq}`;

        return (
          <span className="font-mono font-bold text-xs sm:text-sm tracking-tight text-slate-800 dark:text-slate-200">
            {formatted}
          </span>
        );
      },
    },
    // 5. Ingest / Total RPS
    {
      key: "rps",
      label: "Ingest / Total RPS",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="font-mono text-sm text-slate-500">0</span>;
        const rps = node.metrics.rps;
        const formatted =
          rps >= 1000 ? `${(rps / 1000).toFixed(1)}k` : `${rps}`;
        return (
          <span className="font-mono font-bold text-xs sm:text-sm tracking-tight text-slate-700 dark:text-slate-300">
            {formatted}
          </span>
        );
      },
    },
    // 6. Latency (Avg/Min/Max)
    {
      key: "latencyCurrentAvgMs",
      label: "Latency (Avg/Min/Max)",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500 font-mono text-sm">—</span>;
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

    // 9. Success Rate (2xx/3xx)
    {
      key: "successRate",
      label: "Success Rate (2xx/3xx)",
      renderValue: (node) => {
        if (node.status === "offline")
          return (
            <span className="font-mono text-sm text-slate-500">0.00%</span>
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
    // 10. 4xx Error Rate (%)
    {
      key: "errorRate4xx",
      label: "4xx Error Rate (%)",
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
    // 11. 5xx Error Rate (%)
    {
      key: "errorRate5xx",
      label: "5xx Error Rate (%)",
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
    // 12. Total Queue
    {
      key: "totalQueue",
      label: "Total Queue",
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
          <span className="font-mono font-bold text-xs sm:text-sm tracking-tight text-slate-800 dark:text-slate-200">
            {total}{" "}
            <span className="text-slate-500 text-[11px] font-normal">
              ({q.Image} - {q.Video})
            </span>
          </span>
        );
      },
    },
  ];

  const visibleRows = rows.filter(
    (row) => !matrixFilter.hiddenMetricKeys.includes(row.key),
  );

  return (
    <section className={cn("flex flex-col h-full", className)}>
      {/* ─── Header: Title, Subtitle, Filter, Legend ─────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-[#49cc90] dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Bảng So Sánh Tổng Quan
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Người thật việc thật
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <MatrixFilterBar servers={servers} />
        </div>
      </div>

      {/* ─── Matrix Table ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-[#1b253b] rounded-md overflow-auto min-h-0 custom-scrollbar shadow-xs transition-colors flex-1">
        <table className="w-full text-xs text-left border-collapse min-w-[780px]">
          {/* Table Header: Metric Name + Server Columns */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1a2336] bg-[#f8fafc] dark:bg-[#0f1422]">
              <th className="px-3.5 py-3 w-64 text-slate-500 dark:text-slate-400 font-semibold text-[11px] sm:text-xs uppercase tracking-wider">
                Metric Tên / Tham Số Đo
              </th>
              {visibleServers.length === 0 ? (
                <th className="px-3.5 py-3 text-center text-slate-400 font-normal italic">
                  Không có server nào được chọn
                </th>
              ) : (
                visibleServers.map((node) => {
                  const isOffline = node.status === "offline";

                  return (
                    <th
                      key={node.id}
                      className="px-3 py-3 text-right font-medium text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex flex-col items-center justify-end gap-1 font-mono font-bold">
                        <Badge
                          variant={node.status}
                          className="uppercase text-[10px] px-2 py-0.5 font-semibold"
                        >
                          {node.status}
                        </Badge>
                        <span className="text-xs sm:text-sm font-bold tracking-tight">
                          {node.name}
                        </span>
                      </div>
                      {node.roleDescription && (
                        <div
                          className={`text-[11px] font-normal italic lowercase mt-0.5 ${
                            isOffline
                              ? "text-red-600 dark:text-[#f87171]"
                              : "text-slate-500 dark:text-slate-400"
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
                  className="hover:bg-slate-50/80 dark:hover:bg-[#121929] transition-colors"
                >
                  {/* Metric Label & Threshold Note */}
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs sm:text-[13px] text-slate-800 dark:text-slate-100">
                        {row.label}
                      </span>
                      <span className="font-mono text-[10.5px] text-slate-400 dark:text-slate-500 tracking-tight">
                        {row.thresholdLabel}
                      </span>
                    </div>
                  </td>

                  {/* Server Values */}
                  {visibleServers.map((node) => (
                    <td
                      key={node.id}
                      className="px-3 py-2.5 text-center whitespace-nowrap"
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
