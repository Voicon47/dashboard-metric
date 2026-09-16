// ============================================================
// ADSUN Dashboard — formatters.ts
// Utility functions for metric value formatting
// ============================================================

/**
 * Format milliseconds: 42 → "42ms", 1200 → "1.2s"
 */
export function formatMs(ms: number): string {
  if (ms === 0) return '—';
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms)}ms`;
}

/**
 * Format percent: 78.421 → "78.4%"
 */
export function formatPercent(value: number, decimals = 1): string {
  if (value === 0) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format requests per second: 1240 → "1.2k", 98 → "98"
 */
export function formatRps(rps: number): string {
  if (rps === 0) return '0';
  if (rps >= 1000) return `${(rps / 1000).toFixed(1)}k`;
  return `${Math.round(rps)}`;
}

/**
 * Format bytes to human-readable: 1048576 → "1.0 MB"
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Format Mbps: 320 → "320 Mbps", 1500 → "1.5 Gbps"
 */
export function formatBandwidth(mbps: number): string {
  if (mbps === 0) return '—';
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(1)} Gbps`;
  return `${Math.round(mbps)} Mbps`;
}

/**
 * Format uptime seconds to human-readable duration
 * 3600 → "1h", 86400 → "1d", 172800 → "2d 0h"
 */
export function formatUptime(seconds: number): string {
  if (seconds === 0) return 'Offline';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Format timestamp to locale time string
 */
export function formatTime(timestamp: number): string {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format timestamp to full locale date + time string
 */
export function formatDateTime(timestamp: number): string {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Clamp value to [min, max] range
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
