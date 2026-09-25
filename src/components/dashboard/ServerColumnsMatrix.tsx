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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

interface ServerColumnsMatrixProps {
  className?: string;
}

export function ServerColumnsMatrix({ className }: ServerColumnsMatrixProps = {}) {
  const allServers = useServerStore((state) => state.servers);
  const columnsFilter = useUIStore((state) => state.columnsFilter);

  // Legacy scroll logic removed in favor of Shadcn Carousel

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
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full max-w-full"
        >
          {/* Sticky wrapper so buttons follow vertical scroll */}
          <div 
            className="sticky top-[50vh] z-50 h-0 w-full flex justify-between pointer-events-none" 
            style={{ transform: 'translateY(-50%)' }}
          >
            <CarouselPrevious className="pointer-events-auto relative left-2 md:-left-4 top-0 translate-y-0 h-12 w-12 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border-2 border-slate-200 dark:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.3)] hover:scale-110 transition-all duration-300 hidden md:flex" />
            <CarouselNext className="pointer-events-auto relative right-2 md:-right-4 top-0 translate-y-0 h-12 w-12 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border-2 border-slate-200 dark:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.3)] hover:scale-110 transition-all duration-300 hidden md:flex" />
          </div>

          <CarouselContent className="-ml-3.5 pb-4">
            {filteredServers.map((server) => (
              <CarouselItem key={server.id} className="pl-3.5 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <ServerColumnCard
                  server={server}
                  endpointFilter={columnsFilter}
                  serverCount={filteredServers.length}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  );
}
