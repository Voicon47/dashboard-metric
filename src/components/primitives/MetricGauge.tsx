// ============================================================
// ADSUN Dashboard — MetricGauge.tsx
// SVG arc gauge for CPU/RAM in Detail Modal
// ============================================================

import React from 'react';
import { getGaugeColor } from '../../utils/statusColor';

interface MetricGaugeProps {
  value: number;         // 0–100
  label: string;         // "CPU" | "RAM"
  size?: number;         // SVG size in px, default 120
}

export function MetricGauge({ value, label, size = 120 }: MetricGaugeProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const color = getGaugeColor(clampedValue);

  // SVG arc math
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) * 0.78;
  const strokeWidth = size * 0.09;

  // Arc spans 240 degrees (from 150° to 30°, going clockwise)
  const startAngle = 150; // degrees
  const arcSpan = 240;
  const endAngle = startAngle + (clampedValue / 100) * arcSpan;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  function describeArc(start: number, end: number): string {
    const startRad = toRad(start);
    const endRad = toRad(end);
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  const trackPath = describeArc(startAngle, startAngle + arcSpan);
  const valuePath = clampedValue > 0 ? describeArc(startAngle, endAngle) : '';

  // Color segments based on thresholds
  const getGradientId = () => `gauge-grad-${label}-${Math.round(clampedValue)}`;
  const gradId = getGradientId();

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-md"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <filter id={`glow-${label}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Track (background arc) */}
        <path
          d={trackPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-muted/30"
        />

        {/* Value arc */}
        {clampedValue > 0 && (
          <path
            d={valuePath}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 4px ${color}80)`,
              transition: 'all 0.6s ease',
            }}
          />
        )}

        {/* Center value text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.185}
          fontWeight="700"
          fontFamily="'Inter', system-ui, sans-serif"
          fill={color}
        >
          {Math.round(clampedValue)}
        </text>

        {/* Percent sign */}
        <text
          x={cx}
          y={cy + size * 0.12}
          textAnchor="middle"
          fontSize={size * 0.1}
          fontWeight="500"
          fontFamily="'Inter', system-ui, sans-serif"
          fill={color}
          opacity="0.8"
        >
          %
        </text>
      </svg>

      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
