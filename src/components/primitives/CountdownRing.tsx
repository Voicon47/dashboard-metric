// ============================================================
// ADSUN Dashboard — CountdownRing.tsx
// SVG circular ring countdown to next sync
// ============================================================

import React from 'react';

interface CountdownRingProps {
  countdown: number;        // current seconds remaining
  interval: number;         // total seconds of full cycle
  size?: number;            // SVG size in px, default 44
  strokeWidth?: number;
  className?: string;
}

export function CountdownRing({
  countdown,
  interval,
  size = 44,
  strokeWidth = 3,
  className = '',
}: CountdownRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Progress: 1 = full (start of cycle), 0 = empty (about to tick)
  const progress = Math.max(0, Math.min(1, countdown / interval));
  const dashOffset = circumference * (1 - progress);

  // Color shifts: green → amber → red as countdown approaches 0
  let strokeColor = '#3B82F6'; // blue (default)
  if (progress < 0.25) strokeColor = '#EF4444';        // red — imminent
  else if (progress < 0.5) strokeColor = '#F59E0B';    // amber — soon
  else strokeColor = '#3B82F6';                         // blue — relaxed

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      title={`Next sync in ${countdown}s`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/25"
        />

        {/* Progress ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s ease',
            filter: `drop-shadow(0 0 3px ${strokeColor}80)`,
          }}
        />
      </svg>

      {/* Countdown number in center */}
      <span
        className="absolute text-[10px] font-bold tabular-nums"
        style={{ color: strokeColor }}
      >
        {countdown}
      </span>
    </div>
  );
}
