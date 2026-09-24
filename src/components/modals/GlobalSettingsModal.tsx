import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useUIStore } from "../../store/useUIStore";
import { Settings } from "lucide-react";

export function GlobalSettingsModal() {
  const isOpen = useUIStore((state) => state.modals.settings);
  const closeModal = useUIStore((state) => state.closeModal);
  const settings = useUIStore((state) => state.settings);
  const updateSettings = useUIStore((state) => state.updateSettings);

  const [localThresholds, setLocalThresholds] = useState({
    ...settings.thresholds,
    queueWarning: settings.thresholds?.queueWarning ?? 50,
    queueDegraded: settings.thresholds?.queueDegraded ?? 300,
  });

  useEffect(() => {
    if (isOpen) {
      setLocalThresholds({
        ...settings.thresholds,
        queueWarning: settings.thresholds?.queueWarning ?? 50,
        queueDegraded: settings.thresholds?.queueDegraded ?? 300,
      });
    }
  }, [isOpen, settings.thresholds]);

  const handleSave = () => {
    updateSettings({ ...settings, thresholds: localThresholds });
    closeModal("settings");
  };

  const handleChange = (key: keyof typeof localThresholds, value: string) => {
    const num = parseFloat(value);
    setLocalThresholds((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num,
    }));
  };

  const thresholdConfigs = [
    {
      id: "cpu",
      title: "CPU Threshold (%)",
      warnKey: "cpuWarning" as const,
      degKey: "cpuDegraded" as const,
      preview: (warn: number, deg: number) => (
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          &lt;{warn}% (Xanh) | &ge;{deg}% (Đỏ)
        </span>
      ),
    },
    {
      id: "latency",
      title: "Latency Threshold (ms)",
      warnKey: "latencyWarning" as const,
      degKey: "latencyDegraded" as const,
      preview: (warn: number, deg: number) => (
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          &lt;{warn}ms (Xanh) | &ge;{deg}ms (Đỏ)
        </span>
      ),
    },
    {
      id: "error5xx",
      title: "Error 5xx Threshold (%)",
      warnKey: "error5xxWarning" as const,
      degKey: "error5xxDegraded" as const,
      preview: (warn: number, deg: number) => (
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          &lt;{warn}% (Xanh) | &ge;{deg}% (Đỏ)
        </span>
      ),
    },
    {
      id: "queue",
      title: "Queue Threshold",
      warnKey: "queueWarning" as const,
      degKey: "queueDegraded" as const,
      warnLabel: "Warning (Vàng / Cam)",
      preview: (warn: number, deg: number) => (
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          &lt;{warn} (Xanh) | &ge;{deg} (Đỏ)
        </span>
      ),
    },
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && closeModal("settings")}
    >
      <DialogContent className="sm:max-w-[480px] max-h-[88vh] flex flex-col bg-white dark:bg-[#0b0f19] border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Settings className="h-5 w-5" />
            Global Threshold Settings
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Tùy chỉnh ngưỡng cảnh báo (Warning & Degraded) cho toàn bộ hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 overflow-y-auto pr-1">
          {thresholdConfigs.map((block) => (
            <div
              key={block.id}
              className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                  {block.title}
                </h4>
                {block.preview &&
                  block.preview(
                    localThresholds[block.warnKey] ?? 0,
                    localThresholds[block.degKey] ?? 0,
                  )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-amber-600 dark:text-amber-500 text-xs">
                    {block.warnLabel || "Warning (Vàng)"}
                  </Label>
                  <Input
                    type="number"
                    className="h-8 bg-white dark:bg-slate-900 font-mono"
                    value={localThresholds[block.warnKey] ?? ""}
                    onChange={(e) =>
                      handleChange(block.warnKey, e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-red-600 dark:text-red-500 text-xs">
                    Degraded (Đỏ)
                  </Label>
                  <Input
                    type="number"
                    className="h-8 bg-white dark:bg-slate-900 font-mono"
                    value={localThresholds[block.degKey] ?? ""}
                    onChange={(e) => handleChange(block.degKey, e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => closeModal("settings")}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Lưu Cài Đặt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
