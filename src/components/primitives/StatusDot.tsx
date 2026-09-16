// ============================================================
// ADSUN Dashboard — StatusDot.tsx
// Animated status indicator dot (online=pulse green, degraded=pulse amber, offline=static)
// ============================================================

import React from 'react';
import type { ServerStatus } from '../../types';
import { cn } from '../../lib/utils';

interface StatusDotProps {
  status: ServerStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
} as const;

const STATUS_CONFIG: Record<ServerStatus, { dot: string; label: string; glow: string }> = {
  online: {
    dot: 'bg-green-500',
    label: 'Online',
    glow: 'shadow-[0_0_6px_2px_rgba(22,163,74,0.6)]',
  },
  degraded: {
    dot: 'bg-amber-500',
    label: 'Degraded',
    glow: 'shadow-[0_0_6px_2px_rgba(217,119,6,0.6)]',
  },
  offline: {
    dot: 'bg-slate-500',
    label: 'Offline',
    glow: '',
  },
};

export function StatusDot({ status, size = 'md', showLabel = false, className }: StatusDotProps) {
  const config = STATUS_CONFIG[status];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span className={cn('flex items-center gap-1.5', className)}>
      <span className="relative flex">
        {/* Outer ping ring for online/degraded */}
        {status !== 'offline' && (
          <span
            className={cn(
              'absolute inline-flex rounded-full opacity-75 animate-ping',
              sizeClass,
              config.dot,
            )}
          />
        )}
        {/* Inner solid dot */}
        <span
          className={cn(
            'relative inline-flex rounded-full',
            sizeClass,
            config.dot,
            status !== 'offline' && config.glow,
          )}
        />
      </span>
      {showLabel && (
        <span className={cn('text-xs font-medium', {
          'text-green-400': status === 'online',
          'text-amber-400': status === 'degraded',
          'text-slate-400': status === 'offline',
        })}>
          {config.label}
        </span>
      )}
    </span>
  );
}
