import React from "react";
import { useServerStore } from "../../store/useServerStore";
import { useUIStore } from "../../store/useUIStore";
import { MetricKey, METRIC_CONFIG } from "../../constants/chartConfig";
import { MetricChart } from "./MetricChart";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";

export const SystemOverviewChart: React.FC = React.memo(() => {
  const servers = useServerStore((state) => state.servers);
  const theme = useUIStore((state) => state.settings?.theme || "light");
  const visibleMetrics = useUIStore((state) => state.visibleChartMetrics) as MetricKey[];
  const setVisibleMetrics = useUIStore((state) => state.setVisibleChartMetrics);

  const isDark = theme === "dark";
  const textColor = isDark ? "#f1f5f9" : "#334155";
  const gridLineColor = isDark ? "#334155" : "#e2e8f0";
  const bgColor = isDark ? "transparent" : "transparent";

  const toggleMetric = (key: MetricKey) => {
    setVisibleMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  if (servers.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/60 dark:bg-[#0c101d]/60 shadow-sm p-4 h-[300px] flex items-center justify-center text-slate-400 text-sm">
        Chưa có server nào. Hãy thêm server để xem biểu đồ.
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/60 dark:bg-[#0c101d]/60 shadow-sm p-4">
      {/* --- Thanh Toolbar chứa Dropdown --- */}
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Biểu đồ So sánh Hệ thống
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-3 py-1.5 text-[12px] sm:text-sm font-medium bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-slate-700/80 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <SlidersHorizontal className="w-3.5 h-3.5 opacity-70" />
              Hiển thị ({visibleMetrics.length}/4)
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-slate-500 uppercase tracking-wider py-1.5">
              Chọn biểu đồ
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((key) => {
              const isChecked = visibleMetrics.includes(key);
              return (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={isChecked}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() => toggleMetric(key)}
                  className="text-xs py-2 cursor-pointer"
                >
                  <span className="text-[13px]">{METRIC_CONFIG[key].label}</span>
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* --- Kết thúc Toolbar --- */}

      {/* Render các chart đang được tick chọn (Chia lưới 2 cột) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visibleMetrics.length === 0 ? (
          <div className="col-span-full h-[200px] flex items-center justify-center text-slate-400 text-sm italic">
            Vui lòng chọn ít nhất một biểu đồ để hiển thị.
          </div>
        ) : (
          visibleMetrics.map((key) => (
            <div key={key} className="w-full">
              <MetricChart
                metricKey={key}
                servers={servers}
                isDark={isDark}
                textColor={textColor}
                gridLineColor={gridLineColor}
                bgColor={bgColor}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
});
