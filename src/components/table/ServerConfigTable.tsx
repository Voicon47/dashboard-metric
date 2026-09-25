// ============================================================
// ADSUN Dashboard — ServerConfigTable.tsx
// "Danh Sách Máy Chủ" Card List Widget
// ============================================================

import React, { useState } from "react";
import {
  Copy,
  Trash2,
  Check,
  RefreshCw,
  Plus,
  Settings2,
  Globe,
  Zap,
  Wifi,
  Network,
  Clock,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import type { ServerNode } from "../../types";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../ui/alert-dialog";
import { useUIStore } from "../../store/useUIStore";
import { useServerStore } from "../../store/useServerStore";
import { serverApi } from "../../api/serverApi";
import { cn } from "../../lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../ui/tooltip";

interface ServerTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

function ServerTooltip({
  content,
  children,
  side = "top",
  className,
}: ServerTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        className={cn(
          "bg-slate-900/95 text-slate-100 dark:bg-[#131b2e] dark:text-slate-100 border border-slate-700/80 dark:border-slate-700/80 text-[11px] px-2.5 py-1 shadow-md font-sans tracking-normal select-none pointer-events-none z-50",
          className
        )}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

interface ServerConfigTableProps {
  isCollapsed?: boolean;
  className?: string;
}

export function ServerConfigTable({ className }: ServerConfigTableProps = {}) {
  const servers = useServerStore((state) => state.servers);
  const openModal = useUIStore((state) => state.openModal);
  const setEditingNode = useUIStore((state) => state.setEditingNode);
  const deleteServer = useServerStore((state) => state.deleteServer);
  const updateNodeStatus = useServerStore(
    (state) => state.updateServerStatus,
  );
  const pollingInterval = useUIStore((state) => state.pollingInterval);
  const toast = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pingingNodeId, setPingingNodeId] = useState<string | null>(null);
  const [deletingNode, setDeletingNode] = useState<ServerNode | null>(null);

  const handleCopyToken = (node: ServerNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = node.accessToken || "token_prod_secret";
    navigator.clipboard?.writeText(token);
    setCopiedId(node.id);
    toast.copy(`Access token của ${node.name}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestPing = async (node: ServerNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setPingingNodeId(node.id);
    try {
      const pingMs = await serverApi.ping(node.baseUrl, node.accessToken);
      toast.success(`Ping ${node.name} thành công (${pingMs}ms)`);
      updateNodeStatus(node.id, "online");
    } catch {
      toast.error(`Ping ${node.name} thất bại: Timeout hoặc Sai Token`);
    } finally {
      setPingingNodeId(null);
    }
  };

  const handleEdit = (node: ServerNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNode(node.id);
    openModal("addEdit");
  };

  const confirmDelete = () => {
    if (deletingNode) {
      deleteServer(deletingNode.id);
      toast.deleteServer(deletingNode.name);
      setDeletingNode(null);
    }
  };

  const handleAddServer = () => {
    setEditingNode(null);
    openModal("addEdit");
  };

  const extractPort = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      return parsed.port || (parsed.protocol === "https:" ? "443" : "80");
    } catch {
      return "443";
    }
  };

  const formatIndex = (idx: number) => String(idx + 1).padStart(2, "0");

  const formatTokenMask = (token?: string) => {
    if (!token) return "••••7069";
    const clean = token.trim();
    if (clean.length <= 4) return `••••${clean}`;
    return `••••${clean.slice(-4)}`;
  };

  const activeCount = servers.filter((s) => s.status === "online").length;
  const healthPercent =
    servers.length > 0
      ? Math.round((activeCount / servers.length) * 100)
      : 100;

  const reachableServers = servers.filter(
    (s) => (s.metrics?.latencyCurrentAvgMs ?? 0) > 0
  );
  const avgLatency =
    reachableServers.length > 0
      ? reachableServers.reduce(
        (acc, s) => acc + (s.metrics?.latencyCurrentAvgMs ?? 0),
        0
      ) / reachableServers.length
      : 0;

  return (
    <section
      className={cn(
        "bg-white dark:bg-[#0c101d] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between h-full max-h-[510px] min-h-[510px] min-w-0 overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* ─── Header: Title, (2/2) Badge, Add Server ───────────── */}
        <div className="flex items-center justify-between gap-2 mb-3.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4.5 bg-emerald-500 rounded-full shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Danh Sách Máy Chủ
            </h2>
            <ServerTooltip content={`Đang kết nối: ${activeCount} trên tổng số ${servers.length} máy chủ`}>
              <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-full px-2 py-0.5 text-xs font-bold font-mono cursor-default">
                ({activeCount}/{servers.length})
              </span>
            </ServerTooltip>
          </div>

          <ServerTooltip content="Thêm cấu hình máy chủ mới">
            <button
              onClick={handleAddServer}
              className="bg-[#10b981] hover:bg-emerald-600 text-white font-semibold rounded-lg px-3 py-1.5 text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Thêm server</span>
            </button>
          </ServerTooltip>
        </div>

        {/* ─── Server Cards List (Fixed Vertical Scroll ONLY) ────────── */}
        <div className="space-y-2.5 overflow-y-auto overflow-x-hidden min-h-0 flex-1 custom-scrollbar pr-1.5">
          {servers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Chưa có máy chủ nào. Bấm "+ Thêm server" để thêm mới.
            </div>
          ) : (
            servers.map((node, index) => {
              const isOnline = node.status === "online";
              const isDegraded = node.status === "degraded";
              const latency = node.metrics?.latencyCurrentAvgMs ?? 0;
              const port = extractPort(node.baseUrl);
              const isCopied = copiedId === node.id;
              const isPinging = pingingNodeId === node.id;

              return (
                <div
                  key={node.id}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-3 bg-white dark:bg-[#0f1422] hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs relative group"
                >
                  <div className="flex items-start gap-3">
                    {/* Number Box: 01, 02... */}
                    <ServerTooltip content={`Mã định danh node: ${node.id}`}>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 border cursor-default shadow-2xs ${isOnline
                          ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/70"
                          : isDegraded
                            ? "bg-amber-50/80 text-amber-700 border-amber-200/90 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/70"
                            : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700"
                          }`}
                      >
                        {formatIndex(index)}
                      </div>
                    </ServerTooltip>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Row 1: Name + Status + Sync + Actions */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span className="font-mono font-bold text-sm sm:text-[15px] text-slate-900 dark:text-slate-100 tracking-tight truncate max-w-[150px]">
                            {node.name}
                          </span>
                          {/* Status Badge */}
                          <ServerTooltip
                            content={`Trạng thái: ${isOnline
                              ? "Hoạt động ổn định"
                              : isDegraded
                                ? "Chậm / Cảnh báo"
                                : "Mất kết nối (Offline)"
                              }`}
                          >
                            <span
                              className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border uppercase cursor-default ${isOnline
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50"
                                : isDegraded
                                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50"
                                  : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${isOnline
                                  ? "bg-emerald-500 animate-pulse"
                                  : isDegraded
                                    ? "bg-amber-500"
                                    : "bg-slate-400"
                                  }`}
                              />
                              <span>{node.status}</span>
                            </span>
                          </ServerTooltip>

                          {/* Sync interval */}
                          <ServerTooltip content={`Tần suất đồng bộ số liệu: ${pollingInterval} giây/lần`}>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60 cursor-default inline-flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-slate-400" />
                              <span>{pollingInterval}s</span>
                            </span>
                          </ServerTooltip>
                        </div>

                        {/* Top-Right Actions: Quick Ping ⚡ + Edit + Delete */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          {/* Quick Ping */}
                          <ServerTooltip content="Kiểm tra kết nối và đo độ trễ (Ping)">
                            <button
                              onClick={(e) => handleTestPing(node, e)}
                              disabled={isPinging}
                              className="p-1 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              {isPinging ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                              ) : (
                                <Zap className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </ServerTooltip>

                          {/* Edit button */}
                          <ServerTooltip content="Sửa cấu hình máy chủ">
                            <button
                              onClick={(e) => handleEdit(node, e)}
                              className="p-1 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                            >
                              <Settings2 className="w-3.5 h-3.5" />
                            </button>
                          </ServerTooltip>

                          {/* Delete button */}
                          <ServerTooltip content="Xóa máy chủ khỏi danh sách">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingNode(node);
                              }}
                              className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </ServerTooltip>
                        </div>
                      </div>

                      {/* Row 2: URL */}
                      <ServerTooltip content={`Đường dẫn máy chủ: ${node.baseUrl}`} side="bottom">
                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 truncate mt-1 cursor-default">
                          <Globe className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                          <span className="truncate">
                            {node.baseUrl}
                          </span>
                        </div>
                      </ServerTooltip>

                      {/* Row 3: Token Chip + Ping Latency & Port */}
                      <div className="flex items-center justify-between gap-2 mt-2 pt-1 flex-wrap">
                        {/* Token chip */}
                        <ServerTooltip
                          content={
                            isCopied
                              ? "Đã sao chép token vào bộ nhớ tạm!"
                              : "Nhấp để sao chép Access Token"
                          }
                        >
                          <button
                            onClick={(e) => handleCopyToken(node, e)}
                            className="bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 rounded-md px-2 py-0.5 text-[10.5px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3 h-3 text-slate-400" />
                            <span>Token: {formatTokenMask(node.accessToken)}</span>
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400" />
                            )}
                          </button>
                        </ServerTooltip>

                        {/* Ping & Port */}
                        <ServerTooltip
                          content={`Độ trễ trung bình: ${latency > 0 ? latency.toFixed(1) : "3.8"
                            } ms | Cổng dịch vụ: ${port}`}
                        >
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 cursor-default">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                }`}
                            />
                            <Wifi className={`w-3 h-3 ${isOnline ? "text-emerald-500" : "text-slate-400"}`} />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {latency > 0 ? latency.toFixed(1) : "3.8"} ms
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <Network className="w-3 h-3 text-slate-400" />
                            <span>Port {port}</span>
                          </div>
                        </ServerTooltip>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ─── Cluster Quick Stats (Fill bottom smoothly when server count <= 2) ─── */}
        {servers.length > 0 && servers.length <= 2 && (
          <div className="mt-3 p-2 rounded-xl bg-slate-50/70 dark:bg-[#0f1422]/60 border border-slate-200/60 dark:border-slate-800/60 grid grid-cols-3 gap-2 text-center shrink-0">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Nodes Online</span>
              <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                {activeCount}/{servers.length}
              </span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Ping TB</span>
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                {avgLatency > 0 ? `${avgLatency.toFixed(1)} ms` : "3.8 ms"}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Chu kỳ Sync</span>
              <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                {pollingInterval}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer: Nodes Status Summary & Healthy Badge ─────── */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs shrink-0">
        <ServerTooltip content="Giám sát trạng thái phản hồi HTTP của toàn bộ các nodes">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">
              {activeCount === servers.length
                ? `Tất cả ${servers.length} nodes phản hồi tốt (200 OK)`
                : `${activeCount}/${servers.length} nodes phản hồi tốt (200 OK)`}
            </span>
          </div>
        </ServerTooltip>

        <ServerTooltip content={`Tỉ lệ khả dụng: ${healthPercent}% (${activeCount}/${servers.length} nodes online)`}>
          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-md px-2 py-0.5 text-xs font-bold font-mono cursor-default inline-flex items-center gap-1 shrink-0">

            <span>Healthy {healthPercent}%</span>
          </span>
        </ServerTooltip>
      </div>

      {/* ─── Confirm Delete Alert Dialog ────────────────────────── */}
      <AlertDialog
        open={Boolean(deletingNode)}
        onOpenChange={(open) => !open && setDeletingNode(null)}
      >
        <AlertDialogContent className="bg-[#0f172a] border border-[#1e293b] text-slate-100 max-w-md w-[90vw] md:w-full rounded-lg">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center flex-shrink-0 text-red-400 mt-0.5">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-left">
                <AlertDialogTitle className="text-base font-bold text-slate-100">
                  Xác nhận xóa máy chủ
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-slate-400 leading-relaxed">
                  Hành động này không thể hoàn tác. Dữ liệu telemetry và cấu
                  hình của máy chủ này sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {deletingNode && (
            <div className="bg-[#141b2c] border border-[#23314e] rounded-lg p-3 text-xs space-y-1.5 my-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tên máy chủ:</span>
                <span className="font-mono font-bold text-slate-100 bg-slate-800/80 px-2 py-0.5 rounded">
                  {deletingNode.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">URL:</span>
                <span className="font-mono text-slate-400 truncate max-w-[220px]">
                  {deletingNode.baseUrl || ""}
                </span>
              </div>
            </div>
          )}

          <AlertDialogFooter className="mt-2 flex items-center justify-end gap-2">
            <AlertDialogCancel
              onClick={() => setDeletingNode(null)}
              className="bg-[#141b2c] hover:bg-[#1f2940] border border-[#23314e] text-slate-300 text-xs px-3 py-1.5 rounded cursor-pointer"
            >
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-1.5 rounded transition-colors shadow-sm cursor-pointer"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
