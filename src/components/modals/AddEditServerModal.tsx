// ============================================================
// ADSUN Dashboard — AddEditServerModal.tsx
// Form to Add or Edit a server node
// ============================================================

import React, { useState, useEffect } from "react";
import { Plus, Save, Server } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../../hooks/useToast";
import { REGIONS, ROLES } from "../../constants";
import type {
  ServerNode,
  ServerFormValues,
  Region,
  ServerRole,
} from "../../types";
import { useDashboardStore } from "../../store/useDashboardStore";

function generateId(): string {
  return `NODE-${Date.now().toString(36).toUpperCase()}`;
}

function createNewNode(values: ServerFormValues): ServerNode {
  return {
    id: generateId(),
    name: values.name,
    baseUrl: values.baseUrl,
    accessToken: values.accessToken,
    status: "offline",
    lastSyncAt: Date.now(),
    endpoints: [],
    metrics: {
      cpuPercent: 0,
      ramGB: 0,
      managedHeapMb: 0,
      latencyCurrentAvgMs: 0,
      latencyOverallAvgMs: 0,
      minLatencyMs: 0,
      rps: 0,
      totalRequests: 0,
      errorRate4xx: 0,
      errorRate5xx: 0,
      activeStreams: 0,
      maxLatencyMs: 0,
      successRate: 100,
    },
  };
}

export function AddEditServerModal() {
  const toast = useToast();
  const modals = useDashboardStore((state) => state.modals);
  const closeModal = useDashboardStore((state) => state.closeModal);
  const editingNodeId = useDashboardStore((state) => state.editingNodeId);
  const servers = useDashboardStore((state) => state.servers);
  const addServer = useDashboardStore((state) => state.addServer);
  const editServer = useDashboardStore((state) => state.editServer);
  const editingServer = servers.find((server) => server.id === editingNodeId);
  const isEditMode = !!editingServer;
  const [form, setForm] = useState<ServerFormValues>({
    name: "",
    baseUrl: "",
    accessToken: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (editingServer) {
      setForm({
        name: editingServer.name,
        baseUrl: editingServer.baseUrl,
        accessToken: editingServer.accessToken || "",
      });
    } else {
      setForm({ name: "", baseUrl: "", accessToken: "" });
    }
    setErrors({});
  }, [editingServer, modals.addEdit]);

  const onClose = () => closeModal("addEdit");

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) {
      e.name = "Vui lòng nhập tên Server Node";
    } else if (!/^[a-zA-Z0-9-]{3,20}$/.test(form.name)) {
      // Cho phép chữ hoa, chữ thường, số, dấu gạch ngang, từ 3-20 ký tự
      e.name =
        "Định dạng sai: Chỉ dùng chữ cái, số, dấu gạch ngang (VD: HCM-01)";
    }
    // 2. Rào điều kiện cho Base URL
    if (!form.baseUrl.trim()) {
      e.baseUrl = "Vui lòng nhập Endpoint Telemetry Base URL";
    } else if (!/^https?:\/\/.+/.test(form.baseUrl.trim())) {
      // Phải bắt đầu bằng http:// hoặc https://
      e.baseUrl = "URL không hợp lệ. Phải bắt đầu bằng http:// hoặc https://";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast.saveError("Please fix the form errors.");
      return;
    }
    if (isEditMode && editingServer) {
      ////Code edit
      const updatedServer = {
        ...editingServer,
        ...form,
      };
      editServer(updatedServer);
      toast.save(`Server "${form.name}" updated`);
      closeModal("addEdit");
    } else {
      const newNode = createNewNode(form);
      addServer(newNode);
      toast.save(`Server "${form.name}" added`);
      closeModal("addEdit");
    }
  };

  const field = (key: keyof ServerFormValues) => ({
    id: `field-${key}`,
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      })),
    className: errors[key]
      ? "border-red-500/50 focus-visible:ring-red-500/30"
      : "",
  });

  return (
    <Dialog open={modals.addEdit} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
        <DialogHeader className="p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/30">
              {isEditMode ? (
                <Server className="h-4 w-4 text-primary" />
              ) : (
                <Plus className="h-4 w-4 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle>
                {isEditMode ? "Edit Server Node" : "Add Server Node"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? `Editing ${editingServer}`
                  : "Register a new server in the dashboard"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {/* --- 4. Thẻ UI Input bên trong form --- */}
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="field-name">Node Name</Label>
            <Input
              {...field("name")}
              placeholder="e.g. HCM-03"
              className={`font-mono ${field("name").className}`}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="field-baseUrl">Base URL</Label>
            <Input
              {...field("baseUrl")}
              type="url"
              placeholder="https://api.yourdomain.com/metrics"
              className={`font-mono ${field("baseUrl").className}`}
            />
            {errors.baseUrl && (
              <p className="text-xs text-red-400">{errors.baseUrl}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="field-accessToken">Access Token (Optional)</Label>
            <Input
              {...field("accessToken")}
              type="password"
              placeholder="Bearer token (if required)..."
              className={`font-mono ${field("accessToken").className}`}
            />
          </div>
        </div>
        <DialogFooter className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            size="sm"
            className="gap-2"
            id="save-server-btn"
          >
            {isEditMode ? (
              <Save className="h-3.5 w-3.5" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {isEditMode ? "Save Changes" : "Add Server"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
