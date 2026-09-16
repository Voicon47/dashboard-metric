// ============================================================
// ADSUN Media Metrics Dashboard — Constants
// ============================================================

// ─── CPU & RAM Thresholds ─────────────────────────────────────
export const CPU_THRESHOLD = {
  warning: 70,   // amber
  critical: 90,  // red
} as const;

export const RAM_THRESHOLD = {
  warning: 70,
  critical: 90,
} as const;

// ─── Latency Thresholds (ms) ──────────────────────────────────
export const LATENCY_THRESHOLD = {
  warning: 200,
  critical: 500,
} as const;

// ─── Error Rate Thresholds (%) ────────────────────────────────
export const ERROR_RATE_THRESHOLD = {
  warning: 2,
  critical: 5,
} as const;

// ─── Polling Intervals (seconds) ──────────────────────────────
export const POLLING_INTERVALS = [5, 10, 15, 30, 60] as const;
export type PollingIntervalValue = typeof POLLING_INTERVALS[number];

export const DEFAULT_POLLING_INTERVAL = 10; // seconds

// ─── Status Color Map ─────────────────────────────────────────
export const STATUS_COLOR_MAP = {
  online: {
    dot: 'bg-green-500',
    badge: 'bg-green-500/15 text-green-400 border-green-500/30',
    text: 'text-green-400',
    hex: '#16A34A',
  },
  degraded: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    text: 'text-amber-400',
    hex: '#D97706',
  },
  offline: {
    dot: 'bg-slate-500',
    badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    text: 'text-slate-400',
    hex: '#64748B',
  },
} as const;

// ─── HTTP Method Color Map ────────────────────────────────────
export const METHOD_COLOR_MAP = {
  GET: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  POST: 'bg-green-500/15 text-green-400 border-green-500/30',
  PUT: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  PATCH: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  DELETE: 'bg-red-500/15 text-red-400 border-red-500/30',
} as const;

// ─── Regions ──────────────────────────────────────────────────
export const REGIONS = ['HCM', 'HN', 'SG', 'DAL', 'DN', 'US'] as const;

// ─── Roles ────────────────────────────────────────────────────
export const ROLES = ['primary', 'replica', 'edge', 'cdn'] as const;

// ─── Theme Colors ─────────────────────────────────────────────
export const THEME_COLORS = {
  dark: {
    bg: '#0F172A',
    surface: '#1E293B',
    border: '#334155',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
  },
  light: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    text: '#0F172A',
    textMuted: '#64748B',
  },
} as const;

// ─── Accent Color ─────────────────────────────────────────────
export const ACCENT_COLOR = '#2563EB';

// ─── Jitter Simulation Config ────────────────────────────────
export const JITTER_CONFIG = {
  cpu: { min: -8, max: 12 },       // % range
  ram: { min: -3, max: 5 },        // % range
  latency: { min: -30, max: 50 },  // ms range
  rps: { min: -50, max: 80 },      // rps range
  bandwidth: { min: -5, max: 10 }, // Mbps range
} as const;

// ─── Throttling Config (affects HN-02) ────────────────────────
export const THROTTLING_NODE_ID = 'HN-02';
export const THROTTLING_CONFIG = {
  cpuMin: 85,
  cpuMax: 97,
  errorRateMin: 8,
  errorRateMax: 18,
  latencyMultiplier: 2.5,
} as const;

// ─── Prometheus Metric Names ──────────────────────────────────
export const PROMETHEUS_METRICS = {
  cpu: 'server_cpu_usage_percent',
  ram: 'server_ram_usage_percent',
  latency: 'server_latency_ms',
  rps: 'server_requests_per_second',
  errorRate: 'server_error_rate_percent',
  uptime: 'server_uptime_seconds',
  bandwidth: 'server_bandwidth_mbps',
  disk: 'server_disk_usage_percent',
} as const;

// ─── App Meta ─────────────────────────────────────────────────
export const APP_NAME = 'ADSUN Media Metrics';
export const APP_VERSION = '2.1.0';
