// ============================================================
// ADSUN Dashboard — normalizeMetrics.ts
// Chuyển đổi raw API response → Endpoint[] + ServerMetrics (phẳng, type-safe)
// Pipeline: Raw JSON → normalizeServerData() → Store → UI
// ============================================================

import type { Endpoint, ServerMetrics, HttpMethod } from "../types";

// ─── Raw types từ API (không export ra ngoài, chỉ dùng nội bộ) ───
interface RawEndpointData {
  requestsPerSecond: number;
  totalRequests: number;
  latencyMs: {
    currentAvg: number;
    overallAvg: number;
    min: number;
    max: number;
  };
  statusCodes: {
    status2xx: number;
    status3xx: number;
    status4xx: number;
    status5xx: number;
    other: number;
    successRatePercent?: number;
  };
}

export interface RawMetricsResponse {
  timestamp?: string;
  service?: string;
  system: {
    cpuUsagePercent: number;
    ram: { workingSetMb: number; managedHeapMb: number };
  };
  summary: {
    requestsPerSecond: number;
    totalRequests?: number;
    latencyMs: {
      currentAvg: number;
      overallAvg: number;
      min: number;
      max: number;
    };
    statusCodes: {
      counts: {
        status2xx: number;
        status3xx: number;
        status4xx: number;
        status5xx: number;
        other: number;
      };
      percentages: {
        rate2xx: number;
        rate3xx: number;
        rate4xx: number;
        rate5xx: number;
        rateOther: number;
      };
    };
  };
  endpoints: Record<string, RawEndpointData>;
}

// ─── Kết quả sau normalize ────────────────────────────────────────
export interface NormalizedServerData {
  metrics: Partial<ServerMetrics>;
  endpoints: Endpoint[];
}

const VALID_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

/**
 * Normalize một raw endpoint object thành Endpoint phẳng (flat).
 * Key format từ API: "POST api/CameraDevice/UpdateCameraDebugLog"
 */
function normalizeEndpoint(key: string, ep: RawEndpointData): Endpoint {
  // Tách METHOD và path
  const spaceIdx = key.indexOf(" ");
  const rawMethod =
    spaceIdx > -1 ? key.slice(0, spaceIdx).toUpperCase() : "GET";
  const path = spaceIdx > -1 ? "/" + key.slice(spaceIdx + 1) : "/" + key;

  const method: HttpMethod = VALID_METHODS.includes(rawMethod as HttpMethod)
    ? (rawMethod as HttpMethod)
    : "GET";

  // Tính error rate
  const epTotal = Math.max(
    1,
    ep.statusCodes.status2xx +
      ep.statusCodes.status3xx +
      ep.statusCodes.status4xx +
      ep.statusCodes.status5xx +
      ep.statusCodes.other,
  );
  const rate4xx = (ep.statusCodes.status4xx / epTotal) * 100;
  const rate5xx = (ep.statusCodes.status5xx / epTotal) * 100;
  const epSuccessRate =
    ep.statusCodes.successRatePercent ?? Math.max(0, 100 - (rate4xx + rate5xx));

  return {
    id: key, // key gốc làm ID (duy nhất trong 1 server)
    path,
    method,
    latencyCurrentAvgMs: parseFloat(ep.latencyMs.currentAvg.toFixed(2)),
    latencyOverallAvgMs: parseFloat(ep.latencyMs.overallAvg.toFixed(2)),
    maxLatencyMs: parseFloat(ep.latencyMs.max.toFixed(2)),
    minLatencyMs: parseFloat(ep.latencyMs.min.toFixed(2)),
    rps: ep.requestsPerSecond,
    totalRequests: ep.totalRequests ?? 0,
    errorRate4xx: parseFloat(rate4xx.toFixed(2)),
    errorRate5xx: parseFloat(rate5xx.toFixed(2)),
    successRate: parseFloat(epSuccessRate.toFixed(2)),
    status:
      rate5xx >= 5 || ep.latencyMs.currentAvg > 1000 ? "degraded" : "online",
    isDegraded: rate5xx >= 5 || ep.latencyMs.currentAvg > 1000,
  };
}

/**
 * Normalize toàn bộ API response thành dữ liệu phẳng, type-safe.
 *
 * @param data - Raw JSON từ API (đã parse, chưa validate)
 * @returns NormalizedServerData sẵn sàng đổ vào Zustand store
 */
export function normalizeServerData(
  data: RawMetricsResponse,
): NormalizedServerData {
  // ─── System Metrics ───────────────────────────────────────────
  const ramGB = data.system.ram.workingSetMb / 1024;

  // ─── Summary StatusCodes ──────────────────────────────────────
  const counts = data.summary.statusCodes.counts;
  const total = Math.max(
    1,
    counts.status2xx +
      counts.status3xx +
      counts.status4xx +
      counts.status5xx +
      counts.other,
  );
  const rate4xx = (counts.status4xx / total) * 100;
  const rate5xx = (counts.status5xx / total) * 100;
  const successRate = data.summary.statusCodes.percentages.rate2xx;

  const metrics: Partial<ServerMetrics> = {
    cpuPercent: data.system.cpuUsagePercent,
    ramGB: parseFloat(ramGB.toFixed(2)),
    managedHeapMb: data.system.ram.managedHeapMb,
    rps: data.summary.requestsPerSecond,
    totalRequests: data.summary.totalRequests ?? 0,
    latencyCurrentAvgMs: data.summary.latencyMs.currentAvg,
    latencyOverallAvgMs: data.summary.latencyMs.overallAvg,
    minLatencyMs: data.summary.latencyMs.min,
    maxLatencyMs: data.summary.latencyMs.max,
    errorRate4xx: parseFloat(rate4xx.toFixed(2)),
    errorRate5xx: parseFloat(rate5xx.toFixed(2)),
    successRate: parseFloat(successRate.toFixed(2)),
  };

  // ─── Endpoints: object → array phẳng ─────────────────────────
  const endpoints: Endpoint[] = Object.entries(data.endpoints).map(
    ([key, ep]) => normalizeEndpoint(key, ep),
  );

  return { metrics, endpoints };
}
