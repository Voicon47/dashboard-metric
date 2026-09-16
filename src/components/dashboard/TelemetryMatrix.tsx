// ============================================================
// ADSUN Dashboard — TelemetryMatrix.tsx
// "Bảng So Sánh Tổng Quan (System Telemetry Matrix)"
// ============================================================

import React from "react";
import { LayoutGrid } from "lucide-react";
import { Badge } from "../ui/badge";
import type { ServerNode } from "../../types";
import { useDashboardStore } from "../../store/useDashboardStore";

interface MetricRowDef {
  label: string;
  thresholdLabel?: string;
  renderValue: (node: ServerNode) => React.ReactNode;
}

export function TelemetryMatrix() {
  const servers = useDashboardStore((state) => state.servers);
  const thresholds = useDashboardStore((state) => state.settings.thresholds);

  const rows: MetricRowDef[] = [
    // 1. CPU Usage (%)
    {
      label: "CPU Usage (%)",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500">—</span>;
        const cpu = node.metrics.cpuPercent;
        const color =
          cpu >= thresholds.cpuDegraded
            ? "text-[#f87171]"
            : cpu >= thresholds.cpuWarning
              ? "text-[#fbbf24]"
              : "text-[#4ade80]";
        return (
          <span className={`font-mono font-bold ${color}`}>
            {cpu.toFixed(1)}%
          </span>
        );
      },
    },
    // 2. RAM Usage (GB)
    {
      label: "RAM Usage (GB)",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500">—</span>;

        const gb = (node.metrics.ramGB ?? 0).toFixed(1);

        return (
          <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
            {gb} GB
          </span>
        );
      },
    },
    // 3. Heap RAM (MB)
    {
      label: "Heap RAM (MB)",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500">—</span>;

        const heap = (node.metrics.managedHeapMb ?? 0).toFixed(1);

        return (
          <span className="font-mono font-medium text-slate-600 dark:text-slate-400">
            {heap} MB
          </span>
        );
      },
    },
    // 4. Total Requests
    {
      label: "Total Requests",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500">—</span>;

        const totalReq = node.metrics.totalRequests ?? 0;
        const formatted =
          totalReq >= 1000 ? `${(totalReq / 1000).toFixed(1)}k` : `${totalReq}`;

        return (
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
            {formatted}
          </span>
        );
      },
    },
    // 5. Ingest / Total RPS
    {
      label: "Ingest / Total RPS",
      // thresholdLabel: "req/s",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="font-mono text-slate-500">0</span>;
        const rps = node.metrics.rps;
        const formatted =
          rps >= 1000 ? `${(rps / 1000).toFixed(1)}k` : `${rps}`;
        return (
          <span className="font-mono font-bold text-slate-500">
            {formatted}
          </span>
        );
      },
    },
    // 4. Avg Latency (ms)
    {
      label: "Avg Latency (ms)",
      // thresholdLabel: ">50ms warning",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500">—</span>;
        const lat = node.metrics.latencyCurrentAvgMs;
        const color =
          lat >= thresholds.latencyDegraded
            ? "text-[#f87171]"
            : lat >= thresholds.latencyWarning
              ? "text-[#fbbf24]"
              : "text-[#4ade80]";
        return (
          <span className={`font-mono font-bold ${color}`}>
            {lat.toFixed(1)} ms
          </span>
        );
      },
    },
    // 7. Min Latency (ms)
    {
      label: "Min Latency (ms)",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500">—</span>;
        const minLat =
          node.metrics.minLatencyMs ?? node.metrics.latencyCurrentAvgMs;
        const color =
          minLat >= thresholds.latencyDegraded
            ? "text-[#f87171]"
            : minLat >= thresholds.latencyWarning
              ? "text-[#fbbf24]"
              : "text-[#4ade80]";
        return (
          <span className={`font-mono font-medium ${color}`}>
            {minLat.toFixed(1)} ms
          </span>
        );
      },
    },
    // 8. Max Latency (ms)
    {
      label: "Max Latency (ms)",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500">—</span>;
        const maxLat =
          node.metrics.maxLatencyMs ?? node.metrics.latencyCurrentAvgMs;
        const color =
          maxLat >= thresholds.latencyDegraded
            ? "text-[#f87171]"
            : maxLat >= thresholds.latencyWarning
              ? "text-[#fbbf24]"
              : "text-[#4ade80]";
        return (
          <span className={`font-mono font-medium ${color}`}>
            {maxLat.toFixed(1)} ms
          </span>
        );
      },
    },
    // 6. Success Rate (2xx/3xx)
    {
      label: "Success Rate (2xx/3xx)",
      // thresholdLabel: "<99% warning",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="font-mono text-slate-500">0.00%</span>;
        const rate = node.metrics.successRate ?? 0;
        const color =
          rate < 96
            ? "text-[#f87171]"
            : rate < 99
              ? "text-[#fbbf24]"
              : "text-[#4ade80]";
        return (
          <span className={`font-mono font-bold ${color}`}>
            {rate.toFixed(2)}%
          </span>
        );
      },
    },
    // 7. 4xx Error Rate (%)
    {
      label: "4xx Error Rate (%)",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500">—</span>;
        const err4 = node.metrics.errorRate4xx ?? 0;
        const color = err4 >= 5.0 ? "text-[#fbbf24]" : "text-[#4ade80]";
        return (
          <span className={`font-mono font-bold ${color}`}>
            {err4.toFixed(2)}%
          </span>
        );
      },
    },
    // 8. 5xx Error Rate (%)
    {
      label: "5xx Error Rate (%)",
      // thresholdLabel: ">1.0% critical",
      renderValue: (node) => {
        if (node.status === "offline")
          return <span className="text-slate-500">—</span>;
        const err = node.metrics.errorRate5xx ?? 0;
        const color =
          err >= thresholds.error5xxDegraded
            ? "text-[#f87171]"
            : err >= thresholds.error5xxWarning
              ? "text-[#fbbf24]"
              : "text-[#4ade80]";
        return (
          <span className={`font-mono font-bold ${color}`}>
            {err.toFixed(2)}%
          </span>
        );
      },
    },
  ];

  return (
    <section className="mb-4">
      {/* ─── Header: Title, Subtitle, Legend ─────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
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

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Badge
            variant="online"
            className="font-semibold text-[10px] px-1.5 py-0 hover:bg-transparent"
          >
            ONLINE
          </Badge>
          <Badge
            variant="degraded"
            className="font-semibold text-[10px] px-1.5 py-0 hover:bg-transparent"
          >
            DEGRADED
          </Badge>
          <Badge
            variant="offline"
            className="font-semibold text-[10px] px-1.5 py-0 hover:bg-transparent"
          >
            OFFLINE
          </Badge>
        </div>
      </div>

      {/* ─── Matrix Table ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-[#1b253b] rounded-md overflow-x-auto shadow-xs transition-colors">
        <table className="w-full text-xs text-left border-collapse min-w-[780px]">
          {/* Table Header: Metric Name + Server Columns */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1a2336] bg-[#f8fafc] dark:bg-[#0f1422]">
              <th className="px-3 py-2.5 w-60 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                Metric Tên / Tham Số Đo
              </th>
              {servers.map((node) => {
                const isOffline = node.status === "offline";

                return (
                  <th
                    key={node.id}
                    className="px-3 py-2.5 text-right font-medium text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex flex-col items-center justify-end gap-1.5 font-mono font-bold">
                      <Badge
                        variant={node.status}
                        className="uppercase text-[9px] px-1 py-0"
                      >
                        {node.status}
                      </Badge>
                      <span>{node.name}</span>
                    </div>
                    {node.roleDescription && (
                      <div
                        className={`text-[10px] font-normal italic lowercase ${
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
              })}
            </tr>
          </thead>

          {/* Table Body: 8 Metric Rows */}
          <tbody className="divide-y divide-slate-100 dark:divide-[#151e30]">
            {rows.map((row) => (
              <tr
                key={row.label}
                className="hover:bg-slate-50/80 dark:hover:bg-[#121929] transition-colors"
              >
                {/* Metric Label & Threshold Note */}
                <td className="px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {row.label}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 tracking-tight">
                      {row.thresholdLabel}
                    </span>
                  </div>
                </td>

                {/* Server Values */}
                {servers.map((node) => (
                  <td
                    key={node.id}
                    className="px-3 py-2 text-center whitespace-nowrap "
                  >
                    {row.renderValue(node)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
