// ============================================================
// ADSUN Dashboard — ServerColumnsMatrix.tsx
// "Khu Vực Endpoint Theo Từng Server (Server Columns Matrix) [CORE PIPELINE]"
// ============================================================

import React from "react";
import { Columns3 } from "lucide-react";
import { useServerStore } from "../../store/useServerStore";
import { useUIStore } from "../../store/useUIStore";
import { ServerColumnCard } from "./ServerColumnCard";
import { ColumnsFilterBar } from "../filters/ColumnsFilterBar";
import { cn } from "../../lib/utils";

interface ServerColumnsMatrixProps {
  className?: string;
}

export function ServerColumnsMatrix({ className }: ServerColumnsMatrixProps = {}) {
  const allServers = useServerStore((state) => state.servers);
  const columnsFilter = useUIStore((state) => state.columnsFilter);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;

      const isAtLeft = el.scrollLeft <= 0;
      const isAtRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

      const isScrollingLeft = e.deltaY < 0;
      const isScrollingRight = e.deltaY > 0;

      // Allow vertical scroll if we are at the horizontal edges
      if ((isAtLeft && isScrollingLeft) || (isAtRight && isScrollingRight)) {
        return;
      }

      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  // 1. Filter servers by ID
  const visibleServers =
    columnsFilter.serverIds.length > 0
      ? allServers.filter((s) => columnsFilter.serverIds.includes(s.id))
      : allServers;

  // 2. Filter servers by status
  const filteredServers =
    columnsFilter.serverStatus.length > 0
      ? visibleServers.filter((s) =>
          columnsFilter.serverStatus.includes(s.status)
        )
      : visibleServers;

  return (
    <section className="mb-4">
      {/* ─── Header: Title, Description ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <Columns3 className="h-4 w-4 text-[#49cc90] dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Endpoint Server
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
            Hiển thị thông tin enpoints của từng server. Phân
            loại chi tiết theo Độ trễ, RPS, và Tỉ lệ lỗi.
          </p>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <ColumnsFilterBar servers={allServers} />

      {/* ─── Columns Grid ────────────────────────────────────── */}
      {filteredServers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-[#0c101d] rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400">
          <p className="text-sm font-medium">
            Không tìm thấy server nào phù hợp với bộ lọc hiện tại.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Vui lòng thay đổi lựa chọn Server hoặc Trạng thái trong thanh lọc.
          </p>
        </div>
      ) : (
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-3.5 pb-4 custom-scrollbar w-full"
        >
          {filteredServers.map((server) => (
            <ServerColumnCard
              key={server.id}
              server={server}
              endpointFilter={columnsFilter}
              serverCount={filteredServers.length}
            />
          ))}
        </div>
      )}
    </section>
  );
}
