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

  const [localThresholds, setLocalThresholds] = useState(settings.thresholds);

  useEffect(() => {
    if (isOpen) {
      setLocalThresholds(settings.thresholds);
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && closeModal("settings")}
    >
      <DialogContent className="sm:max-w-[460px] bg-white dark:bg-[#0b0f19] border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Settings className="h-5 w-5" />
            Global Threshold Settings
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Tùy chỉnh ngưỡng cảnh báo (Warning & Degraded) cho toàn bộ hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* CPU */}
          <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">
              CPU Threshold (%)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-amber-600 dark:text-amber-500 text-xs">
                  Warning (Vàng)
                </Label>
                <Input
                  type="number"
                  className="h-8 bg-white dark:bg-slate-900"
                  value={localThresholds.cpuWarning}
                  onChange={(e) => handleChange("cpuWarning", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-red-600 dark:text-red-500 text-xs">
                  Degraded (Đỏ)
                </Label>
                <Input
                  type="number"
                  className="h-8 bg-white dark:bg-slate-900"
                  value={localThresholds.cpuDegraded}
                  onChange={(e) => handleChange("cpuDegraded", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Latency */}
          <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">
              Latency Threshold (ms)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-amber-600 dark:text-amber-500 text-xs">
                  Warning (Vàng)
                </Label>
                <Input
                  type="number"
                  className="h-8 bg-white dark:bg-slate-900"
                  value={localThresholds.latencyWarning}
                  onChange={(e) =>
                    handleChange("latencyWarning", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-red-600 dark:text-red-500 text-xs">
                  Degraded (Đỏ)
                </Label>
                <Input
                  type="number"
                  className="h-8 bg-white dark:bg-slate-900"
                  value={localThresholds.latencyDegraded}
                  onChange={(e) =>
                    handleChange("latencyDegraded", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* 5xx Error */}
          <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">
              Error 5xx Threshold (%)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-amber-600 dark:text-amber-500 text-xs">
                  Warning (Vàng)
                </Label>
                <Input
                  type="number"
                  className="h-8 bg-white dark:bg-slate-900"
                  value={localThresholds.error5xxWarning}
                  onChange={(e) =>
                    handleChange("error5xxWarning", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-red-600 dark:text-red-500 text-xs">
                  Degraded (Đỏ)
                </Label>
                <Input
                  type="number"
                  className="h-8 bg-white dark:bg-slate-900"
                  value={localThresholds.error5xxDegraded}
                  onChange={(e) =>
                    handleChange("error5xxDegraded", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
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
