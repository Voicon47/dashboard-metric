// ============================================================
// ADSUN Dashboard — Footer.tsx
// Bottom status bar matching reference image
// ============================================================

import React from 'react';


interface FooterProps {
  onPrometheusExport?: () => void;
}

export function Footer({ onPrometheusExport }: FooterProps) {
  const dispatch = (action: any) => {};

  return (
    <footer className="border-t border-slate-200 dark:border-[#1a2336] bg-white dark:bg-[#070b14] px-4 sm:px-6 h-8 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none transition-colors">
      {/* ─── Left: Telemetry Node ID ──────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          ADSUN Telemetry Node: <span className="text-slate-800 dark:text-slate-200 font-medium">us-east-cluster-04</span>
        </span>
      </div>

      {/* ─── Right: Ingest Rate & Drops ───────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          Ingest Rate:{' '}
          <span className="text-emerald-600 dark:text-[#4ade80] font-bold">48.2 kops/s</span>
          {' • '}
          <span className="text-slate-700 dark:text-slate-300">0 Drops</span>{' '}
          <span className="text-slate-400 dark:text-slate-500">(p99.9 &lt; 2.4ms)</span>
        </span>

        {/* Small discreet Prometheus exporter trigger */}
        <button
          onClick={() => {
            dispatch({ type: 'OPEN_MODAL', payload: 'prometheus' });
            onPrometheusExport?.();
          }}
          className="text-[10px] text-slate-400 hover:text-[#49cc90] dark:text-slate-500 dark:hover:text-blue-400 transition-colors underline cursor-pointer hidden md:inline"
          title="Open Prometheus OpenMetrics Exporter"
        >
          [Prometheus Exporter]
        </button>
      </div>
    </footer>
  );
}
