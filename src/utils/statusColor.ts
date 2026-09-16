// ============================================================
// ADSUN Dashboard — statusColor.ts
// Maps server status → Tailwind CSS classes
// ============================================================

import type { ServerStatus } from '../types';

export interface StatusColorSet {
  dot: string;           // background for StatusDot
  badge: string;         // badge variant classes
  text: string;          // text color class
  border: string;        // border color class
  bg: string;            // background tint
  glow: string;          // box-shadow glow style (inline)
  hex: string;           // hex color value for SVG/canvas
}

const STATUS_COLORS: Record<ServerStatus, StatusColorSet> = {
  online: {
    dot: 'bg-green-500',
    badge: 'bg-green-500/15 text-green-400 border border-green-500/30',
    text: 'text-green-400',
    border: 'border-green-500/40',
    bg: 'bg-green-500/10',
    glow: '0 0 10px rgba(22, 163, 74, 0.5)',
    hex: '#16A34A',
  },
  degraded: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    glow: '0 0 10px rgba(217, 119, 6, 0.5)',
    hex: '#D97706',
  },
  offline: {
    dot: 'bg-slate-500',
    badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
    text: 'text-slate-400',
    border: 'border-slate-500/40',
    bg: 'bg-slate-500/10',
    glow: 'none',
    hex: '#64748B',
  },
};

export function getStatusColors(status: ServerStatus): StatusColorSet {
  return STATUS_COLORS[status] ?? STATUS_COLORS.offline;
}

/**
 * Returns Tailwind classes for CPU/RAM progress bar based on threshold
 */
export function getMetricProgressClass(percent: number): string {
  if (percent >= 90) return 'progress-critical';
  if (percent >= 70) return 'progress-warning';
  return 'progress-healthy';
}

/**
 * Returns text color class based on metric value and thresholds
 */
export function getMetricTextClass(
  value: number,
  warningThreshold: number,
  criticalThreshold: number,
): string {
  if (value >= criticalThreshold) return 'text-red-400';
  if (value >= warningThreshold) return 'text-amber-400';
  return 'text-green-400';
}

/**
 * Returns color hex for SVG gauge based on percent
 */
export function getGaugeColor(percent: number): string {
  if (percent >= 90) return '#DC2626';
  if (percent >= 70) return '#D97706';
  return '#16A34A';
}
