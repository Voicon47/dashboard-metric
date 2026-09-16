// ============================================================
// ADSUN Dashboard — ServerColumnsMatrix.tsx
// "Khu Vực Endpoint Theo Từng Server (Server Columns Matrix) [CORE PIPELINE]"
// ============================================================

import React from "react";
import { Columns3 } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { ServerColumnCard } from "./ServerColumnCard";

export function ServerColumnsMatrix() {
  const allServers = useDashboardStore((state) => state.servers);
  const columns = allServers.slice(0, 4);

  return (
    <section className="mb-4">
      {/* ─── Header: Title, Core Pipeline Badge ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Columns3 className="h-4 w-4 text-[#49cc90] dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Endpoint Server
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
            Hiển thị tự nhiên độ dài các endpoint riêng biệt của mỗi node. Phân
            loại chi tiết theo Độ trễ, RPS, và Tỉ lệ lỗi.
          </p>
        </div>
      </div>

      {/* ─── 4 Columns Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {columns.map((server) => (
          <ServerColumnCard key={server.id} server={server} />
        ))}
      </div>
    </section>
  );
}
