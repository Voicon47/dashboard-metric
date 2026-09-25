import React from "react";
import {
  Image as ImageIcon,
  Video,
  Radio,
  AlertTriangle,
  Bot,
  Settings2,
  PackageSearch,
} from "lucide-react";
import type { QueueMetrics } from "../../types";
import { useUIStore } from "../../store/useUIStore";
import { getQueueTheme, getQueueItemColor } from "../../constants/metricTheme";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { formatCompactNumber, formatExactNumber } from "../../utils/formatUtils";
import { cn } from "../../lib/utils";

interface QueueGaugesProps {
  queues: QueueMetrics | null | undefined;
  className?: string;
}

export function QueueGauges({ queues, className }: QueueGaugesProps) {
  // Undefined = loading
  if (queues === undefined) {
    return (
      <div
        className={cn(
          "mt-2.5 rounded-sm border-2 border-slate-100 dark:border-slate-800/60 overflow-hidden bg-white dark:bg-[#0c1220] shadow-xs",
          className
        )}
      >
        <div className="flex items-center justify-between gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-500 select-none">
          <div className="flex items-center gap-1.5 font-bold text-[10.5px] sm:text-[11.5px] uppercase tracking-wide min-w-0 flex-1">
            <PackageSearch className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">QUEUE MONITOR</span>
          </div>
          <div className="font-mono font-bold text-[9.5px] sm:text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0">
            LOADING...
          </div>
        </div>
        <div className="p-3 text-center text-xs text-slate-400 animate-pulse">
          Đang tải dữ liệu hàng đợi...
        </div>
      </div>
    );
  }

  // Null = unavailable
  if (queues === null) {
    return (
      <div
        className={cn(
          "mt-2.5 rounded-sm border-2 border-slate-100 dark:border-slate-800/60 overflow-hidden bg-white dark:bg-[#0c1220] shadow-xs opacity-60 hover:opacity-100 transition-opacity",
          className
        )}
      >
        <div className="flex items-center justify-between gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-500 select-none">
          <div className="flex items-center gap-1.5 font-bold text-[10.5px] sm:text-[11.5px] uppercase tracking-wide min-w-0 flex-1">
            <PackageSearch className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">QUEUE MONITOR</span>
          </div>
          <div className="font-mono font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0">
            UNAVAILABLE
          </div>
        </div>
      </div>
    );
  }

  // Active queues
  const items = [
    {
      key: "Image",
      label: "Image",
      fullName: "Image Queue",
      value: queues.Image ?? 0,
      icon: <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />,
    },
    {
      key: "Video",
      label: "Video",
      fullName: "Video Queue",
      value: queues.Video ?? 0,
      icon: <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />,
    },
    {
      key: "CameraDebugLog",
      label: "CamDebug",
      fullName: "Camera Debug Log",
      value: queues.CameraDebugLog ?? 0,
      icon: <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />,
    },
    {
      key: "ErrorImageLog",
      label: "ErrImgLog",
      fullName: "Error Image Log",
      value: queues.ErrorImageLog ?? 0,
      icon: <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />,
    },
    {
      key: "EventAI",
      label: "EventAI",
      fullName: "Event AI Queue",
      value: queues.EventAI ?? 0,
      icon: <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />,
    },
    {
      key: "AIConfig",
      label: "AIConfig",
      fullName: "AI Config Queue",
      value: queues.AIConfig ?? 0,
      icon: <Settings2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />,
    },
  ];

  const total = items.reduce((sum, item) => sum + item.value, 0);

  // Styling logic based on thresholds
  const settings = useUIStore((state) => state.settings);
  const warningThreshold = settings.thresholds?.queueWarning ?? 50;
  const degradedThreshold = settings.thresholds?.queueDegraded ?? 300;

  const { headerBg, borderColor } = getQueueTheme(
    total,
    warningThreshold,
    degradedThreshold
  );

  return (
    <div
      className={cn(
        `mt-2.5 first:mt-0 rounded-sm border-2 ${borderColor} overflow-hidden bg-white dark:bg-[#0c1220] shadow-xs`,
        className
      )}
    >
      {/* Header with Title and Total Badge */}
      <div
        className={`flex items-center justify-between gap-1.5 px-2.5 sm:px-3 py-1.5 ${headerBg} text-white select-none`}
      >
        <div className="flex items-center gap-1.5 font-bold text-[10.5px] sm:text-[11.5px] uppercase tracking-wide min-w-0 flex-1">
          <PackageSearch className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">QUEUE MONITOR</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="shrink-0 whitespace-nowrap font-mono font-bold text-[10px] sm:text-[10.5px] px-2 py-0.5 rounded-md border border-white/20 bg-black/25 shadow-2xs cursor-help">
              Total: {formatCompactNumber(total)}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="font-mono text-xs">
            Tổng hàng đợi: {formatExactNumber(total)} tin nhắn
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Grid of Queue Items */}
      <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800/60">
        {items.map((item) => {
          const valColor = getQueueItemColor(
            item.value,
            warningThreshold,
            degradedThreshold
          );
          const isLargeValue = item.value >= 1000;
          const displayValue = isLargeValue
            ? formatCompactNumber(item.value)
            : item.value.toString();

          return (
            <Tooltip key={item.key}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between px-2 sm:px-2.5 py-1.5 sm:py-2 bg-white dark:bg-[#0c1220] min-w-0 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors cursor-default select-none group">
                  <div className="flex items-center gap-1 sm:gap-1.5 text-slate-500 dark:text-slate-400 min-w-0 flex-1 mr-1">
                    <span className="shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-[10.5px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-extrabold text-[11px] sm:text-xs tracking-tight shrink-0 ${valColor}`}
                  >
                    {displayValue}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs font-mono">
                <div className="font-semibold text-slate-900 dark:text-white">
                  {item.fullName}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Số lượng: {formatExactNumber(item.value)} tin nhắn
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
