// ============================================================
// ADSUN Dashboard — ColumnsFilterBar.tsx
// Thanh công cụ lọc cho Khu Vực Endpoint Server (ServerColumnsMatrix)
// ============================================================

import React from "react";
import {
  X,
  Server,
  RotateCcw,
  ChevronDown,
  Activity,
  Layers,
} from "lucide-react";
import type {
  ServerNode,
  ServerStatus,
  HttpMethod,
} from "../../types";
import { useUIStore } from "../../store/useUIStore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

import {
  getMethodBadgeStyle,
  STATUS_OPTIONS,
  STATUS_DOT_COLORS,
} from "../../constants/metricTheme";

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

interface ColumnsFilterBarProps {
  servers: ServerNode[];
}

export function ColumnsFilterBar({ servers }: ColumnsFilterBarProps) {
  const columnsFilter = useUIStore((state) => state.columnsFilter);
  const setColumnsFilter = useUIStore((state) => state.setColumnsFilter);
  const resetColumnsFilter = useUIStore((state) => state.resetColumnsFilter);

  const isFiltered =
    columnsFilter.serverIds.length > 0 ||
    columnsFilter.serverStatus.length > 0 ||
    columnsFilter.endpointMethod.length > 0;

  const selectedServerCount =
    columnsFilter.serverIds.length === 0
      ? servers.length
      : columnsFilter.serverIds.length;

  // ── Server Toggle ───────────────────────────────────────────
  const handleToggleServer = (serverId: string) => {
    let newIds: string[];
    if (columnsFilter.serverIds.length === 0) {
      newIds = servers.filter((s) => s.id !== serverId).map((s) => s.id);
    } else if (columnsFilter.serverIds.includes(serverId)) {
      newIds = columnsFilter.serverIds.filter((id) => id !== serverId);
    } else {
      newIds = [...columnsFilter.serverIds, serverId];
      if (newIds.length === servers.length) {
        newIds = [];
      }
    }
    setColumnsFilter({ serverIds: newIds });
  };

  // ── Status Toggle ───────────────────────────────────────────
  const handleToggleStatus = (status: ServerStatus) => {
    const isSelected = columnsFilter.serverStatus.includes(status);
    let newStatus: ServerStatus[];
    if (isSelected) {
      newStatus = columnsFilter.serverStatus.filter((s) => s !== status);
    } else {
      newStatus = [...columnsFilter.serverStatus, status];
    }
    setColumnsFilter({ serverStatus: newStatus });
  };

  // ── Method Toggle ───────────────────────────────────────────
  const handleToggleMethod = (method: HttpMethod) => {
    const isSelected = columnsFilter.endpointMethod.includes(method);
    let newMethods: HttpMethod[];
    if (isSelected) {
      newMethods = columnsFilter.endpointMethod.filter((m) => m !== method);
    } else {
      newMethods = [...columnsFilter.endpointMethod, method];
    }
    setColumnsFilter({ endpointMethod: newMethods });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3 bg-slate-50/70 dark:bg-[#0c101d]/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      {/* ─── Server Filter Dropdown ─── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-7 px-2 text-[11px] font-medium border rounded-md gap-1 transition-colors ${
              columnsFilter.serverIds.length > 0
                ? "border-blue-500/60 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                : "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0f1422] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Server className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span>
              Servers ({selectedServerCount}/{servers.length})
            </span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Chọn Server Cards
            </span>
            <button
              onClick={() => setColumnsFilter({ serverIds: [] })}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Hiện tất cả
            </button>
          </div>
          <DropdownMenuSeparator />
          {servers.map((server) => {
            const isChecked =
              columnsFilter.serverIds.length === 0 ||
              columnsFilter.serverIds.includes(server.id);

            return (
              <DropdownMenuCheckboxItem
                key={server.id}
                checked={isChecked}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => handleToggleServer(server.id)}
                className="text-xs py-1.5"
              >
                <div className="flex items-center justify-between w-full pr-1">
                  <span className="font-mono font-medium">{server.name}</span>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ml-2 ${
                      STATUS_DOT_COLORS[server.status] || "bg-slate-400"
                    }`}
                  />
                </div>
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ─── Server Status Quick Filter Pills ─── */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#0f1422] p-0.5 rounded-md border border-slate-200 dark:border-slate-700/80">
        <button
          onClick={() => setColumnsFilter({ serverStatus: [] })}
          className={`h-6 px-2 text-[10.5px] rounded font-medium transition-colors ${
            columnsFilter.serverStatus.length === 0
              ? "bg-slate-200/80 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Tất cả TT
        </button>
        {STATUS_OPTIONS.map((item) => {
          const isActive = columnsFilter.serverStatus.includes(item.status);
          return (
            <button
              key={item.status}
              onClick={() => handleToggleStatus(item.status)}
              className={`h-6 px-1.5 flex items-center gap-1 text-[10.5px] rounded font-medium transition-colors ${
                isActive
                  ? "bg-slate-200/90 dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 opacity-70 hover:opacity-100"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── HTTP Method Filter Pills ─── */}
      <div className="flex items-center gap-0.5 bg-white dark:bg-[#0f1422] p-0.5 rounded-md border border-slate-200 dark:border-slate-700/80">
        <button
          onClick={() => setColumnsFilter({ endpointMethod: [] })}
          className={`h-6 px-2 text-[10.5px] rounded font-medium transition-colors ${
            columnsFilter.endpointMethod.length === 0
              ? "bg-slate-200/80 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          All Method
        </button>
        {HTTP_METHODS.map((method) => {
          const isActive = columnsFilter.endpointMethod.includes(method);
          return (
            <button
              key={method}
              onClick={() => handleToggleMethod(method)}
              className={`h-6 px-1.5 text-[10px] font-mono rounded font-medium transition-all ${
                isActive
                  ? `${getMethodBadgeStyle(method)} font-bold shadow-2xs`
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {method}
            </button>
          );
        })}
      </div>

      {/* ─── Reset Button ─── */}
      {isFiltered && (
        <button
          onClick={resetColumnsFilter}
          title="Đặt lại tất cả bộ lọc endpoint"
          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Đặt lại</span>
        </button>
      )}
    </div>
  );
}
