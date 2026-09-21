// ============================================================
// ADSUN Dashboard — Header.tsx
// Redesigned Top Navigation Bar with Glassmorphism, Dynamic Telemetry Beacon,
// Micro-animations, and Modern UX/UI Controls
// ============================================================

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  ChevronDown,
  Activity,
  Clock,
  Check,
  Sun,
  Moon,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { POLLING_INTERVALS } from "../../constants";
import { useUIStore } from "../../store/useUIStore";
import { useServerStore } from "../../store/useServerStore";

export function Header() {
  // Store bindings
  const servers = useServerStore((state) => state.servers);
  const forceSync = useServerStore((state) => state.forceSync);
  const lastSyncAt = useUIStore((state) => state.lastSyncAt);
  const pollingInterval = useUIStore((state) => state.pollingInterval);
  const setPollingInterval = useUIStore((state) => state.setPollingInterval);
  const settings = useUIStore((state) => state.settings);
  const updateSettings = useUIStore((state) => state.updateSettings);
  const openModal = useUIStore((state) => state.openModal);

  const theme = settings?.theme || "light";
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Manual refresh with tactile feedback
  const handleRefresh = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await forceSync();
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  // Update relative time since last sync
  useEffect(() => {
    setSecondsAgo(Math.max(0, Math.floor((Date.now() - lastSyncAt) / 1000)));

    const timer = setInterval(() => {
      setSecondsAgo(Math.max(0, Math.floor((Date.now() - lastSyncAt) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastSyncAt]);

  const totalServers = servers.length;
  const activeServers = servers.filter(
    (s: any) => s.status !== "offline",
  ).length;
  const degradedServers = servers.filter(
    (s: any) => s.status === "degraded",
  ).length;

  const isAllHealthy =
    totalServers > 0 && activeServers === totalServers && degradedServers === 0;
  const isDegraded =
    degradedServers > 0 || (activeServers > 0 && activeServers < totalServers);

  const toggleTheme = () => {
    updateSettings({
      ...settings,
      theme: theme === "dark" ? "light" : "dark",
    });
  };

  return (
    <header className="sticky top-0 z-40 h-14 px-3 sm:px-6 flex items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl shadow-xs transition-colors select-none">
      {/* Ambient gradient top hairline */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-teal-500/0 dark:via-blue-500/40 pointer-events-none" />

      {/* ─── 1. Left: Brand & Live Status ─────────────────────── */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-blue-600 dark:to-indigo-600 text-white shadow-md shadow-emerald-500/20 dark:shadow-blue-600/30 ring-1 ring-white/20 select-none">
            <Activity className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 dark:bg-cyan-400 ring-2 ring-white dark:ring-[#0b0f19]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                ADSUN
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:bg-blue-500/20 dark:text-blue-300 border border-emerald-500/20 dark:border-blue-500/30 select-none">
                METRICS
              </span>
            </div>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium hidden md:inline tracking-tight">
              Real-time Node Observability
            </span>
          </div>
        </div>

        {/* Live Status Health Pill */}
        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border shadow-2xs transition-colors duration-200 ${
            totalServers === 0
              ? "bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              : isDegraded
              ? "bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/25 dark:border-amber-700/40 text-amber-800 dark:text-amber-300"
              : !isAllHealthy
              ? "bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/25 dark:border-rose-700/40 text-rose-800 dark:text-rose-300"
              : "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/25 dark:border-emerald-700/40 text-emerald-800 dark:text-emerald-300"
          }`}
        >
          {/* Animated Radar Beacon */}
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                totalServers === 0
                  ? "bg-slate-400"
                  : isDegraded
                  ? "bg-amber-400"
                  : !isAllHealthy
                  ? "bg-rose-400"
                  : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                totalServers === 0
                  ? "bg-slate-400"
                  : isDegraded
                  ? "bg-amber-500"
                  : !isAllHealthy
                  ? "bg-rose-500"
                  : "bg-emerald-500"
              }`}
            />
          </span>

          {/* Text indicators */}
          <span className="font-semibold whitespace-nowrap text-[11.5px] text-slate-800 dark:text-slate-200">
            {totalServers === 0
              ? "No nodes"
              : `${activeServers}/${totalServers} online`}
          </span>

          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>

          <span className="text-slate-600 dark:text-slate-400 font-mono text-[10.5px] hidden sm:inline whitespace-nowrap">
            {secondsAgo === 0 ? "just now" : `${secondsAgo}s ago`}
          </span>
        </div>
      </div>

      {/* ─── 2. Right: Controls ────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Polling Interval Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="header-interval-trigger"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/60 transition-all duration-150 cursor-pointer shadow-2xs group"
              title="Thay đổi tần suất đồng bộ tự động"
            >
              <Clock className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="font-semibold">{pollingInterval}s</span>
              <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl p-1.5"
          >
            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
              <span>Auto-Sync Interval</span>
              <Clock className="h-3 w-3" />
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/80 my-1" />
            {POLLING_INTERVALS.map((sec) => {
              const isSelected = pollingInterval === sec;
              return (
                <DropdownMenuItem
                  key={sec}
                  onClick={() => setPollingInterval(sec)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-emerald-500/10 dark:bg-blue-500/15 text-emerald-600 dark:text-blue-400 font-semibold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span>{sec} seconds</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-blue-400" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh Now with Spin Micro-animation */}
        <button
          id="header-refresh-btn"
          onClick={handleRefresh}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/60 transition-all duration-150 cursor-pointer shadow-2xs active:scale-95 group disabled:opacity-70"
          title="Làm mới dữ liệu telemetry ngay lập tức"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              isSyncing
                ? "animate-spin text-emerald-600 dark:text-blue-400"
                : "text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-blue-400 group-hover:rotate-180 transition-all duration-500"
            }`}
          />
          <span className="hidden sm:inline font-semibold">
            {isSyncing ? "Syncing..." : "Refresh"}
          </span>
        </button>

        {/* Settings Toggle */}
        <button
          id="header-settings-btn"
          onClick={() => openModal("settings")}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/60 transition-all duration-150 shadow-2xs group cursor-pointer active:scale-95"
          title="Tùy chỉnh ngưỡng cảnh báo (Thresholds)"
        >
          <Settings className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-100 group-hover:rotate-45 transition-transform duration-300" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700/80 mx-0.5 hidden sm:block" />

        {/* Theme Toggle (Sun / Moon) */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/60 transition-all duration-150 shadow-2xs group cursor-pointer active:scale-95"
          title={
            theme === "dark"
              ? "Chuyển sang giao diện Sáng"
              : "Chuyển sang giao diện Tối"
          }
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400 group-hover:rotate-90 transition-transform duration-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300 drop-shadow-[0_0_6px_rgba(99,102,241,0.3)]" />
          )}
        </button>
      </div>
    </header>
  );
}
