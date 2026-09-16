// ============================================================
// ADSUN Dashboard — AlertBanner.tsx
// High load critical alert banner matching reference image
// ============================================================

import React from 'react';
import { AlertTriangle } from 'lucide-react';
const MOCK_SERVERS: any[] = []; // FIXME: Removed mockData

export function AlertBanner() {
  const dispatch = (action: any) => {};
  const state: any = { pollingInterval: 15, lastSyncAt: Date.now() };
  const servers: any[] = MOCK_SERVERS;

  const hn02Node = servers.find((s) => s.id === 'HN-02') || servers.find((s) => s.status === 'degraded');

  if (!hn02Node && !state.throttlingEnabled) {
    return null;
  }

  const cpuVal = hn02Node ? hn02Node.metrics.cpuPercent.toFixed(1) : '89.4';
  const p95Val = hn02Node && hn02Node.metrics.p95latencyCurrentAvgMs
    ? hn02Node.metrics.p95latencyCurrentAvgMs.toFixed(1)
    : (hn02Node ? (hn02Node.metrics.latencyCurrentAvgMs * 2.7).toFixed(1) : '185.0');
  const errRateVal = hn02Node
    ? (hn02Node.metrics.errorRate5xx5xx || hn02Node.metrics.errorRate5xx5xx).toFixed(2)
    : '5.80';

  const handleOpenDetail = () => {
    if (hn02Node) {
      dispatch({ type: 'SET_SELECTED_NODE', payload: hn02Node.id });
      dispatch({ type: 'OPEN_MODAL', payload: 'detail' });
    }
  };

  const handleToggleThrottling = () => {
    dispatch({ type: 'TOGGLE_THROTTLING' });
  };

  return (
    <div
      className="w-full bg-[#fff1f2] border border-[#fecdd3] text-[#9f1239] dark:bg-[#240c13] dark:border-[#5c1d24] dark:text-[#fca5a5] px-3.5 py-2 rounded-md flex flex-wrap items-center justify-between gap-2 text-xs mb-3 shadow-xs transition-colors"
      role="alert"
    >
      {/* ─── Left: Warning message with highlights ───────────── */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <AlertTriangle className="h-4 w-4 text-red-500 dark:text-[#f87171] flex-shrink-0" />
        <p className="leading-snug">
          <span className="font-bold text-red-950 dark:text-[#fca5a5]">
            CẢNH BÁO TẢI CAO [{hn02Node?.name || 'HN-02'}]:
          </span>{' '}
          CPU đạt{' '}
          <span className="font-mono font-bold text-red-900 bg-red-200/60 dark:text-white dark:bg-red-950/60 px-1 py-0.5 rounded">
            {cpuVal}%
          </span>
          , P95 Latency vượt ngưỡng{' '}
          <span className="font-mono font-bold text-red-900 bg-red-200/60 dark:text-white dark:bg-red-950/60 px-1 py-0.5 rounded">
            {p95Val}ms
          </span>{' '}
          <span className="text-red-700/80 dark:text-[#f87171]/80">(Ngưỡng an toàn: &lt;50ms)</span>. 5xx Error Rate đang ở mức{' '}
          <span className="font-mono font-bold text-red-900 bg-red-200/60 dark:text-white dark:bg-red-950/60 px-1 py-0.5 rounded">
            {errRateVal}%
          </span>
          .
        </p>
      </div>

      {/* ─── Right: Throttling Badge & Detail Link ────────────── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={handleToggleThrottling}
          className={`font-bold text-[10px] px-2 py-0.5 rounded tracking-wide uppercase transition-colors cursor-pointer border ${
            state.throttlingEnabled || hn02Node?.isThrottled
              ? 'bg-red-100 hover:bg-red-200 text-red-700 border-red-300 dark:bg-[#3b1219] dark:hover:bg-[#4d1620] dark:text-[#ef4444] dark:border-[#7f1d1d]'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-[#1b253b] dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
          }`}
          title="Bấm để bật/tắt chế độ Throttling"
        >
          {state.throttlingEnabled || hn02Node?.isThrottled ? 'THROTTLING ACTIVE' : 'THROTTLING INACTIVE'}
        </button>

        <button
          onClick={handleOpenDetail}
          className="text-red-600 hover:text-red-900 dark:text-[#f87171] dark:hover:text-white underline font-medium text-xs transition-colors cursor-pointer"
        >
          Xem chi tiết {hn02Node?.name || 'HN-02'}
        </button>
      </div>
    </div>
  );
}


