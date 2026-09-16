// ============================================================
// ADSUN Dashboard — ServerConfigTable.tsx
// "Cấu hình & Kết nối Server Telemetry (6/6 Nodes)" Table
// ============================================================

import React, { useState } from "react";
import {
  Copy,
  Trash2,
  Sliders,
  Check,
  RefreshCw,
  Plus,
  Settings2,
  Rocket,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import type { ServerNode } from "../../types";
import { Badge } from "../ui/badge";

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
import { useDashboardStore } from "../../store/useDashboardStore";
import { serverApi } from "../../api/serverApi";

interface ServerConfigTableProps {
  isCollapsed?: boolean;
}

export function ServerConfigTable({
  isCollapsed = false,
}: ServerConfigTableProps) {
  const servers = useDashboardStore((state) => state.servers);
  const openModal = useDashboardStore((state) => state.openModal);
  const setEditingNode = useDashboardStore((state) => state.setEditingNode);
  const deleteServer = useDashboardStore((state) => state.deleteServer);
  const updateNodeStatus = useDashboardStore(
    (state) => state.updateServerStatus,
  );
  const pollingInterval = useDashboardStore((state) => state.pollingInterval);
  const toast = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pingingNodeId, setPingingNodeId] = useState<string | null>(null);
  const [deletingNode, setDeletingNode] = useState<ServerNode | null>(null);

  if (isCollapsed) return null;

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
    } catch (error) {
      toast.error(`Ping ${node.name} thất bại: Timeout hoặc Sai Token`);
    } finally {
      setPingingNodeId(null); // Tắt icon loading
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
  const handleRowClick = (node: ServerNode) => {};

  const handleAddServer = () => {
    setEditingNode(null);
    openModal("addEdit");
  };

  return (
    <section className="mb-4">
      {/* ─── Header: Title, Auto-Discovery Badge, SRE Description, Add Server ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* <Sliders className="h-4 w-4 text-slate-600 dark:text-slate-300" /> */}
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Server: ({servers.length}/{servers.length})
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddServer}
            className="flex items-center gap-1 bg-[#49cc90] hover:bg-[#3db880] text-slate-950 font-bold dark:bg-[#2563eb] dark:hover:bg-blue-600 dark:text-white px-2.5 py-1 rounded text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Thêm server</span>
          </button>
        </div>
      </div>

      {/* ─── Table Container ───────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-[#1b253b] rounded-md overflow-x-auto shadow-xs transition-colors">
        <table className="w-full text-xs text-left border-collapse min-w-[760px]">
          {/* Table Head */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1a2336] bg-[#f8fafc] dark:bg-[#0f1422] text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="px-3 py-2 w-24 text-center">Trạng thái</th>
              <th className="px-3 py-2 w-44">Server Tag</th>
              <th className="px-3 py-2 hidden md:table-cell">
                Endpoint Telemetry Base URL
              </th>
              <th className="px-3 py-2 w-36 hidden sm:table-cell">
                Access Token
              </th>
              <th className="px-3 py-2 w-28 text-center hidden lg:table-cell">
                Auto-Sync
              </th>
              <th className="px-3 py-2 w-40 text-right">Thao tác Quản trị</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-[#151e30]">
            {servers.map((node) => {
              const isOffline = node.status === "offline";
              const isDegraded = node.status === "degraded";
              const tokenMask = node.accessToken
                ? `••••${node.accessToken.slice(-4)}`
                : "••••ba6c";

              return (
                <tr
                  key={node.id}
                  onClick={() => handleRowClick(node)}
                  className={`transition-colors cursor-pointer ${
                    isOffline
                      ? "bg-slate-50/50 dark:bg-[#0f1422]/50 opacity-60 hover:opacity-80 grayscale"
                      : isDegraded
                        ? "bg-red-50/40 dark:bg-[#180f15]/80 hover:bg-red-50/70 dark:hover:bg-[#20131c]"
                        : "hover:bg-slate-50/80 dark:hover:bg-[#121929]"
                  }`}
                >
                  {/* Trạng thái */}
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex justify-center items-center">
                      <Badge
                        variant={node.status}
                        className="uppercase text-[10px] px-2 py-0"
                      >
                        {node.status}
                      </Badge>
                    </div>
                  </td>

                  {/* Server Tag */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {node.name}
                      </span>
                    </div>
                  </td>

                  {/* Endpoint URL */}
                  <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap hidden md:table-cell">
                    <span
                      className={
                        isOffline
                          ? "italic text-slate-400 dark:text-slate-500"
                          : "text-slate-700 dark:text-slate-300"
                      }
                    >
                      {node.baseUrl ||
                        `https://${node.name.toLowerCase()}.adsun.vn/metrics`}
                    </span>
                  </td>

                  {/* Access Token */}
                  <td className="px-3 py-2.5 whitespace-nowrap hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 font-mono text-slate-500 dark:text-slate-400">
                      <span>{tokenMask}</span>
                      <button
                        onClick={(e) => handleCopyToken(node, e)}
                        className="p-1 hover:text-slate-900 dark:hover:text-white transition-colors text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                        title="Copy token"
                      >
                        {copiedId === node.id ? (
                          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Auto-Sync */}
                  <td className="px-3 py-2.5 text-center whitespace-nowrap hidden lg:table-cell">
                    {isOffline ? (
                      <span className="inline-block bg-[#fae7e7] text-[#991b1b] border border-[#fca5a5] dark:bg-[#381318] dark:text-[#f87171] dark:border-[#6d2028] text-[11px] font-mono px-2 py-0.5 rounded font-medium">
                        Lỗi xác thực
                      </span>
                    ) : (
                      <span className="inline-block bg-[#e8f6f0] text-[#10663e] border border-[#a3e5c9] dark:bg-[#0c241b] dark:text-emerald-400 dark:border-[#154d39] text-[11px] font-mono px-2 py-0.5 rounded font-medium">
                        {`${pollingInterval} s` || "??s"}
                      </span>
                    )}
                  </td>

                  {/* Thao tác Quản trị */}
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {isOffline ? (
                        <button
                          onClick={(e) => handleTestPing(node, e)}
                          disabled={pingingNodeId === node.id}
                          className="bg-blue-50 dark:bg-[#1c3359] hover:bg-blue-100 dark:hover:bg-[#25457a] border border-blue-200 dark:border-[#2b518c] text-blue-700 dark:text-blue-200 text-xs px-2 py-0.5 rounded cursor-pointer font-medium transition-colors flex items-center gap-1"
                        >
                          {pingingNodeId === node.id && (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          )}
                          Thử lại
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleTestPing(node, e)}
                          disabled={pingingNodeId === node.id}
                          className="bg-slate-100 dark:bg-[#141b2c] hover:bg-slate-200 dark:hover:bg-[#1f2940] border border-slate-300 dark:border-[#23314e] text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1"
                        >
                          {pingingNodeId === node.id && (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          )}
                          <Rocket className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={(e) => handleEdit(node, e)}
                        className="bg-slate-100 dark:bg-[#141b2c] hover:bg-slate-200 dark:hover:bg-[#1f2940] border border-slate-300 dark:border-[#23314e] text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingNode(node);
                        }}
                        className="bg-slate-100 dark:bg-[#141b2c] hover:bg-red-100 dark:hover:bg-red-950/60 border border-slate-300 dark:border-[#23314e] text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 p-1 rounded cursor-pointer transition-colors"
                        title="Xóa server"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
                  Xác nhận xóa Server Node
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-slate-400 leading-relaxed">
                  Hành động này không thể hoàn tác. Dữ liệu telemetry và cấu
                  hình của node này sẽ bị gỡ bỏ vĩnh viễn khỏi dashboard.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {deletingNode && (
            <div className="bg-[#141b2c] border border-[#23314e] rounded-lg p-3 text-xs space-y-1.5 my-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tên Server:</span>
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
