// ============================================================
// ADSUN Dashboard — MatrixFilterBar.tsx
// Thanh công cụ lọc cho Bảng So Sánh Tổng Quan (TelemetryMatrix)
// ============================================================

import React from "react";
import {
  SlidersHorizontal,
  Server,
  RotateCcw,
  Check,
  ChevronDown,
} from "lucide-react";
import type { ServerNode, MetricRowKey } from "../../types";
import { useUIStore } from "../../store/useUIStore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { STATUS_DOT_COLORS } from "../../constants/metricTheme";

export const ALL_METRIC_KEYS: { key: MetricRowKey; label: string }[] = [
  { key: "cpuPercent", label: "CPU Usage (%)" },
  { key: "ramGB", label: "RAM Usage (GB)" },
  { key: "managedHeapMb", label: "Heap RAM (MB)" },
  { key: "totalRequests", label: "Total Requests" },
  { key: "rps", label: "Ingest / Total RPS" },
  { key: "latencyCurrentAvgMs", label: "Avg Latency (ms)" },
  { key: "minLatencyMs", label: "Min Latency (ms)" },
  { key: "maxLatencyMs", label: "Max Latency (ms)" },
  { key: "successRate", label: "Success Rate (2xx/3xx)" },
  { key: "errorRate4xx", label: "4xx Error Rate (%)" },
  { key: "errorRate5xx", label: "5xx Error Rate (%)" },
];

interface MatrixFilterBarProps {
  servers: ServerNode[];
}

export function MatrixFilterBar({ servers }: MatrixFilterBarProps) {
  const matrixFilter = useUIStore((state) => state.matrixFilter);
  const setMatrixFilter = useUIStore((state) => state.setMatrixFilter);
  const resetMatrixFilter = useUIStore((state) => state.resetMatrixFilter);

  const selectedServerCount =
    matrixFilter.serverIds.length === 0
      ? servers.length
      : matrixFilter.serverIds.length;

  const visibleRowCount =
    ALL_METRIC_KEYS.length - matrixFilter.hiddenMetricKeys.length;

  const isFiltered =
    matrixFilter.serverIds.length > 0 ||
    matrixFilter.hiddenMetricKeys.length > 0;

  // Toggle single server
  const handleToggleServer = (serverId: string) => {
    let newIds: string[];
    if (matrixFilter.serverIds.length === 0) {
      // currently all are shown -> unchecking this server means keep all others
      newIds = servers.filter((s) => s.id !== serverId).map((s) => s.id);
    } else if (matrixFilter.serverIds.includes(serverId)) {
      // remove from selected
      newIds = matrixFilter.serverIds.filter((id) => id !== serverId);
    } else {
      // add to selected
      newIds = [...matrixFilter.serverIds, serverId];
      if (newIds.length === servers.length) {
        newIds = []; // all selected = empty array
      }
    }
    setMatrixFilter({ serverIds: newIds });
  };

  const handleSelectAllServers = () => {
    setMatrixFilter({ serverIds: [] });
  };

  // Toggle metric row visibility
  const handleToggleMetric = (key: MetricRowKey) => {
    const isHidden = matrixFilter.hiddenMetricKeys.includes(key);
    let newHidden: MetricRowKey[];
    if (isHidden) {
      newHidden = matrixFilter.hiddenMetricKeys.filter((k) => k !== key);
    } else {
      newHidden = [...matrixFilter.hiddenMetricKeys, key];
    }
    setMatrixFilter({ hiddenMetricKeys: newHidden });
  };

  const handleShowAllMetrics = () => {
    setMatrixFilter({ hiddenMetricKeys: [] });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* ─── Server Filter Dropdown ─── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-7 px-2.5 text-[11px] font-medium border rounded-md gap-1.5 transition-colors ${
              matrixFilter.serverIds.length > 0
                ? "border-blue-500/60 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                : "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0f1422] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Server className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span>
              Servers ({selectedServerCount}/{servers.length})
            </span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Chọn Server
            </span>
            <button
              onClick={handleSelectAllServers}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Hiện tất cả
            </button>
          </div>
          <DropdownMenuSeparator />
          {servers.map((server) => {
            const isChecked =
              matrixFilter.serverIds.length === 0 ||
              matrixFilter.serverIds.includes(server.id);

            return (
              <DropdownMenuCheckboxItem
                key={server.id}
                checked={isChecked}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => handleToggleServer(server.id)}
                className="text-xs py-1.5"
              >
                <div className="flex items-center justify-between w-full pr-1">
                  <span className="font-mono font-medium">{server.name}</span>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ml-2 ${
                      STATUS_DOT_COLORS[server.status] || "bg-slate-400"
                    }`}
                  />
                </div>
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ─── Metric Rows Filter Dropdown ─── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-7 px-2.5 text-[11px] font-medium border rounded-md gap-1.5 transition-colors ${
              matrixFilter.hiddenMetricKeys.length > 0
                ? "border-blue-500/60 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                : "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0f1422] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span>
              Hàng Metric ({visibleRowCount}/{ALL_METRIC_KEYS.length})
            </span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Ẩn / Hiện Chỉ Số
            </span>
            <button
              onClick={handleShowAllMetrics}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Hiện tất cả
            </button>
          </div>
          <DropdownMenuSeparator />
          {ALL_METRIC_KEYS.map((metric) => {
            const isVisible = !matrixFilter.hiddenMetricKeys.includes(
              metric.key
            );
            return (
              <DropdownMenuCheckboxItem
                key={metric.key}
                checked={isVisible}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => handleToggleMetric(metric.key)}
                className="text-xs py-1.5"
              >
                <span>{metric.label}</span>
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ─── Reset Filter Button ─── */}
      {isFiltered && (
        <button
          onClick={resetMatrixFilter}
          title="Đặt lại bộ lọc bảng so sánh"
          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Đặt lại</span>
        </button>
      )}
    </div>
  );
}
