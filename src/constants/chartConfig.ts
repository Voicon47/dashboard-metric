export const SERIES_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
];

export type MetricKey = "cpu" | "ram" | "latency" | "rps";

export const METRIC_CONFIG: Record<
  MetricKey,
  { label: string; unit: string; yMax?: number }
> = {
  cpu: { label: "CPU", unit: "%", yMax: 100 },
  rps: { label: "Request Per Second", unit: "" },
  ram: { label: "RAM", unit: "GB" },
  latency: { label: "Latency", unit: "ms" },
};
