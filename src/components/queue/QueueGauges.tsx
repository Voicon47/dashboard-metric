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

interface QueueGaugesProps {
  queues: QueueMetrics | null | undefined;
}

export function QueueGauges({ queues }: QueueGaugesProps) {
  // Undefined = loading
  if (queues === undefined) {
    return (
      <div className="mt-2.5 rounded-sm border-2 border-slate-100 dark:border-slate-800/60 overflow-hidden bg-white dark:bg-[#0c1220] shadow-xs">
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-500">
          <div className="flex items-center gap-1.5 font-bold text-[10px] sm:text-[10.5px] uppercase tracking-wide">
            <PackageSearch className="w-3 h-3" />
            <span>QUEUE MONITOR</span>
          </div>
        </div>
        <div className="p-3 text-center text-xs text-slate-400 animate-pulse">
          Loading queues...
        </div>
      </div>
    );
  }

  // Null = unavailable
  if (queues === null) {
    return (
      <div className="mt-2.5 rounded-sm border-2 border-slate-100 dark:border-slate-800/60 overflow-hidden bg-white dark:bg-[#0c1220] shadow-xs opacity-60 hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-500">
          <div className="flex items-center gap-1.5 font-bold text-[10px] sm:text-[10.5px] uppercase tracking-wide">
            <PackageSearch className="w-3 h-3" />
            <span>QUEUE MONITOR</span>
          </div>
          <div className="font-mono font-bold text-[9px] sm:text-[9.5px] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            UNAVAILABLE
          </div>
        </div>
      </div>
    );
  }

  // Active queues
  const items = [
    { label: "Image", value: queues.Image, icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { label: "Video", value: queues.Video, icon: <Video className="w-3.5 h-3.5" /> },
    { label: "CamDebug", value: queues.CameraDebugLog, icon: <Radio className="w-3.5 h-3.5" /> },
    { label: "ErrImageLog", value: queues.ErrorImageLog, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { label: "EventAI", value: queues.EventAI, icon: <Bot className="w-3.5 h-3.5" /> },
    { label: "AIConfig", value: queues.AIConfig, icon: <Settings2 className="w-3.5 h-3.5" /> },
  ];

  const total = items.reduce((sum, item) => sum + item.value, 0);

  // Styling logic based on thresholds
  const settings = useUIStore((state) => state.settings);
  const warningThreshold = settings.thresholds?.queueWarning ?? 50;
  const degradedThreshold = settings.thresholds?.queueDegraded ?? 300;

  const { headerBg, borderColor } = getQueueTheme(total, warningThreshold, degradedThreshold);

  return (
    <div className={`mt-2.5 rounded-sm border-2 ${borderColor} overflow-hidden bg-white dark:bg-[#0c1220] shadow-xs`}>
      <div className={`flex items-center justify-between px-3 py-1.5 ${headerBg} select-none`}>
        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-[12px] uppercase tracking-wide">
          <PackageSearch className="w-3.5 h-3.5 shrink-0" />
          <span>QUEUE MONITOR</span>
        </div>
        <div className="font-mono font-bold text-[10.5px] sm:text-[11px] px-2.5 py-0.5 rounded-md border border-white/20 bg-black/25 shadow-2xs">
          Total: {total}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800/60">
        {items.map((item, idx) => {
          const valColor = getQueueItemColor(item.value, warningThreshold, degradedThreshold);
          return (
            <div
              key={idx}
              className="flex items-center justify-between px-2.5 py-2 bg-white dark:bg-[#0c1220]"
            >
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                {item.icon}
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {item.label}
                </span>
              </div>
              <span className={`font-mono font-extrabold text-xs sm:text-sm tracking-tight ${valColor}`}>
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
