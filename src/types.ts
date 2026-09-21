// ============================================================
// ADSUN Media Metrics Dashboard — Type Definitions
// ============================================================

export type ThemeMode = "dark" | "light";

export type ServerStatus = "online" | "degraded" | "offline";

export type ServerRole = "primary" | "replica" | "edge" | "cdn";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type Region = "HCM" | "HN" | "SG" | "DAL" | "DN" | "US";

// ─── Endpoint ─────────────────────────────────────────────────
export interface Endpoint {
  id: string;
  path: string;
  method: HttpMethod;
  latencyCurrentAvgMs: number;
  latencyOverallAvgMs: number;
  rps: number;
  totalRequests: number;
  status: ServerStatus;
  errorRate4xx: number;
  errorRate5xx: number;
  maxLatencyMs?: number;
  minLatencyMs?: number;
  successRate?: number;
  isDegraded?: boolean;
}

// ─── Server Metrics ────────────────────────────────────────────
export interface ServerMetrics {
  cpuPercent: number; // 0–100
  latencyCurrentAvgMs: number; // milliseconds
  latencyOverallAvgMs: number;
  rps: number; // requests per second
  totalRequests: number; // cumulative requests
  errorRate4xx: number; // 0–100 percent
  errorRate5xx: number; // 0–100 percent
  uptimeSeconds?: number;
  bandwidthMbps?: number;
  diskPercent?: number; // 0–100
  // Extended fields for dashboard matrix matching image:
  ramGB: number;
  managedHeapMb: number;
  minLatencyMs: number;
  maxLatencyMs?: number;
  successRate?: number;
  activeStreams?: number;
}

// ─── Queue Metrics ────────────────────────────────────────────
export interface QueueMetrics {
  Image: number;
  Video: number;
  CameraDebugLog: number;
  ErrorImageLog: number;
  EventAI: number;
  AIConfig: number;
}

// ─── Server Node ──────────────────────────────────────────────
export interface ServerNode {
  id: string;
  name: string; // e.g. "HCM-01"
  status: ServerStatus;
  metrics: ServerMetrics;
  endpoints: Endpoint[];
  lastSyncAt: number; // Date.now() timestamp
  tag?: string; // e.g. "VN-HAN", "VN-SGN", "SG-SIN", "US-DAL", "VN-DAD", "US-SFO"
  tagSubtitle?: string; // e.g. "(504 Timeout)"
  baseUrl: string; // e.g. "https://media-hn02.adsun.vn:8088/metrics"
  accessToken?: string; // e.g. "prod_sec_ba6c" -> displays as `••••ba6c`
  autoSyncStatus?: string; // e.g. "15s Loop" or "Lỗi xác thực"
  roleDescription?: string; // e.g. "ingest gateway han", "edge cdn sgn", "webrtc relay sin", etc.
  totalEndpointsCount?: number;
  warningEndpointsCount?: number;
  queues?: QueueMetrics | null;
}

// ─── Settings ─────────────────────────────────────────────────
export interface ThresholdSettings {
  cpuWarning: number;
  cpuDegraded: number;
  latencyWarning: number;
  latencyDegraded: number;
  error5xxWarning: number;
  error5xxDegraded: number;
}

export interface DashboardSettings {
  theme: ThemeMode;
  thresholds: ThresholdSettings;
}

// ─── Modal States ─────────────────────────────────────────────
export interface ModalState {
  detail: boolean;
  addEdit: boolean;
  prometheus: boolean;
  settings: boolean;
}

// ─── Dashboard State ──────────────────────────────────────────
export interface DashboardState {
  servers: ServerNode[];
  selectedNodeId: string | null;
  editingNodeId: string | null; // null = add mode, string = edit mode
  pollingInterval: number; // seconds
  modals: ModalState;
  lastSyncAt: number;
  settings: DashboardSettings;
}

// ─── Toast ────────────────────────────────────────────────────
export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

// ─── Form Values for Add/Edit Server ─────────────────────────
export interface ServerFormValues {
  name: string;
  baseUrl: string;
  accessToken: string;
}

// ─── Polling ──────────────────────────────────────────────────
export interface PollingState {
  countdown: number; // seconds until next sync
  isActive: boolean;
}

// ─── Dashboard View Filters ───────────────────────────────────
export type MetricRowKey =
  | "cpuPercent"
  | "ramGB"
  | "managedHeapMb"
  | "totalRequests"
  | "rps"
  | "latencyCurrentAvgMs"
  | "minLatencyMs"
  | "maxLatencyMs"
  | "successRate"
  | "errorRate4xx"
  | "errorRate5xx";

export interface TelemetryMatrixFilter {
  serverIds: string[]; // Empty = hiển thị tất cả
  hiddenMetricKeys: MetricRowKey[]; // Các hàng bị ẩn
}

export interface ServerColumnsFilter {
  serverIds: string[]; // Empty = hiển thị tất cả
  serverStatus: ServerStatus[]; // Empty = hiển thị tất cả status
  endpointMethod: HttpMethod[]; // Empty = hiển thị tất cả method
}

