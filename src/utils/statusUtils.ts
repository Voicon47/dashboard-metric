import type { ServerMetrics, ServerStatus, ThresholdSettings } from "../types";

/**
 * Tính toán trạng thái tổng thể của một Server dựa trên metrics hiện tại và ngưỡng config.
 * Nếu bất kỳ metric nào vượt ngưỡng Degraded, server sẽ bị đánh dấu là Degraded.
 */
export function calculateServerStatus(
  metrics: Partial<ServerMetrics>,
  thresholds: ThresholdSettings,
  currentStatus: ServerStatus
): ServerStatus {

  const cpu = metrics.cpuPercent ?? 0;
  const latency = metrics.latencyCurrentAvgMs ?? 0;
  const errorRate5xx = metrics.errorRate5xx ?? 0;

  if (
    cpu >= thresholds.cpuDegraded ||
    latency >= thresholds.latencyDegraded ||
    errorRate5xx >= thresholds.error5xxDegraded
  ) {
    return "degraded";
  }

  return "online";
}

/**
 * Kiểm tra xem một Endpoint có bị Degraded hay không (5xx cao hoặc latency quá cao).
 * Sử dụng cho các highlight chi tiết từng API path.
 */
export function isEndpointDegraded(
  errorRate5xx: number,
  latencyMs: number,
  thresholds: ThresholdSettings
): boolean {
  return (
    errorRate5xx >= thresholds.error5xxDegraded ||
    latencyMs >= thresholds.latencyDegraded
  );
}
