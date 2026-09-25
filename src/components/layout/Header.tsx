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

  // Status badge color tokens
  const statusConfig = (() => {
    if (totalServers === 0) {
      return {
        text: "Chưa kết nối node",
        badgeBg: "bg-slate-100/90 dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-700/60",
        textColor: "text-slate-600 dark:text-slate-400",
        beaconPing: "bg-slate-400",
        beaconDot: "bg-slate-400",
      };
    }
    if (isDegraded) {
      return {
        text: "Hiệu năng giảm",
        badgeBg: "bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 dark:border-amber-700/50",
        textColor: "text-amber-700 dark:text-amber-300",
        beaconPing: "bg-amber-400",
        beaconDot: "bg-amber-500",
      };
    }
    if (!isAllHealthy) {
      return {
        text: "Cần chú ý",
        badgeBg: "bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/30 dark:border-rose-700/50",
        textColor: "text-rose-700 dark:text-rose-300",
        beaconPing: "bg-rose-400",
        beaconDot: "bg-rose-500",
      };
    }
    return {
      text: "Hệ thống ổn định",
      badgeBg: "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 dark:border-emerald-700/50",
      textColor: "text-emerald-700 dark:text-emerald-300",
      beaconPing: "bg-emerald-400",
      beaconDot: "bg-emerald-500",
    };
  })();

  return (
    <header className="sticky top-0 z-40 h-16 px-3.5 sm:px-6 flex items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#090d16]/85 backdrop-blur-xl shadow-2xs transition-colors select-none">
      {/* Ambient gradient top hairline accent */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-emerald-500/0 dark:via-cyan-400/40 pointer-events-none" />

      {/* ─── 1. Left: Brand & System Telemetry Beacon ─────────────────────── */}
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 flex-shrink-0 group cursor-default">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden ring-1 ring-slate-200/90 dark:ring-slate-700/70 bg-white dark:bg-slate-900 shadow-xs transition-transform group-hover:scale-105 duration-200">
            <img
              src="/image-meme.png"
              alt="Brand Logo"
              className="w-full h-full object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#090d16]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[15px] tracking-tight bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                ADSUN
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9.5px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
                METRICS
              </span>
            </div>
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium hidden md:inline tracking-tight">
              Hệ thống giám sát
            </span>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="h-5 w-px bg-slate-200/80 dark:bg-slate-800 hidden sm:block" />

        {/* Live Status Health Beacon */}
        <div
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-medium border shadow-2xs transition-all duration-200 ${statusConfig.badgeBg}`}
        >
          {/* Animated Radar Beacon */}
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-70 ${statusConfig.beaconPing}`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusConfig.beaconDot}`}
            />
          </span>

          {/* Status Label */}
          <span
            className={`font-semibold text-[11.5px] tracking-tight whitespace-nowrap ${statusConfig.textColor}`}
          >
            {statusConfig.text}
          </span>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">
            •
          </span>

          {/* Active Nodes Count */}
          <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <span className="font-bold">{activeServers}</span>
            <span className="text-slate-400 dark:text-slate-500">/</span>
            <span>{totalServers}</span>
            <span className="font-sans text-slate-500 dark:text-slate-400 text-[10.5px]">
              nodes
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 hidden md:inline">
            •
          </span>

          {/* Elapsed Time */}
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[10.5px] hidden md:inline whitespace-nowrap">
            {secondsAgo === 0 ? "vừa xong" : `${secondsAgo}s trước`}
          </span>
        </div>
      </div>

      {/* ─── 2. Right: Action Controls ────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Polling Interval Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="header-interval-trigger"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/60 transition-all duration-150 cursor-pointer shadow-2xs group focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              title="Thay đổi tần suất đồng bộ tự động"
            >
              <Clock className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="font-semibold">{pollingInterval}s</span>
              <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xl p-1.5"
          >
            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
              <span>Tự động đồng bộ</span>
              <Clock className="h-3 w-3" />
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/80 my-1" />
            {POLLING_INTERVALS.map((sec) => {
              const isSelected = pollingInterval === sec;
              return (
                <DropdownMenuItem
                  key={sec}
                  onClick={() => setPollingInterval(sec)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${isSelected
                      ? "bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                >
                  <span>{sec} giây</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/60 transition-all duration-150 cursor-pointer shadow-2xs active:scale-95 group disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          title="Làm mới dữ liệu telemetry ngay lập tức"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isSyncing
                ? "animate-spin text-blue-600 dark:text-blue-400"
                : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:rotate-180 transition-all duration-500"
              }`}
          />
          <span className="hidden sm:inline font-semibold">
            {isSyncing ? "Đang đồng bộ..." : "Đồng bộ"}
          </span>
        </button>

        {/* Settings Toggle */}
        <button
          id="header-settings-btn"
          onClick={() => openModal("settings")}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/60 transition-all duration-150 shadow-2xs group cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          title="Tùy chỉnh ngưỡng cảnh báo (Thresholds)"
        >
          <Settings className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-100 group-hover:rotate-45 transition-transform duration-300" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700/80 mx-0.5 hidden sm:block" />

        {/* Theme Toggle (Sun / Moon) */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/60 transition-all duration-150 shadow-2xs group cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          title={
            theme === "dark"
              ? "Chuyển sang giao diện Sáng"
              : "Chuyển sang giao diện Tối"
          }
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400 group-hover:rotate-90 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
          )}
        </button>
      </div>
    </header>
  );
}
